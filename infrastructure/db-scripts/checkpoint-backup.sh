#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
CURRENT_BRANCH="$(git -C "$ROOT_DIR" branch --show-current)"
REMOTE_NAME="${REMOTE_NAME:-origin}"
BACKUP_PREFIX="${BACKUP_PREFIX:-checkpoint}"
CHECKPOINT_SKIP_BUILD="${CHECKPOINT_SKIP_BUILD:-0}"
SANITIZED_BRANCH="${CURRENT_BRANCH//\//-}"
BACKUP_BRANCH="${BACKUP_PREFIX}/${SANITIZED_BRANCH}"
TIMESTAMP="$(date +"%Y-%m-%d %H:%M:%S")"
LABEL="${1:-}"
BUILD_STATUS="not-run"
TMP_DIR="$(mktemp -d)"
WORKTREE_DIR="${TMP_DIR}/worktree"
MESSAGE_FILE="${TMP_DIR}/commit-message.txt"

cleanup() {
  if [ -d "$WORKTREE_DIR/.git" ] || [ -f "$WORKTREE_DIR/.git" ]; then
    git -C "$ROOT_DIR" worktree remove --force "$WORKTREE_DIR" >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

build_commit_message() {
  local file_count area_summary subject diff_stat shown_count seen_areas
  local changed_files=()
  local areas=()
  seen_areas="|"

  while IFS= read -r file; do
    changed_files+=("$file")
  done < <(git -C "$WORKTREE_DIR" diff --cached --name-only)
  file_count="${#changed_files[@]}"

  for file in "${changed_files[@]}"; do
    local area
    if [[ "$file" == */* ]]; then
      area="${file%%/*}"
    else
      area="$file"
    fi

    if [[ "$seen_areas" != *"|$area|"* ]]; then
      areas+=("$area")
      seen_areas="${seen_areas}${area}|"
    fi
  done

  area_summary="$(IFS=", "; echo "${areas[*]}")"
  diff_stat="$(git -C "$WORKTREE_DIR" diff --cached --shortstat || true)"

  if [ -n "$LABEL" ]; then
    subject="checkpoint(${CURRENT_BRANCH}): ${LABEL}"
  else
    subject="checkpoint(${CURRENT_BRANCH}): ${file_count} files across ${area_summary:-repo}"
  fi

  {
    echo "$subject"
    echo
    echo "Source-branch: ${CURRENT_BRANCH}"
    echo "Checkpoint-branch: ${BACKUP_BRANCH}"
    echo "Created-at: ${TIMESTAMP}"
    echo "Validation: ${BUILD_STATUS}"
    echo "Files-changed: ${file_count}"
    if [ -n "$diff_stat" ]; then
      echo "Diff-stat: ${diff_stat}"
    fi
    echo "Areas: ${area_summary:-none}"
    echo
    echo "Changed-paths:"
    shown_count=0
    for file in "${changed_files[@]}"; do
      echo "- ${file}"
      shown_count=$((shown_count + 1))
      if [ "$shown_count" -ge 12 ]; then
        break
      fi
    done
    if [ "$file_count" -gt 12 ]; then
      echo "- ... and $((file_count - 12)) more"
    fi
  } > "$MESSAGE_FILE"
}

if [ -z "$CURRENT_BRANCH" ]; then
  echo "Cannot create a checkpoint from a detached HEAD."
  exit 1
fi

if [ "$CHECKPOINT_SKIP_BUILD" = "1" ]; then
  BUILD_STATUS="skipped"
  echo "Skipping build because CHECKPOINT_SKIP_BUILD=1"
elif [ -f "$ROOT_DIR/package.json" ] && command -v pnpm >/dev/null 2>&1 && grep -q '"build"' "$ROOT_DIR/package.json"; then
  echo "Running build before creating checkpoint..."
  pnpm -C "$ROOT_DIR" build
  BUILD_STATUS="passed"
fi

echo "Preparing backup branch ${BACKUP_BRANCH}..."

git -C "$ROOT_DIR" fetch "$REMOTE_NAME" >/dev/null 2>&1 || true
git -C "$ROOT_DIR" worktree add --detach "$WORKTREE_DIR" HEAD >/dev/null

if git -C "$ROOT_DIR" show-ref --verify --quiet "refs/heads/${BACKUP_BRANCH}"; then
  git -C "$WORKTREE_DIR" switch "$BACKUP_BRANCH" >/dev/null
elif git -C "$ROOT_DIR" show-ref --verify --quiet "refs/remotes/${REMOTE_NAME}/${BACKUP_BRANCH}"; then
  git -C "$WORKTREE_DIR" fetch "$REMOTE_NAME" "${BACKUP_BRANCH}:${BACKUP_BRANCH}" >/dev/null
  git -C "$WORKTREE_DIR" switch "$BACKUP_BRANCH" >/dev/null
else
  git -C "$WORKTREE_DIR" switch -c "$BACKUP_BRANCH" >/dev/null
fi

find "$WORKTREE_DIR" -mindepth 1 -maxdepth 1 ! -name ".git" -exec rm -rf {} +

while IFS= read -r -d '' file; do
  mkdir -p "$WORKTREE_DIR/$(dirname "$file")"
  cp "$ROOT_DIR/$file" "$WORKTREE_DIR/$file"
done < <(git -C "$ROOT_DIR" ls-files -co --exclude-standard -z)

git -C "$WORKTREE_DIR" add -A

if git -C "$WORKTREE_DIR" diff --cached --quiet; then
  echo "No checkpoint changes to commit."
  exit 0
fi

build_commit_message
git -C "$WORKTREE_DIR" commit -F "$MESSAGE_FILE" >/dev/null

if git -C "$ROOT_DIR" remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git -C "$WORKTREE_DIR" push -u "$REMOTE_NAME" "$BACKUP_BRANCH" >/dev/null
  echo "Checkpoint pushed to ${REMOTE_NAME}/${BACKUP_BRANCH}"
else
  echo "Checkpoint committed locally on ${BACKUP_BRANCH}"
fi

git -C "$WORKTREE_DIR" rev-parse --short HEAD
