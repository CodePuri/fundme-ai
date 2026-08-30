import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { getPublicShareReport } from "../../lib/assessment/share.ts";
import { claimAssessmentForUser, saveAssessmentToDatabase, getSupabaseAdmin } from "../../lib/assessment/database.ts";
import { checkRateLimit } from "../../lib/security/rate-limit.ts";
import { sanitizeAnalyticsProperties } from "../../lib/analytics/events.ts";

const STAGING_SUPABASE_URL = process.env.SUPABASE_URL || "https://nnzdplkjizwgsalizijd.supabase.co";
const STAGING_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uemRwbGtqaXp3Z3NhbGl6aWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTMyNTcsImV4cCI6MjEwMzY2OTI1N30.2CaimTCv6mW0TTclGCP7rP9RknVVKpgnSSj6yGuvMts";

test("Security: Anonymous client cannot read or modify private tables via Supabase Data API", async () => {
  const anonClient = createClient(STAGING_SUPABASE_URL, STAGING_ANON_KEY, {
    auth: { persistSession: false },
  });

  // 1. Attempt anonymous read from assessments
  const { data: assessments, error: readErr } = await anonClient
    .from("assessments")
    .select("id, founder_name, clerk_user_id, claim_token");

  assert.ok(readErr || (assessments && assessments.length === 0), "Anonymous read must be rejected or return 0 rows");

  // 2. Attempt anonymous insert into assessments
  const { error: insertErr } = await anonClient
    .from("assessments")
    .insert({
      claim_token: "hacked-claim-token-" + Date.now(),
      readiness_score: 99,
      verdict: "Hacked",
      confidence: "high",
      completion_state: "complete",
      evidence_coverage: 100,
      rubric_version: "hack@1",
    });

  assert.ok(insertErr, "Anonymous insert into assessments must be denied by RLS/grants");

  // 3. Attempt anonymous read from founder_profiles
  const { data: founders, error: founderErr } = await anonClient
    .from("founder_profiles")
    .select("*");

  assert.ok(founderErr || (founders && founders.length === 0), "Anonymous founder profile read must be denied");

  // 4. Attempt anonymous read from onboarding_submissions
  const { data: onboarding, error: onboardErr } = await anonClient
    .from("onboarding_submissions")
    .select("*");

  assert.ok(onboardErr || (onboarding && onboarding.length === 0), "Anonymous onboarding read must be denied");

  // 5. Attempt anonymous read from referrals
  const { data: referrals, error: refErr } = await anonClient
    .from("referrals")
    .select("*");

  assert.ok(refErr || (referrals && referrals.length === 0), "Anonymous referrals read must be denied");
});

test("Security: BOLA / IDOR Prevention — User A cannot claim an assessment already claimed by User B", async () => {
  const testClaimToken = "claim-bola-test-" + Date.now();
  const userA = "user_test_alice_" + Date.now();
  const userB = "user_test_bob_" + Date.now();

  const mockReport = {
    rubricVersion: "fundme-demo-rubric@1",
    generatedAt: new Date().toISOString(),
    readinessScore: 50,
    verdict: "Needs work",
    conciseVerdict: "Needs work.",
    evidenceCoverage: 40,
    confidence: "medium",
    completionState: "complete",
    tractionState: "unverified",
    strongestDimension: "problem-clarity",
    weakestDimension: "traction-proof",
    dimensions: [],
    evidence: [],
    findings: [],
    founderReview: { credibility: "", founderMarketFit: "", profilePositioning: "" },
    startupReview: { problem: "", solution: "", market: "", differentiation: "", traction: "", fundingNarrative: "" },
    deckReview: { status: "not-provided", summary: "", findings: [] },
    actions: [],
  };

  // 1. Create and claim for User A
  await saveAssessmentToDatabase({
    claimToken: testClaimToken,
    clerkUserId: userA,
    founderName: "Alice",
    startupName: "Alice Startup",
    report: mockReport,
  });

  // 2. User B attempts to claim User A assessment
  await assert.rejects(
    async () => {
      await claimAssessmentForUser({
        clerkUserId: userB,
        claimToken: testClaimToken,
      });
    },
    /already been claimed by another account/,
    "Cross-user claiming must throw authorization error"
  );
});

test("Security: Public share token returns strictly sanitized representation without private data", async () => {
  const mockReport = {
    rubricVersion: "fundme-demo-rubric@1",
    generatedAt: new Date().toISOString(),
    readinessScore: 68,
    verdict: "Promising opportunity",
    conciseVerdict: "Promising.",
    evidenceCoverage: 75,
    confidence: "high",
    completionState: "complete",
    tractionState: "verified",
    strongestDimension: "founder-credibility",
    weakestDimension: "market-clarity",
    dimensions: [{ id: "founder-credibility", label: "Founder credibility", score: 85 }],
    evidence: [{ id: "ev1", quote: "Private founder transcript..." }],
    findings: [{ id: "f1", title: "Strong background", rawQuote: "Private quote" }],
    founderReview: { credibility: "Strong", founderMarketFit: "Aligned", profilePositioning: "Solid" },
    startupReview: { problem: "", solution: "", market: "", differentiation: "", traction: "", fundingNarrative: "" },
    deckReview: { status: "not-provided", summary: "", findings: [] },
    actions: [{ horizon: "fix-now", title: "Polish deck", detail: "Update financial model" }],
  };

  const testClaim = "claim-share-sec-" + Date.now();
  const saved = await saveAssessmentToDatabase({
    claimToken: testClaim,
    clerkUserId: "user_share_owner",
    founderName: "Owner",
    startupName: "OwnerCo",
    report: mockReport,
  });

  const { createOrGetShareToken } = await import("../../lib/assessment/share.ts");
  const { shareToken } = await createOrGetShareToken({ assessmentId: saved.id });

  const publicReport = await getPublicShareReport(shareToken);
  assert.ok(publicReport, "Public share report must resolve");

  // Verify allowed fields exist
  assert.equal(publicReport.startupName, "OwnerCo");
  assert.equal(publicReport.readinessScore, 68);
  assert.equal(publicReport.verdict, "Promising opportunity");

  // Verify private fields are completely omitted
  const repObj = publicReport;
  assert.equal(repObj.clerk_user_id, undefined);
  assert.equal(repObj.claim_token, undefined);
  assert.equal(repObj.claimToken, undefined);
  assert.equal(repObj.raw_session, undefined);
  assert.equal(repObj.rawSession, undefined);
  assert.equal(repObj.email, undefined);
});

test("Security: Rate Limiter blocks excessive requests per IP window", () => {
  const mockReq = {
    headers: new Headers({ "x-forwarded-for": "198.51.100.42" }),
  };

  // Allow 5 requests in a 1-second window
  const config = { maxRequests: 5, windowMs: 1000 };

  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(mockReq, "test-action", config);
    assert.equal(res.allowed, true, `Request ${i + 1} should be allowed`);
  }

  // 6th request must be blocked
  const blocked = checkRateLimit(mockReq, "test-action", config);
  assert.equal(blocked.allowed, false, "6th request should be rate-limited");
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.resetInMs > 0);
});
