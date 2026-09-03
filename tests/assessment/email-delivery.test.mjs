import test from "node:test";
import assert from "node:assert/strict";
import { assertStagingIntegrationEnvironment } from "../helpers/staging-integration-environment.mjs";

assertStagingIntegrationEnvironment();

const report = {
  rubricVersion: "fundme-rubric@2026.08-calibrated-v1",
  generatedAt: new Date().toISOString(),
  readinessScore: 64,
  verdict: "Promising foundation",
  conciseVerdict: "Promising foundation.",
  evidenceCoverage: 56,
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

test("first-save email delivery is recorded only once for an owned assessment", async () => {
  const database = await import("../../lib/assessment/database.ts");
  assert.equal(typeof database.getFirstSaveEmailDeliveryStatus, "function");
  assert.equal(typeof database.recordFirstSaveEmailDelivery, "function");

  const clerkUserId = `user_email_delivery_${Date.now()}`;
  const saved = await database.saveAssessmentToDatabase({
    claimToken: `claim-email-delivery-${Date.now()}`,
    clerkUserId,
    founderName: "Email Test Founder",
    startupName: "Email Test Startup",
    report,
  });

  assert.equal(
    await database.getFirstSaveEmailDeliveryStatus({ assessmentId: saved.id, clerkUserId }),
    false,
  );
  assert.equal(
    await database.recordFirstSaveEmailDelivery({ assessmentId: saved.id, clerkUserId, providerMessageId: "email-test-1" }),
    true,
  );
  assert.equal(
    await database.recordFirstSaveEmailDelivery({ assessmentId: saved.id, clerkUserId, providerMessageId: "email-test-2" }),
    false,
  );
  assert.equal(
    await database.getFirstSaveEmailDeliveryStatus({ assessmentId: saved.id, clerkUserId }),
    true,
  );
});
