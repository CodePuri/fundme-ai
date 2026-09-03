import assert from "node:assert/strict";
import test from "node:test";
import { ingestFounderProfile } from "../../lib/ingestion/founder.ts";
import { buildStructuredEvidence } from "../../lib/assessment/evidence-model.ts";
import { assessSession } from "../../lib/assessment/engine.ts";
import { saveAssessmentToDatabase, claimAssessmentForUser, getLatestAssessmentForUser } from "../../lib/assessment/database.ts";
import { randomUUID } from "node:crypto";
import { assertStagingIntegrationEnvironment } from "../helpers/staging-integration-environment.mjs";

assertStagingIntegrationEnvironment();

test("FULL CUSTOMER LOOP: Material -> Ingestion -> Assessment -> Claim -> Save -> Retrieve", async () => {
  // Step 1: Real Ingestion of Founder Material
  const founder = ingestFounderProfile(
    "Aakash N",
    "Founder & CEO",
    "10 years building developer platforms and infrastructure products. Scaled engineering teams from 0 to 50 engineers.",
    "https://linkedin.com/in/aakash-founder"
  );
  assert.equal(founder.founderName, "Aakash N");
  assert.equal(founder.extractedYearsOfExperience, 10);
  assert.ok(founder.detectedSignals.includes("leadership-or-founder-history"));

  // Step 2: Pitch Deck Simulation & Parsing
  const sampleDeckText = `
Slide 1: FundMe AI - Intelligently Connecting Founders to Capital
Slide 2: Problem: Founders spend 400+ hours manually finding relevant grants, accelerators, and investors.
Slide 3: Solution: Real-time evidence-backed funding readiness diagnosis and intelligent matching.
Slide 4: Traction: 50 active founders evaluated, $12,000 monthly recurring revenue, 85% retention.
Slide 5: Market: $14B global early-stage capital matchmaking market.
Slide 6: Team: Aakash N (Founder/CEO), experienced technical team.
Slide 7: The Ask: Raising $750k pre-seed for 18 months runway to reach 500 paying startups.
  `;

  // Step 3: Structured Evidence Record
  const evidenceRecord = buildStructuredEvidence({
    input: {
      founderName: founder.founderName,
      founderRole: founder.founderRole,
      startupName: "FundMe AI",
      websiteUrl: "https://tryfundme.in",
      linkedInUrl: founder.linkedInUrl,
      description: "FundMe provides real-time evidence-backed funding readiness diagnosis.",
      profileText: founder.profileText,
      websiteTitle: "FundMe | Funding Readiness for Founders",
      websiteDescription: "Real-time funding diagnosis and intelligent investor matching.",
      extractedWebsiteText: "FundMe helps founders see what investors question first.",
      productSignals: ["pricing-present", "live-demo-or-trial"],
    },
    artifacts: [
      {
        id: "deck-1",
        kind: "pitch-deck",
        name: "FundMe-PitchDeck.pdf",
        size: 2048,
        type: "application/pdf",
        status: "attached",
        attachedAt: new Date().toISOString(),
        extractedText: sampleDeckText,
        pageCount: 7,
        detectedSections: ["problem", "solution", "traction", "market", "team", "funding-ask"],
      },
    ],
    deckPdf: {
      filename: "FundMe-PitchDeck.pdf",
      success: true,
      pageCount: 7,
      extractedText: sampleDeckText,
      slideSections: [
        { slideIndex: 1, title: "FundMe AI", content: "FundMe AI - Intelligently Connecting Founders" },
        { slideIndex: 2, title: "Problem", content: "Founders spend 400+ hours" },
        { slideIndex: 3, title: "Solution", content: "Real-time evidence-backed funding readiness" },
        { slideIndex: 4, title: "Traction", content: "50 active founders evaluated, $12k MRR" },
      ],
      detectedSections: ["problem", "solution", "traction", "market", "team", "funding-ask"],
      parsedAt: new Date().toISOString(),
    },
    answers: {
      stage: {
        questionId: "stage",
        text: "Live product with paying customers.",
        source: "typed",
        answeredAt: new Date().toISOString(),
      },
      traction: {
        questionId: "traction",
        text: "50 active founders evaluated, $12,000 monthly recurring revenue, 85% retention.",
        source: "typed",
        answeredAt: new Date().toISOString(),
      },
      "founder-fit": {
        questionId: "founder-fit",
        text: "10 years running developer infrastructure teams and angel investing.",
        source: "typed",
        answeredAt: new Date().toISOString(),
      },
      differentiation: {
        questionId: "differentiation",
        text: "Traditional brokers charge 5% success fees and take months; FundMe diagnoses fit in 2 minutes.",
        source: "typed",
        answeredAt: new Date().toISOString(),
      },
      "funding-outcome": {
        questionId: "funding-outcome",
        text: "Raising $750k to scale from 50 to 500 paying startups and achieve $120k MRR.",
        source: "typed",
        answeredAt: new Date().toISOString(),
      },
    },
  });

  assert.equal(evidenceRecord.startup.name, "FundMe AI");
  assert.equal(evidenceRecord.pitchDeck.parsed, true);
  assert.equal(evidenceRecord.pitchDeck.pageCount, 7);

  // Step 4: Real Deterministic Funding Assessment
  const timestamp = "2026-08-30T12:00:00.000Z";
  const session = {
    version: 1,
    mode: "demo",
    stage: "result",
    processingState: "assessing",
    input: {
      founderName: evidenceRecord.founder.name,
      founderRole: evidenceRecord.founder.role,
      startupName: evidenceRecord.startup.name,
      websiteUrl: evidenceRecord.startup.websiteUrl,
      linkedInUrl: evidenceRecord.founder.linkedInUrl,
      description: evidenceRecord.startup.pitchDescription,
      profileText: evidenceRecord.founder.profileText,
      websiteTitle: evidenceRecord.startup.websiteTitle,
      websiteDescription: evidenceRecord.startup.websiteDescription,
      extractedWebsiteText: "FundMe helps founders see what investors question first.",
      productSignals: ["pricing-present", "live-demo-or-trial"],
    },
    artifacts: [
      {
        id: "deck-1",
        kind: "pitch-deck",
        name: "FundMe-PitchDeck.pdf",
        size: 2048,
        type: "application/pdf",
        status: "attached",
        attachedAt: timestamp,
        extractedText: sampleDeckText,
        pageCount: 7,
        detectedSections: ["problem", "solution", "traction", "market", "team", "funding-ask"],
      },
    ],
    conversation: [],
    answers: {
      stage: {
        questionId: "stage",
        text: "Live product with paying customers.",
        source: "typed",
        answeredAt: timestamp,
      },
      traction: {
        questionId: "traction",
        text: "50 active founders evaluated, $12,000 monthly recurring revenue, 85% retention.",
        source: "typed",
        answeredAt: timestamp,
      },
      "founder-fit": {
        questionId: "founder-fit",
        text: "10 years running developer infrastructure teams and angel investing.",
        source: "typed",
        answeredAt: timestamp,
      },
      differentiation: {
        questionId: "differentiation",
        text: "Traditional brokers charge 5% success fees and take months; FundMe diagnoses fit in 2 minutes.",
        source: "typed",
        answeredAt: timestamp,
      },
      "funding-outcome": {
        questionId: "funding-outcome",
        text: "Raising $750k to scale from 50 to 500 paying startups and achieve $120k MRR.",
        source: "typed",
        answeredAt: timestamp,
      },
    },
    skippedQuestionIds: [],
    reviewedAt: timestamp,
    report: null,
    earlyAccess: { email: "", status: "idle", referralCode: null },
    persistenceWarning: null,
    updatedAt: timestamp,
  };

  const report = assessSession(session, timestamp);
  assert.ok(report.readinessScore >= 55, `Expected score >= 55, got ${report.readinessScore}`);
  assert.equal(report.deckReview.status, "parsed");
  assert.ok(report.deckReview.summary.includes("parsed into 7 slides"));
  assert.ok(report.dimensions.length === 10);
  assert.ok(report.findings.length > 0);

  // Step 5: Save Anonymous Assessment to Supabase with Claim Token
  const claimToken = randomUUID();
  const savedRow = await saveAssessmentToDatabase({
    claimToken,
    founderName: session.input.founderName,
    startupName: session.input.startupName,
    websiteUrl: session.input.websiteUrl,
    report,
    rawSession: session,
  });
  assert.ok(savedRow.id);

  // Step 6: User Signs In with Google and Claims Assessment
  const testUserId = `user_test_${Date.now()}`;
  const claimResult = await claimAssessmentForUser({
    clerkUserId: testUserId,
    claimToken,
    userEmail: "founder@example.com",
    userName: "Aakash N",
  });
  assert.equal(claimResult.success, true);
  assert.equal(claimResult.assessmentId, savedRow.id);

  // Step 7: Prevent Cross-User Replay Attack
  const attackerUserId = `user_attacker_${Date.now()}`;
  await assert.rejects(
    async () => {
      await claimAssessmentForUser({
        clerkUserId: attackerUserId,
        claimToken,
        userEmail: "attacker@example.com",
      });
    },
    /already been claimed/i
  );

  // Step 8: Retrieve Saved Assessment from Supabase (surviving sign-out / sign-in)
  const userLatest = await getLatestAssessmentForUser(testUserId);
  assert.equal(userLatest.hasAssessment, true);
  assert.equal(userLatest.assessment.readiness_score, report.readinessScore);
  assert.equal(userLatest.assessment.verdict, report.verdict);
  assert.equal(userLatest.assessment.founder_name, "Aakash N");
  assert.equal(userLatest.assessment.startup_name, "FundMe AI");
  assert.equal(userLatest.founder.email, "founder@example.com");
  assert.equal(userLatest.startup.startup_name, "FundMe AI");
});
