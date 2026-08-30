import assert from "node:assert/strict";
import test from "node:test";

async function loadValidation() {
  try {
    return await import("../../lib/assessment/validation.ts");
  } catch {
    return {
      earliestValidRoute: () => "/assessment",
      validateEmail: () => "Email validation is unavailable",
      validateFile: () => ({ valid: false, error: "File validation is unavailable" }),
      validateIntake: () => ({ valid: false, errors: { contract: "Validation is unavailable" } }),
    };
  }
}

const emptyInput = {
  founderName: "",
  founderRole: "",
  startupName: "",
  websiteUrl: "",
  linkedInUrl: "",
  description: "",
  profileText: "",
};

const completeInput = {
  founderName: "Asha Rao",
  founderRole: "Founder and CEO",
  startupName: "SignalStack",
  websiteUrl: "https://signalstack.example",
  linkedInUrl: "https://www.linkedin.com/in/asha-rao",
  description: "SignalStack helps seed-stage founders turn scattered traction evidence into investor-ready updates.",
  profileText: "Former product lead who spent six years building analytics tools for startup finance teams.",
};

function session(overrides = {}) {
  return {
    version: 1,
    mode: "demo",
    stage: "intake",
    input: emptyInput,
    artifacts: [],
    conversation: [],
    answers: {},
    skippedQuestionIds: [],
    reviewedAt: null,
    report: null,
    earlyAccess: { email: "", status: "idle", referralCode: null },
    persistenceWarning: null,
    updatedAt: "2026-07-23T00:00:00.000Z",
    ...overrides,
  };
}

test("requires the minimum founder and startup context", async () => {
  const { validateIntake } = await loadValidation();

  assert.equal(validateIntake(emptyInput).valid, false);
  assert.deepEqual(validateIntake(completeInput), { valid: true, errors: {} });
});

test("accepts website, deck, or fallback description without requiring a long questionnaire", async () => {
  const { validateIntake } = await loadValidation();
  const founderOnly = { ...emptyInput, founderName: "Asha Rao" };
  const deck = [{
    id: "deck-1",
    kind: "pitch-deck",
    name: "signalstack.pdf",
    size: 2_000_000,
    type: "application/pdf",
    status: "attached",
    attachedAt: "2026-07-23T00:00:00.000Z",
  }];

  assert.equal(validateIntake({ ...founderOnly, websiteUrl: "signalstack.example" }).valid, true);
  assert.equal(validateIntake(founderOnly, deck).valid, true);
  assert.equal(validateIntake({ ...founderOnly, description: "A focused workflow for startup funding evidence." }).valid, true);
  assert.equal(validateIntake(founderOnly).valid, false);
});

test("validates pasted LinkedIn profile URLs without claiming an API connection", async () => {
  const { validateIntake } = await loadValidation();
  const base = { ...emptyInput, founderName: "Asha Rao", websiteUrl: "signalstack.example" };

  assert.equal(validateIntake({ ...base, linkedInUrl: "https://www.linkedin.com/in/asha-rao" }).valid, true);
  assert.equal(validateIntake({ ...base, linkedInUrl: "not a profile URL" }).valid, false);
});

test("accepts a PDF deck and rejects unsafe or oversized files", async () => {
  const { validateFile } = await loadValidation();

  assert.deepEqual(
    validateFile({ name: "deck.pdf", size: 2_000_000, type: "application/pdf" }, "pitch-deck"),
    { valid: true, error: null },
  );
  assert.equal(validateFile({ name: "deck.exe", size: 10, type: "application/x-msdownload" }, "pitch-deck").valid, false);
  assert.equal(validateFile({ name: "deck.pdf", size: 11 * 1024 * 1024, type: "application/pdf" }, "pitch-deck").valid, false);
});

test("validates an email without accepting partial addresses", async () => {
  const { validateEmail } = await loadValidation();

  assert.equal(validateEmail("founder@example.com"), null);
  assert.equal(typeof validateEmail("founder@"), "string");
});

test("routes sessions to the earliest recoverable step", async () => {
  const { earliestValidRoute } = await loadValidation();
  const analyzing = session({
    input: completeInput,
    stage: "result",
    processingState: "assessing",
    reviewedAt: "2026-07-23T00:00:00.000Z",
  });
  const assessed = session({
    input: completeInput,
    stage: "result",
    processingState: "partial",
    reviewedAt: "2026-07-23T00:00:00.000Z",
    report: { rubricVersion: "fundme-demo-rubric@1" },
  });

  assert.equal(earliestValidRoute(session()), "/assessment");
  assert.equal(earliestValidRoute(analyzing), "/assessment/analyzing");
  assert.equal(earliestValidRoute(assessed), "/assessment/result");
});
