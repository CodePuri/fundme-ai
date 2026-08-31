import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { getPublicShareReport, createOrGetShareToken } from "../../lib/assessment/share.ts";
import { claimAssessmentForUser, saveAssessmentToDatabase, getLatestAssessmentForUser, getAssessmentByClaimToken } from "../../lib/assessment/database.ts";
import { checkRateLimit } from "../../lib/security/rate-limit.ts";
import { sanitizeAnalyticsProperties } from "../../lib/analytics/events.ts";

const STAGING_SUPABASE_URL = process.env.SUPABASE_URL || "https://nnzdplkjizwgsalizijd.supabase.co";
const STAGING_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uemRwbGtqaXp3Z3NhbGl6aWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTMyNTcsImV4cCI6MjEwMzY2OTI1N30.2CaimTCv6mW0TTclGCP7rP9RknVVKpgnSSj6yGuvMts";

test("Security: Anonymous client cannot call private RPCs directly over Supabase PostgREST", async () => {
  const anonClient = createClient(STAGING_SUPABASE_URL, STAGING_ANON_KEY, {
    auth: { persistSession: false },
  });

  // 1. Direct RPC rpc_get_latest_assessment without server secret must fail
  const { data: latestData, error: latestErr } = await anonClient.rpc("rpc_get_latest_assessment", {
    p_clerk_user_id: "user_victim_123",
  });
  assert.ok(latestErr, "Direct anonymous call to rpc_get_latest_assessment must be rejected");
  assert.match(latestErr.message, /permission denied|Access denied/i);

  // 2. Direct RPC rpc_save_assessment without server secret must fail
  const { error: saveErr } = await anonClient.rpc("rpc_save_assessment", {
    p_claim_token: "hacked-claim",
    p_clerk_user_id: "user_victim_123",
    p_founder_name: "Hacker",
    p_startup_name: "Hacked",
    p_website_url: null,
    p_report: { readinessScore: 100 },
  });
  assert.ok(saveErr, "Direct anonymous call to rpc_save_assessment must be rejected");
  assert.match(saveErr.message, /permission denied|Access denied/i);

  // 3. Direct RPC rpc_claim_assessment without server secret must fail
  const { error: claimErr } = await anonClient.rpc("rpc_claim_assessment", {
    p_clerk_user_id: "user_hacker",
    p_claim_token: "target-token",
  });
  assert.ok(claimErr, "Direct anonymous call to rpc_claim_assessment must be rejected");
  assert.match(claimErr.message, /permission denied|Access denied/i);

  // 4. Direct RPC rpc_create_or_get_share_token without server secret must fail
  const { error: shareErr } = await anonClient.rpc("rpc_create_or_get_share_token", {
    p_assessment_id: "00000000-0000-0000-0000-000000000000",
  });
  assert.ok(shareErr, "Direct anonymous call to rpc_create_or_get_share_token must be rejected");
  assert.match(shareErr.message, /permission denied|Access denied/i);

  // 5. Direct RPC rpc_get_referral_stats without server secret must fail
  const { error: statsErr } = await anonClient.rpc("rpc_get_referral_stats", {
    p_clerk_user_id: "user_victim_123",
  });
  assert.ok(statsErr, "Direct anonymous call to rpc_get_referral_stats must be rejected");
  assert.match(statsErr.message, /permission denied|Access denied/i);
});

test("Security: Anonymous client cannot read or modify private tables via Supabase Data API", async () => {
  const anonClient = createClient(STAGING_SUPABASE_URL, STAGING_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data: assessments, error: readErr } = await anonClient
    .from("assessments")
    .select("id, founder_name, clerk_user_id, claim_token");
  assert.ok(readErr || (assessments && assessments.length === 0), "Anonymous read must be rejected or return 0 rows");

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
});

test("Security: Anonymous caller CANNOT create a share token for an existing claimed assessment", async () => {
  const userA = "user_owner_alice_" + Date.now();
  const mockReport = {
    rubricVersion: "fundme-demo-rubric@1",
    generatedAt: new Date().toISOString(),
    readinessScore: 65,
    verdict: "Promising",
    conciseVerdict: "Promising.",
    evidenceCoverage: 60,
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

  const saved = await saveAssessmentToDatabase({
    claimToken: "claim-alice-private-" + Date.now(),
    clerkUserId: userA,
    founderName: "Alice",
    startupName: "AliceCo",
    report: mockReport,
  });

  // Anonymous attempt (clerkUserId undefined / omitted) must be rejected
  await assert.rejects(
    async () => {
      await createOrGetShareToken({
        assessmentId: saved.id,
        clerkUserId: undefined,
      });
    },
    /Access denied/
  );
});

test("Security: Authenticated Founder B cannot hijack or share Founder A assessment", async () => {
  const userA = "user_sec_alice_" + Date.now();
  const userB = "user_sec_bob_" + Date.now();
  const claimTokenA = "claim-alice-auth-" + Date.now();

  const mockReport = {
    rubricVersion: "fundme-demo-rubric@1",
    generatedAt: new Date().toISOString(),
    readinessScore: 70,
    verdict: "Strong",
    conciseVerdict: "Strong.",
    evidenceCoverage: 70,
    confidence: "high",
    completionState: "complete",
    tractionState: "verified",
    strongestDimension: "founder-credibility",
    weakestDimension: "traction-proof",
    dimensions: [],
    evidence: [],
    findings: [],
    founderReview: { credibility: "", founderMarketFit: "", profilePositioning: "" },
    startupReview: { problem: "", solution: "", market: "", differentiation: "", traction: "", fundingNarrative: "" },
    deckReview: { status: "not-provided", summary: "", findings: [] },
    actions: [],
  };

  const savedA = await saveAssessmentToDatabase({
    claimToken: claimTokenA,
    clerkUserId: userA,
    founderName: "Alice",
    startupName: "AliceCo",
    report: mockReport,
  });

  // 1. Bob cannot claim Alice assessment
  await assert.rejects(
    async () => {
      await claimAssessmentForUser({
        clerkUserId: userB,
        claimToken: claimTokenA,
      });
    },
    /already been claimed by another account/
  );

  // 2. Bob cannot generate share token for Alice assessment
  await assert.rejects(
    async () => {
      await createOrGetShareToken({
        assessmentId: savedA.id,
        clerkUserId: userB,
      });
    },
    /Access denied/
  );

  // 3. Bob cannot fetch Alice assessment via getLatestAssessmentForUser
  const bobLatest = await getLatestAssessmentForUser(userB);
  assert.equal(bobLatest.hasAssessment, false);

  // 4. Bob cannot fetch Alice claimed assessment via getAssessmentByClaimToken
  await assert.rejects(
    async () => {
      await getAssessmentByClaimToken(claimTokenA, userB);
    },
    /Access denied/
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
    clerkUserId: "user_share_owner_valid",
    founderName: "Owner",
    startupName: "OwnerCo",
    report: mockReport,
  });

  const { shareToken } = await createOrGetShareToken({
    assessmentId: saved.id,
    clerkUserId: "user_share_owner_valid",
  });

  const publicReport = await getPublicShareReport(shareToken);
  assert.ok(publicReport, "Public share report must resolve");
  assert.equal(publicReport.startupName, "OwnerCo");
  assert.equal(publicReport.readinessScore, 68);

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

  const config = { maxRequests: 5, windowMs: 1000 };

  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(mockReq, "test-action", config);
    assert.equal(res.allowed, true);
  }

  const blocked = checkRateLimit(mockReq, "test-action", config);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
});
