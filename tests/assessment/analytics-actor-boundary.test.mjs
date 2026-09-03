import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("analytics derives the actor from Clerk instead of trusting browser input", async () => {
  const source = await readFile(new URL("../../app/api/analytics/event/route.ts", import.meta.url), "utf8");

  assert.match(source, /import\s*\{\s*auth\s*\}\s*from\s*["']@clerk\/nextjs\/server["']/);
  assert.doesNotMatch(source, /const\s*\{[^}]*clerkUserId/);
  assert.match(source, /const\s*\{\s*userId\s*\}\s*=\s*await\s+auth\(\)/);
  assert.match(source, /clerkUserId:\s*userId/);
});
