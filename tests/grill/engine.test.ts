import assert from "node:assert/strict";
import test from "node:test";

import { buildDossier } from "../../lib/grill/evidence";
import { DeterministicGrillEngine } from "../../lib/grill/engine";
import { LocalKnowledgeRetriever } from "../../lib/grill/retrieval";
import { grillKnowledgeCorpus } from "../../lib/grill/server/corpus";
import {
  contradictoryIntake,
  notProvidedDeck,
  parsedDeck,
  parsedProfile,
  strongIntake,
  unavailableDeck,
  weakIntake,
} from "./fixtures";

function analyze(intake = strongIntake, deck = parsedDeck) {
  const dossier = buildDossier(intake, [deck]);
  const guidance = new LocalKnowledgeRetriever(grillKnowledgeCorpus).retrieve(dossier, 5);
  return new DeterministicGrillEngine().analyze(dossier, guidance);
}

test("same input produces an identical report", () => {
  assert.deepEqual(analyze(), analyze());
});

test("all scores remain within zero and one hundred", () => {
  const reports = [analyze(), analyze(weakIntake, unavailableDeck), analyze(contradictoryIntake)];

  for (const report of reports) {
    assert.ok(report.overallScore >= 0 && report.overallScore <= 100);
    assert.ok(report.evidenceCoverage >= 0 && report.evidenceCoverage <= 100);
    assert.equal(report.dimensions.length, 10);
    for (const dimension of report.dimensions) {
      assert.ok(dimension.score >= 0 && dimension.score <= 100);
    }
  }
});

test("strong evidence materially outscores vague evidence", () => {
  const strong = analyze();
  const weak = analyze(weakIntake, unavailableDeck);

  assert.ok(strong.overallScore >= weak.overallScore + 15);
  assert.ok(strong.evidenceCoverage > weak.evidenceCoverage);
  assert.ok(weak.missingEvidence.length >= 4);
});

test("contradictory traction is named and reduces confidence", () => {
  const strong = analyze();
  const contradictory = analyze(contradictoryIntake);

  assert.ok(contradictory.contradictions.some((finding) => /traction|customer|revenue/i.test(finding.title + finding.body)));
  assert.notEqual(contradictory.confidence, "high");
  assert.ok(contradictory.overallScore < strong.overallScore);
});

test("numeric zero revenue metrics cannot coexist with positive traction at high confidence", () => {
  const strong = analyze(strongIntake, parsedDeck);
  const strongTractionScore = strong.dimensions.find(
    (dimension) => dimension.id === "traction_evidence",
  )?.score ?? 0;

  for (const zeroClaim of ["0 revenue", "0 MRR", "0 ARR"]) {
    const intake = {
      ...strongIntake,
      startup: {
        ...strongIntake.startup,
        revenueOrUsers: zeroClaim,
      },
    };
    const report = analyze(intake, parsedDeck);
    const tractionScore = report.dimensions.find(
      (dimension) => dimension.id === "traction_evidence",
    )?.score ?? 100;

    assert.ok(
      report.contradictions.some((finding) => /traction|users|revenue|mrr|arr/i.test(finding.body)),
      `${zeroClaim} should produce a contradiction`,
    );
    assert.ok(tractionScore < strongTractionScore, `${zeroClaim} should reduce traction scoring`);
    assert.notEqual(report.confidence, "high", `${zeroClaim} should block high confidence`);
  }
});

test("unsupported superlatives are reported without inventing evidence", () => {
  const report = analyze(contradictoryIntake);

  assert.ok(report.unsupportedClaims.some((finding) => /world|only|guaranteed|10x/i.test(finding.body)));
  assert.equal(report.rubricVersion, "fundme-v1-demo-rubric@1");
});

test("unsupported-claim findings quote the triggering claim context", () => {
  const deck = {
    ...parsedDeck,
    text: `${"Problem evidence. ".repeat(30)}ReconFlow is the world's best reconciliation platform.`,
  };
  const report = analyze(strongIntake, deck);
  const finding = report.unsupportedClaims[0];

  assert.equal(report.unsupportedClaims.length, 1);
  assert.ok(finding);
  assert.match(finding.body, /world's best/i);
});

test("ordinary customer narrowing with only is not treated as a superlative", () => {
  const intake = {
    ...strongIntake,
    startup: {
      ...strongIntake.startup,
      solution: "We only serve regulated Indian exporters with this reconciliation workflow.",
    },
  };
  const report = analyze(intake, notProvidedDeck);

  assert.equal(report.unsupportedClaims.length, 0);
});

test("target-customer text alone does not count as deck traction", () => {
  const deck = {
    ...parsedDeck,
    text:
      "Problem: exporters reconcile invoices manually. Solution: workflow software. Target customer: Indian exporters. Team: two founders. Fundraise: INR 2 crore.",
  };
  const report = analyze(strongIntake, deck);

  assert.equal(report.deckReview.detectedSections.includes("Traction"), false);
  assert.equal(report.deckReview.missingSections.includes("Traction"), true);
});

test("a parsed but incomplete deck receives section guidance instead of an upload retry", () => {
  const deck = {
    ...parsedDeck,
    text: "Problem: exporters reconcile invoices manually. Solution: workflow software.",
  };
  const report = analyze(strongIntake, deck);
  const deckAction = report.highestLeverageActions.find(
    (action) => action.id === "action-deck_readiness",
  );

  assert.equal(report.deckReview.status, "parsed");
  assert.ok(deckAction);
  assert.doesNotMatch(`${deckAction.title} ${deckAction.why} ${deckAction.action}`, /upload|unreadable/i);
  assert.match(deckAction.action, /missing|section/i);
});

test("action templates do not duplicate submitted trailing punctuation", () => {
  const intake = {
    ...strongIntake,
    startup: {
      ...strongIntake.startup,
      targetCustomer: `${strongIntake.startup.targetCustomer}.`,
    },
  };
  const report = analyze(intake, notProvidedDeck);

  for (const action of report.highestLeverageActions) {
    assert.doesNotMatch(action.action, /\.\./);
  }
  for (const improvement of report.profileReview.improvements) {
    assert.doesNotMatch(improvement, /\.\./);
  }
});

test("pre-launch companies with paid design partners are not contradictory", () => {
  const intake = {
    ...strongIntake,
    startup: {
      ...strongIntake.startup,
      traction: "Pre-launch with 5 paid design partners",
      revenueOrUsers: "5 paid design partners",
    },
  };
  const report = analyze(intake, notProvidedDeck);
  const withoutStageLabel = analyze(
    {
      ...intake,
      startup: { ...intake.startup, traction: "5 paid design partners" },
    },
    notProvidedDeck,
  );
  const tractionScore = report.dimensions.find(
    (dimension) => dimension.id === "traction_evidence",
  )?.score;
  const comparisonScore = withoutStageLabel.dimensions.find(
    (dimension) => dimension.id === "traction_evidence",
  )?.score;

  assert.deepEqual(report.contradictions, []);
  assert.ok((tractionScore ?? 0) >= (comparisonScore ?? 0));
});

test("an unavailable deck produces no fabricated slide findings", () => {
  const report = analyze(strongIntake, unavailableDeck);

  assert.equal(report.deckReview.status, "unavailable");
  assert.deepEqual(report.deckReview.detectedSections, []);
  assert.match(report.deckReview.summary, /could not be read|unavailable/i);
});

test("a deck that was not uploaded remains not provided", () => {
  const report = analyze(strongIntake, notProvidedDeck);

  assert.equal(report.deckReview.status, "not_provided");
  assert.match(report.deckReview.summary, /no pitch deck was provided/i);
});

test("a parsed profile document is used when pasted profile text is empty", () => {
  const intake = {
    ...strongIntake,
    founder: { ...strongIntake.founder, profileText: "" },
  };
  const dossier = buildDossier(intake, [parsedProfile, parsedDeck]);
  const guidance = new LocalKnowledgeRetriever(grillKnowledgeCorpus).retrieve(dossier, 5);
  const report = new DeterministicGrillEngine().analyze(dossier, guidance);
  const withoutProfile = analyze(intake, parsedDeck);
  const profileScore = report.dimensions.find((item) => item.id === "profile_positioning")?.score ?? 0;
  const withoutProfileScore = withoutProfile.dimensions.find((item) => item.id === "profile_positioning")?.score ?? 0;

  assert.equal(report.missingEvidence.some((item) => item.title === "LinkedIn/profile evidence"), false);
  assert.ok(profileScore > withoutProfileScore);
  assert.ok(report.profileReview.authoritySignals.some((item) => /operating|building/i.test(item)));
});
