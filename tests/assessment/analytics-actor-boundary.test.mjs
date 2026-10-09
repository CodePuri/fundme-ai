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

test("referral stats derive the account from Clerk instead of a query parameter", async () => {
  const route = await readFile(new URL("../../app/api/referrals/stats/route.ts", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../../components/assessment/preview-dashboard.tsx", import.meta.url), "utf8");

  assert.match(route, /userId = \(await auth\(\)\)\.userId/);
  assert.match(route, /getFounderReferralStats\(userId, origin\)/);
  assert.doesNotMatch(route, /clerkUserIdQuery|effectiveUserId/);
  assert.doesNotMatch(route, /headers\.get\("origin"\)/);
  assert.match(dashboard, /fetch\("\/api\/referrals\/stats"/);
  assert.doesNotMatch(dashboard, /referrals\/stats\?clerkUserId=/);
});
