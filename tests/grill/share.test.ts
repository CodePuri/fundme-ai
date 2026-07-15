import assert from "node:assert/strict";
import test from "node:test";

import { shareOutcomeMessage } from "../../lib/grill/client/share";

test("share feedback distinguishes the native sheet from clipboard fallback", () => {
  assert.equal(shareOutcomeMessage("shared"), "Share sheet opened");
  assert.equal(shareOutcomeMessage("copied"), "Share summary copied");
});
