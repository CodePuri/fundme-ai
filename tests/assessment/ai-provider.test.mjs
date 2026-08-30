import assert from "node:assert/strict";
import test from "node:test";
import { buildStructuredEvidence } from "../../lib/assessment/evidence-model.ts";
import { assessSession } from "../../lib/assessment/engine.ts";
import { synthesizeAssessmentWithAi } from "../../lib/assessment/ai-provider.ts";

test("AI Provider: Real Intelligence, Structured Synthesis & Deterministic Score Preservation", async () => {
  const rawInput = {
    founderName: "Aakash Puri",
    founderRole: "Founder & CEO",
    startupName: "PayPilot AI",
    websiteUrl: "https://stripe.com",
    description: "AI-driven automated payment recovery and reconciliation for subscription SaaS.",
    profileText: "10 years building developer platforms and payments infrastructure.",
  };

  const artifacts = [{
    id: "deck-test-1",
    kind: "pitch-deck",
    name: "paypilot-deck.pdf",
    size: 2048,
    type: "application/pdf",
    status: "attached",
    attachedAt: new Date().toISOString(),
    extractedText: "PayPilot helps SaaS companies recover 15% of lost payment volume. 50 active beta customers, $12k MRR.",
    pageCount: 5,
    detectedSections: ["problem", "solution", "traction", "team", "funding-ask"]
  }];

  const answers = {
    stage: { questionId: "stage", text: "Live beta with 50 paying customers", source: "typed", answeredAt: new Date().toISOString() },
    traction: { questionId: "traction", text: "$12,000 monthly recurring revenue with 15% month over month growth", source: "typed", answeredAt: new Date().toISOString() }
  };

  const evidence = buildStructuredEvidence({
    input: rawInput,
    artifacts,
    answers
  });

  const session = {
    version: 1,
    mode: "demo",
    stage: "result",
    processingState: "assessing",
    input: rawInput,
    artifacts,
    conversation: [],
    answers,
    skippedQuestionIds: [],
    reviewedAt: new Date().toISOString(),
    report: null,
    earlyAccess: { email: "", status: "idle", referralCode: null },
    persistenceWarning: null,
    updatedAt: new Date().toISOString(),
  };

  const deterministicReport = assessSession(session, new Date().toISOString());
  const initialScore = deterministicReport.readinessScore;

  const { report, aiMetadata } = await synthesizeAssessmentWithAi(evidence, deterministicReport);

  // 1. Scoring MUST be preserved exactly
  assert.equal(report.readinessScore, initialScore, "Numerical score must remain deterministic");
  assert.equal(report.dimensions.length, 10, "Dimensions count must remain 10");

  // 2. AI Metadata must be truthful
  assert.ok(["groq", "gemini", "none"].includes(aiMetadata.provider));
  assert.ok(["success", "degraded", "disabled"].includes(aiMetadata.status));

  if (aiMetadata.status === "success") {
    // 3. Structured outputs must be grounded
    assert.ok(report.startupReview.problem.length > 10, "Problem review must be populated");
    assert.ok(report.deckReview.summary.length > 10, "Deck summary must be populated");
    assert.ok(report.actions.length >= 3, "Actions must have at least 3 items");
    assert.ok(aiMetadata.latencyMs > 0, "Latency must be tracked");
  }
});
