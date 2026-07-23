import assert from "node:assert/strict";
import test from "node:test";

async function loadEngine() {
  try {
    return await import("../../lib/assessment/engine.ts");
  } catch {
    return { assessSession: () => ({ readinessScore: -1, findings: [], deckReview: {} }) };
  }
}

const generatedAt = "2026-07-23T12:00:00.000Z";

function session({ answers = {}, artifacts = [], description } = {}) {
  return {
    version: 1,
    mode: "demo",
    stage: "mentor",
    input: {
      founderName: "Asha Rao",
      founderRole: "Founder and former procurement lead",
      startupName: "SignalStack",
      websiteUrl: "https://signalstack.example",
      description: description ?? "SignalStack helps procurement teams replace manual vendor reviews with a focused evidence workflow.",
      profileText: "Ten years leading procurement operations and two years researching this workflow.",
    },
    artifacts,
    conversation: [],
    answers,
    skippedQuestionIds: [],
    reviewedAt: "2026-07-23T10:00:00.000Z",
    report: null,
    earlyAccess: { email: "", status: "idle", referralCode: null },
    persistenceWarning: null,
    updatedAt: "2026-07-23T10:00:00.000Z",
  };
}

function answer(questionId, text) {
  return { questionId, text, source: "typed", answeredAt: "2026-07-23T11:00:00.000Z" };
}

const strongAnswers = {
  stage: answer("stage", "Live product with six paid pilots since January 2026."),
  traction: answer("traction", "6 paid pilots, ₹9 lakh annual recurring revenue, 78% weekly retention and 3 customer references."),
  "founder-fit": answer("founder-fit", "Our team spent ten years running procurement and already serves the buyer network."),
  differentiation: answer("differentiation", "Teams use spreadsheets or Coupa; we reduce review setup from two days to twenty minutes."),
  "funding-outcome": answer("funding-outcome", "₹1.2 crore funds 15 months to reach 40 paid teams and ₹60 lakh ARR."),
};

test("produces identical reports for identical evidence and timestamp", async () => {
  const { assessSession } = await loadEngine();
  const input = session({ answers: strongAnswers });
  assert.deepEqual(assessSession(input, generatedAt), assessSession(input, generatedAt));
});

test("scores specific, evidenced answers above vague answers", async () => {
  const { assessSession } = await loadEngine();
  const strong = assessSession(session({ answers: strongAnswers }), generatedAt);
  const weak = assessSession(session({
    answers: {
      stage: answer("stage", "We are early."),
      traction: answer("traction", "People like it."),
    },
  }), generatedAt);

  assert.ok(strong.readinessScore > weak.readinessScore);
  assert.ok(weak.findings.some((finding) => finding.type === "missing-evidence"));
});

test("flags a pre-launch claim that conflicts with revenue evidence", async () => {
  const { assessSession } = await loadEngine();
  const report = assessSession(session({
    answers: {
      ...strongAnswers,
      stage: answer("stage", "Pre-launch idea with no customers yet."),
      traction: answer("traction", "₹4 lakh revenue from 12 paying customers."),
    },
  }), generatedAt);

  assert.ok(report.findings.some((finding) => finding.type === "contradiction"));
});

test("uses an exact no-deck boundary and never invents deck analysis", async () => {
  const { assessSession } = await loadEngine();
  const withoutDeck = assessSession(session({ answers: strongAnswers }), generatedAt);
  const withDeck = assessSession(session({
    answers: strongAnswers,
    artifacts: [{
      id: "deck-1",
      kind: "pitch-deck",
      name: "signalstack.pdf",
      size: 1024,
      type: "application/pdf",
      status: "attached",
      attachedAt: generatedAt,
    }],
  }), generatedAt);

  assert.equal(withoutDeck.deckReview.status, "not-provided");
  assert.deepEqual(withoutDeck.deckReview.findings, []);
  assert.equal(withDeck.deckReview.status, "received-unparsed");
  assert.deepEqual(withDeck.deckReview.findings, []);
  assert.match(withDeck.deckReview.summary, /not parsed/i);
});

test("classifies traction claims without turning negation or zero into strength", async () => {
  const { classifyTraction } = await loadEngine();
  const cases = [
    ["We have revenue.", "positive"],
    ["We have no revenue.", "none"],
    ["We have zero users.", "none"],
    ["We have 100 users.", "positive"],
    ["We have 10 beta users.", "positive"],
    ["We have not launched yet.", "none"],
    ["", "missing"],
    ["We had no users at launch. We now have 100 users.", "positive"],
  ];

  for (const [text, expected] of cases) {
    assert.equal(classifyTraction(text).state, expected, text);
  }
});

test("treats numeric, currency, word, and negated zero traction as real non-positive evidence", async () => {
  const { classifyTraction } = await loadEngine();
  const zeroCases = [
    "0 users",
    "ZERO USERS.",
    "0 customers",
    "0 paying customers",
    "$0 revenue",
    "$ 0 REVENUE.",
    "₹0 revenue",
    "₹ 0 MRR",
    "0 revenue",
    "zero revenue",
    "0 MRR",
    "$0 MRR",
    "no MRR",
    "pre-revenue",
    "not generating revenue",
    "We are not generating any revenue.",
    "Not currently generating revenue.",
    "We have not launched.",
    "We haven't launched.",
    "We haven’t launched.",
    "no pilots",
    "zero pilots",
  ];

  for (const text of zeroCases) {
    const classification = classifyTraction(text);
    assert.equal(classification.state, "none", text);
    assert.deepEqual(classification.positiveClaims, [], text);
    assert.ok(classification.negativeClaims.length > 0, text);
  }
});

test("quantified and launch negations never become positive traction", async () => {
  const { classifyTraction } = await loadEngine();
  const negatedClaims = [
    "We do not have 100 users.",
    "We don't have 100 users yet.",
    "We have not reached 100 users.",
    "We haven't reached 100 users.",
    "We haven’t reached 100 users.",
    "We do not have 10 paying customers.",
    "We are not generating ₹10 lakh revenue.",
    "We aren't generating $10 revenue.",
    "We aren’t generating ₹10 lakh revenue.",
    "We are not live.",
    "We aren't live.",
    "We aren’t live.",
    "We haven't onboarded 10 users.",
    "We haven’t onboarded 10 users.",
    "We have not onboarded 10 users.",
    "Not 10 users.",
    "No more than 10 users.",
    "We are not live.",
    "We have not gone live.",
    "We haven't gone live.",
    "We haven’t gone live.",
    "We did not generate ₹10 lakh in revenue.",
    "We didn't generate ₹10 lakh in revenue.",
    "We didn’t generate ₹10 lakh in revenue.",
  ];

  for (const text of negatedClaims) {
    const classification = classifyTraction(text);
    assert.equal(classification.state, "none", text);
    assert.deepEqual(classification.positiveClaims, [], text);
    assert.ok(classification.negativeClaims.length > 0, text);
  }
});

test("does not reinterpret funding or spend amounts as revenue traction", async () => {
  const { classifyTraction } = await loadEngine();
  const nonRevenueAmounts = [
    "We raised ₹50 lakh but have no revenue.",
    "We spent ₹50 lakh and currently have no revenue.",
    "We raised $500,000 and are pre-revenue.",
  ];

  for (const text of nonRevenueAmounts) {
    const classification = classifyTraction(text);
    assert.equal(classification.state, "none", text);
    assert.deepEqual(classification.positiveClaims, [], text);
    assert.equal(classification.ambiguousTimeline, false, text);
  }

  assert.equal(classifyTraction("We generated ₹50 lakh in revenue.").state, "positive");
  assert.equal(classifyTraction("We have ₹5 lakh MRR.").state, "positive");
});

test("quantified negations never create a specific-traction strength", async () => {
  const { assessSession } = await loadEngine();

  for (const tractionText of [
    "We do not have 100 users.",
    "We don't have 10 paying customers yet.",
    "We have not reached 100 users.",
    "We haven't reached 100 users.",
    "We are not generating ₹10 lakh revenue.",
    "We aren't generating $10 revenue.",
  ]) {
    const report = assessSession(session({ answers: {
      ...strongAnswers,
      stage: answer("stage", "We have not launched yet."),
      traction: answer("traction", tractionText),
    } }), generatedAt);

    assert.equal(report.tractionState, "none", tractionText);
    assert.equal(report.findings.some((finding) => finding.id === "specific-traction"), false, tractionText);
    assert.equal(report.findings.some((finding) => finding.type === "contradiction"), false, tractionText);
  }
});

test("quantified negation conflicts only with the same asserted value", async () => {
  const { classifyTraction } = await loadEngine();
  const coherent = classifyTraction("We currently do not have 100 users, but we currently have 10 users.");
  const conflicting = classifyTraction("We currently do not have 100 users, but we currently have 100 users.");

  assert.equal(coherent.state, "positive");
  assert.equal(coherent.ambiguousTimeline, false);
  assert.equal(conflicting.state, "contradictory");
});

test("separates historical growth, explicit current conflicts, and ambiguous timing", async () => {
  const { classifyTraction } = await loadEngine();
  const growthCases = [
    "We had 100 users last year and now have 1,000 users.",
    "We had 100 users last year and now have 1,000.",
    "Revenue was zero in January and is ₹5 lakh MRR now.",
    "We previously had no customers but now have 12 paying customers.",
    "We grew from 0 to 500 users.",
    "10 customers last month; today we have 25 customers.",
    "We had 0 customers last month and 12 today.",
  ];

  for (const text of growthCases) {
    const classification = classifyTraction(text);
    assert.equal(classification.state, "positive", text);
    assert.equal(classification.ambiguousTimeline, false, text);
  }

  const sameTimeframe = classifyTraction("We currently have 10 users and currently have 100 users.");
  assert.equal(sameTimeframe.state, "contradictory");
  assert.equal(sameTimeframe.ambiguousTimeline, false);

  const currentZeroConflict = classifyTraction("We currently have 0 users and currently have 100 users.");
  assert.equal(currentZeroConflict.state, "contradictory");
  assert.equal(currentZeroConflict.ambiguousTimeline, false);

  const historicalPositiveCurrentZero = classifyTraction("We had 12 customers last month and 0 today.");
  assert.equal(historicalPositiveCurrentZero.state, "none");
  assert.equal(historicalPositiveCurrentZero.ambiguousTimeline, false);
  assert.equal(historicalPositiveCurrentZero.state === "contradictory", false);
  assert.deepEqual(historicalPositiveCurrentZero.positiveClaims, ["12 customers"]);
  assert.ok(historicalPositiveCurrentZero.negativeClaims.some((claim) => claim.includes("0 today")));

  const ambiguous = classifyTraction("We have 10 users and 100 users.");
  assert.equal(ambiguous.state, "positive");
  assert.equal(ambiguous.ambiguousTimeline, true);
});

test("requests timeline clarification and lowers confidence without inventing a contradiction", async () => {
  const { assessSession } = await loadEngine();
  const report = assessSession(session({ answers: {
    ...strongAnswers,
    traction: answer("traction", "We have 10 users and 100 users."),
  } }), generatedAt);

  assert.equal(report.tractionState, "positive");
  assert.equal(report.findings.some((finding) => finding.type === "contradiction"), false);
  const clarification = report.findings.find((finding) => finding.id === "traction-timeline-unclear");
  assert.deepEqual(clarification?.evidenceIds, ["traction-answer"]);
  assert.ok(["low", "medium"].includes(report.confidence));
});

test("negative traction never creates strength or an invented contradiction", async () => {
  const { assessSession } = await loadEngine();
  for (const tractionText of [
    "We have no revenue.",
    "We do not have users yet.",
    "No pilots have started.",
    "We have not raised funding.",
    "We are not generating revenue.",
    "We aren't generating revenue.",
    "We aren’t generating revenue.",
    "We have zero paying customers.",
  ]) {
    const report = assessSession(session({ answers: {
      stage: answer("stage", "We have not launched yet."),
      traction: answer("traction", tractionText),
    } }), generatedAt);
    assert.equal(report.findings.some((finding) => finding.id === "specific-traction"), false, tractionText);
    assert.equal(report.findings.some((finding) => finding.type === "contradiction"), false, tractionText);
  }
});

test("only conflicting current claims create a contradiction and reduce confidence", async () => {
  const { assessSession } = await loadEngine();
  const coherent = assessSession(session({ answers: {
    stage: answer("stage", "Started as an idea; live today."),
    traction: answer("traction", "We had no users at launch. We now have 100 users."),
  } }), generatedAt);
  const conflicting = assessSession(session({ answers: {
    stage: answer("stage", "Pre-launch with no customers yet."),
    traction: answer("traction", "We have 12 paying customers and ₹4 lakh revenue."),
  } }), generatedAt);

  assert.equal(coherent.findings.some((finding) => finding.type === "contradiction"), false);
  assert.equal(conflicting.findings.some((finding) => finding.type === "contradiction"), true);
  assert.ok(["low", "medium"].includes(conflicting.confidence));
});

test("recognizes negated launch and live stages when reconciling current traction", async () => {
  const { assessSession } = await loadEngine();

  for (const stageText of [
    "We haven't launched.",
    "We haven’t launched.",
    "We are not live.",
    "We have not gone live.",
    "We haven't gone live.",
    "We haven’t gone live.",
    "Not live yet.",
  ]) {
    const report = assessSession(session({ answers: {
      ...strongAnswers,
      stage: answer("stage", stageText),
      traction: answer("traction", "We currently have 12 paying customers."),
    } }), generatedAt);
    const finding = report.findings.find((item) => item.id === "stage-traction-conflict");

    assert.equal(finding?.type, "contradiction", stageText);
    assert.deepEqual(finding?.evidenceIds, ["stage-answer", "traction-answer"], stageText);
  }
});

test("attributes an internal traction contradiction only to traction evidence", async () => {
  const { assessSession } = await loadEngine();
  const report = assessSession(session({ answers: {
    ...strongAnswers,
    stage: answer("stage", "We are live today."),
    traction: answer("traction", "We currently have 10 users and currently have 100 users."),
  } }), generatedAt);
  const finding = report.findings.find((item) => item.type === "contradiction");

  assert.equal(finding?.id, "traction-claim-conflict");
  assert.deepEqual(finding?.evidenceIds, ["traction-answer"]);
  assert.doesNotMatch(finding?.action ?? "", /product-stage/i);
});

test("labels complete and partial reports without rendering unavailable analysis as complete", async () => {
  const { assessSession } = await loadEngine();
  const complete = assessSession(session({ answers: strongAnswers }), generatedAt);
  const partial = assessSession(session({ answers: {
    stage: answer("stage", "Prototype; not launched yet."),
    traction: answer("traction", "We have no revenue and zero users."),
  } }), generatedAt);

  assert.equal(complete.completionState, "complete");
  assert.equal(complete.tractionState, "positive");
  assert.equal(partial.completionState, "partial");
  assert.equal(partial.tractionState, "none");
  assert.equal(partial.deckReview.status, "not-provided");
  assert.ok(partial.findings.some((finding) => finding.id === "missing-founder-fit"));
  assert.ok(partial.evidenceCoverage < complete.evidenceCoverage);
});
