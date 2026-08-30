import test from "node:test";
import assert from "node:assert/strict";
import { saveAssessmentToDatabase, getLatestAssessmentForUser } from "../../lib/assessment/database.ts";
import { createOrGetShareToken, getPublicShareReport } from "../../lib/assessment/share.ts";

test("Security: Cross-User Assessment Isolation — User A cannot fetch User B assessment", async () => {
  const userA = "user_sec_alice_" + Date.now();
  const userB = "user_sec_bob_" + Date.now();

  const reportA = {
    rubricVersion: "fundme-demo-rubric@1",
    generatedAt: new Date().toISOString(),
    readinessScore: 75,
    verdict: "Strong opportunity",
    conciseVerdict: "Strong.",
    evidenceCoverage: 80,
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

  // Save for Alice
  await saveAssessmentToDatabase({
    claimToken: "claim-alice-" + Date.now(),
    clerkUserId: userA,
    founderName: "Alice",
    startupName: "AliceCo",
    report: reportA,
  });

  // Query as Bob
  const bobLatest = await getLatestAssessmentForUser(userB);
  assert.equal(bobLatest.hasAssessment, false, "Bob must not see Alice assessment");
  assert.equal(bobLatest.assessment, null);

  // Query as Alice
  const aliceLatest = await getLatestAssessmentForUser(userA);
  assert.equal(aliceLatest.hasAssessment, true);
  assert.equal(aliceLatest.assessment.founder_name, "Alice");
  assert.equal(aliceLatest.assessment.startup_name, "AliceCo");
});

test("Security: Share Token Hijack Prevention — User B cannot generate share token for User A assessment", async () => {
  const userA = "user_share_alice_" + Date.now();
  const userB = "user_share_bob_" + Date.now();

  const report = {
    rubricVersion: "fundme-demo-rubric@1",
    generatedAt: new Date().toISOString(),
    readinessScore: 60,
    verdict: "Promising",
    conciseVerdict: "Promising.",
    evidenceCoverage: 60,
    confidence: "medium",
    completionState: "complete",
    tractionState: "unverified",
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

  const saved = await saveAssessmentToDatabase({
    claimToken: "claim-share-owner-" + Date.now(),
    clerkUserId: userA,
    founderName: "Alice",
    startupName: "AliceCo",
    report,
  });

  // User B tries to create a share token for Alice assessment
  await assert.rejects(
    async () => {
      await createOrGetShareToken({
        assessmentId: saved.id,
        clerkUserId: userB,
      });
    },
    /Access denied/
  );
});

test("Security: Non-existent or forged share token returns null gracefully", async () => {
  const forged = await getPublicShareReport("sh_forged_non_existent_token_12345");
  assert.equal(forged, null, "Forged share token must return null");

  const empty = await getPublicShareReport("");
  assert.equal(empty, null, "Empty share token must return null");
});
