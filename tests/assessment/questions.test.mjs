import assert from "node:assert/strict";
import test from "node:test";

async function loadQuestions() {
  try {
    return await import("../../lib/assessment/questions.ts");
  } catch {
    return { nextMentorQuestion: () => null, selectMentorQuestions: () => [] };
  }
}

function session(overrides = {}) {
  return {
    version: 1,
    mode: "demo",
    stage: "mentor",
    input: {
      founderName: "Asha Rao",
      founderRole: "Founder",
      startupName: "SignalStack",
      websiteUrl: "",
      description: "SignalStack helps founders organize evidence for fundraising decisions.",
      profileText: "",
    },
    artifacts: [],
    conversation: [],
    answers: {},
    skippedQuestionIds: [],
    reviewedAt: "2026-07-23T00:00:00.000Z",
    report: null,
    earlyAccess: { email: "", status: "idle", referralCode: null },
    persistenceWarning: null,
    updatedAt: "2026-07-23T00:00:00.000Z",
    ...overrides,
  };
}

test("prioritizes the five high-value missing questions", async () => {
  const { selectMentorQuestions } = await loadQuestions();

  assert.deepEqual(
    selectMentorQuestions(session()).map((question) => question.id),
    ["stage", "traction", "founder-fit", "differentiation", "funding-outcome"],
  );
});

test("omits answered and skipped questions without exceeding five", async () => {
  const { selectMentorQuestions } = await loadQuestions();
  const questions = selectMentorQuestions(session({
    answers: {
      stage: { questionId: "stage", text: "Live product", source: "typed", answeredAt: "2026-07-23T00:00:00.000Z" },
    },
    skippedQuestionIds: ["traction"],
  }));

  assert.deepEqual(questions.map((question) => question.id), ["founder-fit", "differentiation", "funding-outcome"]);
  assert.ok(questions.length <= 5);
});

test("returns the next deterministic question or null when complete", async () => {
  const { nextMentorQuestion } = await loadQuestions();
  assert.equal(nextMentorQuestion(session())?.id, "stage");
  assert.equal(nextMentorQuestion(session({ skippedQuestionIds: ["stage", "traction", "founder-fit", "differentiation", "funding-outcome"] })), null);
});
