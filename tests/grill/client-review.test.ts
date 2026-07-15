import assert from "node:assert/strict";
import test from "node:test";

import { buildClientReviewMissingInformation } from "../../lib/grill/client/review";
import { strongIntake } from "./fixtures";

test("selected files are described as pending instead of already parsed", () => {
  const intake = {
    ...strongIntake,
    founder: { ...strongIntake.founder, profileText: "" },
  };
  const missing = buildClientReviewMissingInformation(intake, {
    profileSelected: true,
    deckSelected: true,
  });

  assert.equal(missing.some((item) => item.field === "founder.profileText"), false);
  assert.equal(missing.some((item) => item.field === "pitchDeck"), false);
  assert.ok(missing.some((item) => item.field === "profileDocumentParsing"));
  assert.ok(missing.some((item) => item.field === "pitchDeckParsing"));
});

test("unselected files remain concrete missing evidence", () => {
  const missing = buildClientReviewMissingInformation(strongIntake, {
    profileSelected: false,
    deckSelected: false,
  });

  assert.ok(missing.some((item) => item.field === "pitchDeck"));
  assert.equal(missing.some((item) => /parsing pending/i.test(item.label)), false);
});
