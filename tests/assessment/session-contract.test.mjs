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
  description: "",
  profileText: "",
};

const completeInput = {
  founderName: "Asha Rao",
  founderRole: "Founder and CEO",
  startupName: "SignalStack",
  websiteUrl: "https://signalstack.example",
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
  const reviewed = session({ input: completeInput, stage: "mentor", reviewedAt: "2026-07-23T00:00:00.000Z" });
  const assessed = session({
    input: completeInput,
    stage: "result",
    reviewedAt: "2026-07-23T00:00:00.000Z",
    report: { rubricVersion: "fundme-demo-rubric@1" },
  });

  assert.equal(earliestValidRoute(session()), "/assessment");
  assert.equal(earliestValidRoute(session({ input: completeInput, stage: "review" })), "/assessment/review");
  assert.equal(earliestValidRoute(reviewed), "/assessment/mentor");
  assert.equal(earliestValidRoute(assessed), "/assessment/result");
});
