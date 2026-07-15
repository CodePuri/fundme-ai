import type { GrillIntake, MissingInformation } from "../types";
import { findMissingInformation } from "../validation";

type PendingFiles = {
  profileSelected: boolean;
  deckSelected: boolean;
};

export function buildClientReviewMissingInformation(
  intake: GrillIntake,
  pendingFiles: PendingFiles,
) {
  let missing = findMissingInformation(intake, []);

  if (pendingFiles.profileSelected) {
    missing = missing.filter((item) => item.field !== "founder.profileText");
    missing.push({
      field: "profileDocumentParsing",
      label: "Profile parsing pending",
      severity: "weak",
      reason:
        "The selected profile document becomes evidence only after server parsing succeeds.",
    });
  }

  if (pendingFiles.deckSelected) {
    missing = missing.filter((item) => item.field !== "pitchDeck");
    missing.push({
      field: "pitchDeckParsing",
      label: "Deck parsing pending",
      severity: "weak",
      reason:
        "The selected deck becomes evidence only after server parsing succeeds.",
    });
  }

  return missing satisfies MissingInformation[];
}
