import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("product analytics retains only approved conversion breakdowns", async () => {
  const analytics = await import("../../lib/analytics/events.ts");
  const clean = analytics.sanitizeAnalyticsProperties({
    source: "hero",
    hasReferral: true,
    scoreBucket: "medium",
    utm_source: "founder-community",
    readinessScore: 72,
    referralCode: "referral-private-token",
    shareToken: "share-private-token",
    founderName: "Private Founder",
    workspaceUrl: "https://tryfundme.in/app/preview?claim_token=private",
  });

  assert.deepEqual(clean, {
    source: "hero",
    hasReferral: true,
    scoreBucket: "medium",
    utm_source: "founder-community",
  });
});

test("PostHog disables automatic collection surfaces", async () => {
  const source = await readFile(new URL("../../lib/analytics/posthog.ts", import.meta.url), "utf8");
  assert.match(source, /capture_pageview:\s*false/);
  assert.match(source, /capture_pageleave:\s*false/);
  assert.match(source, /autocapture:\s*false/);
  assert.match(source, /disable_session_recording:\s*true/);
});
