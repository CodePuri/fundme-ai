import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeAnalyticsProperties } from "../../lib/analytics/events.ts";
import { createPreviewReferralCode, serializeReport } from "../../lib/assessment/share.ts";

test("Analytics: sanitizes sensitive and private payload keys", () => {
  const dirtyProps = {
    eventName: "assessment_started",
    email: "founder@example.com",
    claim_token: "secret-token-1234",
    claimToken: "secret-token-5678",
    transcript: "Full private conversation transcript...",
    deck_text: "Confidential financial projections...",
    validMetric: 42,
    hasDeck: true,
    safeSummary: "A very long summary ".repeat(20),
  };

  const clean = sanitizeAnalyticsProperties(dirtyProps);

  assert.equal(clean.email, undefined);
  assert.equal(clean.claim_token, undefined);
  assert.equal(clean.claimToken, undefined);
  assert.equal(clean.transcript, undefined);
  assert.equal(clean.deck_text, undefined);
  assert.equal(clean.validMetric, undefined);
  assert.equal(clean.hasDeck, undefined);
  assert.equal(clean.safeSummary, undefined);
});

test("Share & Referrals: generates stable preview referral code", () => {
  const code1 = createPreviewReferralCode("user_3DcZtKTGh2XKNAm9X5wZ2CNlfHe");
  const code2 = createPreviewReferralCode("user_3DcZtKTGh2XKNAm9X5wZ2CNlfHe");
  const code3 = createPreviewReferralCode("user_different_founder_id");

  assert.ok(code1.startsWith("PREVIEW-"));
  assert.equal(code1, code2);
  assert.notEqual(code1, code3);
});

test("Public Share: serialization produces privacy-safe text summary", () => {
  const mockReport = {
    rubricVersion: "fundme-demo-rubric@1",
    generatedAt: "2026-08-30T16:00:00.000Z",
    readinessScore: 43,
    verdict: "Build the evidence base first",
    conciseVerdict: "Build the evidence base first.",
    evidenceCoverage: 36,
    confidence: "low",
    completionState: "complete",
    tractionState: "unverified",
    strongestDimension: "problem-clarity",
    weakestDimension: "traction-proof",
    dimensions: [
      { id: "problem-clarity", label: "Problem clarity", score: 65, explanation: "Clear problem definition." }
    ],
    evidence: [],
    findings: [],
    founderReview: { credibility: "Experienced founder", founderMarketFit: "Aligned", profilePositioning: "Strong" },
    startupReview: { problem: "Valid", solution: "Clear", market: "Growing", differentiation: "Good", traction: "Early", fundingNarrative: "Early" },
    deckReview: { status: "provided", summary: "Pitch deck attached", findings: [] },
    actions: [
      { horizon: "fix-now", title: "Add traction proof", detail: "Attach customer logos and signed letters of intent." }
    ],
  };

  const text = serializeReport(mockReport);
  assert.ok(text.includes("Readiness: 43/100"));
  assert.ok(text.includes("Build the evidence base first"));
  assert.ok(text.includes("Problem clarity: 65/100"));
  assert.ok(text.includes("Add traction proof"));
  assert.ok(!text.includes("clerk_user_id"));
  assert.ok(!text.includes("claim_token"));
});
