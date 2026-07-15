import assert from "node:assert/strict";
import test from "node:test";

import { isGrillPublicPath } from "../../lib/grill/public-routes";

test("the Grill page and API bypass Clerk while unrelated routes do not", () => {
  assert.equal(isGrillPublicPath("/grill"), true);
  assert.equal(isGrillPublicPath("/grill/result"), true);
  assert.equal(isGrillPublicPath("/api/grill/analyze"), true);
  assert.equal(isGrillPublicPath("/onboarding"), false);
  assert.equal(isGrillPublicPath("/api/onboarding"), false);
  assert.equal(isGrillPublicPath("/login"), false);
  assert.equal(isGrillPublicPath("/app/matches"), false);
});
