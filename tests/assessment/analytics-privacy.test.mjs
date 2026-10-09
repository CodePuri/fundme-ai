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

test("Next configuration does not define a build-time env map", async () => {
  const source = await readFile(new URL("../../next.config.ts", import.meta.url), "utf8");

  assert.doesNotMatch(source, /\benv\s*:/);
});
test("Supabase admin client never falls back to the public anonymous key", async () => {
  const { getSupabaseAdmin } = await import("../../lib/assessment/database.ts");
  const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-test-key";
    assert.throws(getSupabaseAdmin, /SUPABASE_SERVICE_ROLE_KEY/);
  } finally {
    if (originalServiceRoleKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
    if (originalAnonKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
  }
});
