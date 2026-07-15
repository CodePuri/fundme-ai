import type { ArtifactResult } from "./types";

export function getProfileEvidenceText(
  pastedProfileText: string,
  artifacts: ArtifactResult[],
) {
  const profileDocument = artifacts.find(
    (artifact) =>
      artifact.kind === "profile_document" && artifact.status === "parsed",
  );

  return [pastedProfileText.trim(), profileDocument?.text.trim()]
    .filter((value): value is string => Boolean(value))
    .join("\n\n");
}
