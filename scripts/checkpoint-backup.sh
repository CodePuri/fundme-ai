#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
CURRENT_BRANCH="$(git -C "$ROOT_DIR" branch --show-current)"
REMOTE_NAME="${REMOTE_NAME:-origin}"
BACKUP_PREFIX="${BACKUP_PREFIX:-checkpoint}"
SANITIZED_BRANCH="${CURRENT_BRANCH//\//-}"
BACKUP_BRANCH="${BACKUP_PREFIX}/${SANITIZED_BRANCH}"
TIMESTAMP="$(date +"%Y-%m-%d %H:%M:%S")"
MESSAGE="${1:-Checkpoint backup from ${CURRENT_BRANCH} at ${TIMESTAMP}}"
TMP_DIR="$(mktemp -d)"
WORKTREE_DIR="${TMP_DIR}/worktree"

cleanup() {
  if [ -d "$WORKTREE_DIR/.git" ] || [ -f "$WORKTREE_DIR/.git" ]; then
    git -C "$ROOT_DIR" worktree remove --force "$WORKTREE_DIR" >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

if [ -z "$CURRENT_BRANCH" ]; then
  echo "Cannot create a checkpoint from a detached HEAD."
  exit 1
fi

if [ -f "$ROOT_DIR/package.json" ] && command -v pnpm >/dev/null 2>&1; then
  echo "Running build before creating checkpoint..."
  pnpm -C "$ROOT_DIR" build
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

git -C "$WORKTREE_DIR" commit -m "$MESSAGE" >/dev/null
git -C "$WORKTREE_DIR" push -u "$REMOTE_NAME" "$BACKUP_BRANCH" >/dev/null

echo "Checkpoint pushed to ${REMOTE_NAME}/${BACKUP_BRANCH}"
