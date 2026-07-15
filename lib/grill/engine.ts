import type { GrillEngine } from "./contracts";
import { getProfileEvidenceText } from "./profile-evidence";
import type {
  DeckReview,
  DimensionScore,
  EvidenceItem,
  GrillDimensionId,
  GrillDossier,
  GrillFinding,
  GrillReport,
  PrioritizedAction,
  ProfileReview,
  RetrievedGuidance,
} from "./types";

export const GRILL_RUBRIC_VERSION = "fundme-v1-demo-rubric@1" as const;

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const hasNumber = (value: string) => /\d|%|₹|\$|\binr\b|\blakh\b|\bcrore\b/i.test(value);
const words = (value: string) => value.trim().split(/\s+/).filter(Boolean);
const hasAny = (value: string, patterns: RegExp[]) => patterns.some((pattern) => pattern.test(value));

function evidenceIds(dossier: GrillDossier, categories: EvidenceItem["category"][]) {
  return dossier.evidence
    .filter((item) => categories.includes(item.category))
    .map((item) => item.id);
}

function textQuality(value: string, usefulLength = 60) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  let score = Math.min(55, (trimmed.length / usefulLength) * 55);
  if (hasNumber(trimmed)) score += 18;
  if (words(trimmed).length >= 12) score += 12;
  if (/customer|user|team|product|market|revenue|pilot|workflow|business/i.test(trimmed)) score += 10;
  return clamp(score);
}

type DeckSection = { label: string; patterns: RegExp[] };

const DECK_SECTIONS: DeckSection[] = [
  { label: "Problem", patterns: [/\bproblem\b/i, /pain point/i] },
  { label: "Solution", patterns: [/\bsolution\b/i, /\bproduct\b/i] },
  { label: "Market", patterns: [/\bmarket\b/i, /tam|sam|som/i] },
  { label: "Business model", patterns: [/business model/i, /pricing|subscription|revenue model/i] },
  {
    label: "Traction",
    patterns: [
      /\btraction\b/i,
      /\b(?:pilots?|retention|mrr|arr)\b/i,
      /(?:\b[1-9]\d*(?:[.,]\d+)?%?\b|\b(?:paid|active)\b).{0,32}\bcustomers?\b|\bcustomers?\b.{0,32}(?:\b[1-9]\d*(?:[.,]\d+)?%?\b|\b(?:paid|active)\b)/i,
    ],
  },
  { label: "Competition", patterns: [/competition|competitors?|differentiation|alternative/i] },
  { label: "Team", patterns: [/\bteam\b/i, /founders?/i] },
  { label: "Fundraise", patterns: [/fundraise|raising|funding ask|use of funds/i] },
];

const EXPLICIT_ZERO_TRACTION_PATTERN =
  /\b(?:no|zero)\s+(?:active\s+|paying\s+)?(?:users?|customers?|revenue|traction|mrr|arr)\b|\b0(?:[.,]0+)?\s+(?:users?|customers?|revenue|traction|mrr|arr)\b/i;
const POSITIVE_TRACTION_PATTERN =
  /\b[1-9]\d*\b.*(users?|customers?|paid|mrr|arr|revenue)|(?:users?|customers?|paid|mrr|arr|revenue).*\b[1-9]\d*\b/i;

function hasExplicitlyZeroTraction(text: string) {
  return EXPLICIT_ZERO_TRACTION_PATTERN.test(text);
}

function hasPositiveTractionMetric(text: string) {
  return POSITIVE_TRACTION_PATTERN.test(text);
}

function detectedDeckSections(text: string) {
  return DECK_SECTIONS.filter((section) => hasAny(text, section.patterns)).map((section) => section.label);
}

function findContradictions(dossier: GrillDossier): GrillFinding[] {
  const findings: GrillFinding[] = [];
  const traction = dossier.startup.traction.trim();
  const revenue = dossier.startup.revenueOrUsers.trim();
  const deck = dossier.artifacts.find((artifact) => artifact.kind === "pitch_deck");
  const tractionIsZero = hasExplicitlyZeroTraction(traction);
  const revenueIsZero = hasExplicitlyZeroTraction(revenue);
  const tractionIsPositive = hasPositiveTractionMetric(traction);
  const revenueIsPositive = hasPositiveTractionMetric(revenue);

  if (
    (tractionIsZero && revenueIsPositive) ||
    (revenueIsZero && tractionIsPositive)
  ) {
    findings.push({
      id: "contradiction-traction-revenue",
      severity: "critical",
      title: "Traction and revenue claims conflict",
      body: `The traction answer says "${traction}" while the revenue or users answer says "${revenue}". Resolve the source and reporting period before using either claim.`,
      evidenceIds: evidenceIds(dossier, ["traction"]),
    });
  }

  if (
    deck?.status === "parsed" &&
    hasExplicitlyZeroTraction(deck.text) &&
    (tractionIsPositive || revenueIsPositive)
  ) {
    findings.push({
      id: "contradiction-deck-traction",
      severity: "critical",
      title: "Deck and intake traction disagree",
      body: "The parsed deck describes no users, customers, or revenue while the founder-entered intake reports positive traction. Reconcile the dates and metric definitions.",
      evidenceIds: evidenceIds(dossier, ["traction", "deck"]),
    });
  }


  if (
    deck?.status === "parsed" &&
    (tractionIsZero || revenueIsZero) &&
    hasPositiveTractionMetric(deck.text)
  ) {
    findings.push({
      id: "contradiction-intake-deck-traction",
      severity: "critical",
      title: "Intake and deck traction disagree",
      body: "The founder-entered intake reports zero users, customers, or revenue while the parsed deck contains a positive traction metric. Reconcile the dates and metric definitions.",
      evidenceIds: evidenceIds(dossier, ["traction", "deck"]),
    });
  }

  return findings;
}

function findUnsupportedClaims(dossier: GrillDossier): GrillFinding[] {
  const unsupportedPattern =
    /world(?:'s)? (?:only|first|best)|\b(?:the only|sole) (?:platform|product|solution|company|startup|tool|provider|technology)\b|revolutionary|guaranteed|10x|category[- ]leading|fastest[- ]growing|billion[- ]dollar/i;
  return dossier.evidence
    .map((item) => ({ item, match: item.text.match(unsupportedPattern) }))
    .filter((candidate) => candidate.match !== null)
    .slice(0, 5)
    .map(({ item, match }, index) => {
      const matchIndex = match?.index ?? 0;
      const start = Math.max(0, matchIndex - 80);
      const end = Math.min(item.text.length, matchIndex + (match?.[0].length ?? 0) + 120);
      const excerpt = item.text.slice(start, end).replace(/\s+/g, " ").trim();
      return {
        id: `unsupported-${index + 1}`,
        severity: "warning" as const,
        title: `Unsupported claim in ${item.sourceLabel}`,
        body: `"${start > 0 ? "..." : ""}${excerpt}${end < item.text.length ? "..." : ""}" uses a high-confidence claim without a cited comparison or verification source.`,
        evidenceIds: [item.id],
      };
    });
}

function buildDeckReview(dossier: GrillDossier): DeckReview {
  const deck = dossier.artifacts.find((artifact) => artifact.kind === "pitch_deck");
  if (!deck || deck.status === "not_provided") {
    return {
      status: "not_provided",
      summary: "No pitch deck was provided, so the readiness score uses founder-entered evidence only.",
      detectedSections: [],
      missingSections: DECK_SECTIONS.map((section) => section.label),
      findings: [],
      pagesParsed: 0,
      totalPages: null,
      truncated: false,
    };
  }
  if (deck.status !== "parsed") {
    return {
      status: "unavailable",
      summary:
        deck.errorMessage ??
        "The deck could not be read, so no slide or narrative findings were generated.",
      detectedSections: [],
      missingSections: [],
      findings: [],
      pagesParsed: 0,
      totalPages: deck.totalPages,
      truncated: deck.truncated,
    };
  }

  const detectedSections = detectedDeckSections(deck.text);
  const missingSections = DECK_SECTIONS.map((section) => section.label).filter(
    (label) => !detectedSections.includes(label),
  );
  const findings = missingSections.slice(0, 4).map((section, index) => ({
    id: `deck-missing-${index + 1}`,
    severity: "warning" as const,
    title: `${section} is not evident in parsed deck text`,
    body: `Add a clearly labeled ${section.toLowerCase()} section with the claim and supporting evidence.`,
    evidenceIds: evidenceIds(dossier, ["deck"]),
  }));

  return {
    status: "parsed",
    summary:
      missingSections.length === 0
        ? `Parsed ${deck.pagesParsed} pages and detected all eight expected narrative sections.`
        : `Parsed ${deck.pagesParsed} pages and detected ${detectedSections.length} of eight expected narrative sections.`,
    detectedSections,
    missingSections,
    findings,
    pagesParsed: deck.pagesParsed,
    totalPages: deck.totalPages,
    truncated: deck.truncated,
  };
}

function buildProfileReview(dossier: GrillDossier, score: number): ProfileReview {
  const profile = getProfileEvidenceText(
    dossier.founder.profileText,
    dossier.artifacts,
  );
  const achievements = dossier.founder.achievements.trim();
  const authoritySignals: string[] = [];
  if (dossier.founder.yearsExperience > 0) {
    authoritySignals.push(`${dossier.founder.yearsExperience} years of stated relevant experience`);
  }
  if (achievements && hasNumber(achievements)) {
    authoritySignals.push(`Quantified achievement: ${achievements.slice(0, 130)}`);
  }
  if (profile && /built|led|launched|managed|founded|shipped/i.test(profile)) {
    authoritySignals.push("Profile describes direct operating or building responsibility");
  }

  const missingCredibility: string[] = [];
  if (!hasNumber(profile)) missingCredibility.push("The profile lacks a quantified outcome or scale signal.");
  if (!/customer|user|team|product|revenue|partner/i.test(profile)) missingCredibility.push("The profile does not connect the founder to concrete operating evidence.");
  if (profile.length < 80) missingCredibility.push("The profile is too short to establish domain authority and current mission.");

  const improvements = [
    `Lead with ${dossier.founder.role || "the founder role"} at ${dossier.startup.name || "the startup"} and the specific customer outcome.`,
    authoritySignals.length
      ? "Move the strongest quantified authority signal into the opening two lines."
      : "Add one verifiable result with scope, metric, and responsibility.",
    `Connect prior experience directly to ${sentenceFragment(dossier.startup.targetCustomer, "the first target customer")}.`,
  ];

  return {
    positioningQuality: score,
    authoritySignals,
    missingCredibility,
    improvements,
    summary:
      score >= 70
        ? "The profile establishes useful authority, but it can connect prior proof to the current company more tightly."
        : "The profile states intent more clearly than proof; authority and founder-market fit need stronger evidence.",
  };
}

function dimensionsFor(dossier: GrillDossier, deckReview: DeckReview): DimensionScore[] {
  const founder = dossier.founder;
  const startup = dossier.startup;
  const profileEvidence = getProfileEvidenceText(
    founder.profileText,
    dossier.artifacts,
  );
  const founderCredibility = clamp(
    18 + Math.min(founder.yearsExperience, 10) * 4 + textQuality(founder.background, 80) * 0.22 + textQuality(founder.achievements, 80) * 0.28,
  );
  const fitText = `${founder.background} ${founder.achievements} ${startup.problem} ${startup.targetCustomer}`.toLowerCase();
  const fitSignals = ["finance", "fintech", "payment", "export", "customer", "product", "industry", "market"].filter((term) => fitText.includes(term)).length;
  const founderMarketFit = clamp(24 + Math.min(founder.yearsExperience, 8) * 4 + fitSignals * 5 + (founder.achievements.length > 40 ? 10 : 0));
  const problemClarity = clamp(textQuality(startup.problem, 110) * 0.72 + textQuality(startup.targetCustomer, 45) * 0.28);
  const solutionClarity = clamp(textQuality(startup.solution, 110) * 0.75 + textQuality(startup.oneLinePitch, 70) * 0.25);
  const broadMarketPenalty = /everyone|huge|global market/i.test(startup.market) ? 28 : 0;
  const marketQuality = clamp(textQuality(startup.market, 100) + (hasNumber(startup.market) ? 12 : 0) - broadMarketPenalty);
  const deckText = dossier.artifacts.find((artifact) => artifact.kind === "pitch_deck")?.text ?? "";
  const differentiation = clamp(
    22 +
      (/competition|competitor|alternative/i.test(deckText) ? 26 : 0) +
      (/differentiation|specific|unlike|instead of/i.test(`${deckText} ${startup.solution}`) ? 28 : 0) +
      (startup.solution.length > 80 ? 14 : 0),
  );
  const combinedTraction = `${startup.traction} ${startup.revenueOrUsers}`;
  const negativeTraction = hasExplicitlyZeroTraction(combinedTraction);
  const tractionEvidence = clamp(
    textQuality(combinedTraction, 120) +
      (/paid|revenue|mrr|arr|retention|pilot|active/i.test(combinedTraction) ? 15 : 0) -
      (negativeTraction ? 35 : 0),
  );
  const fundingNarrative = clamp(
    textQuality(startup.fundingAsk, 35) * 0.42 +
      textQuality(startup.useOfFunds, 100) * 0.58 +
      (hasNumber(startup.fundingAsk) ? 10 : 0),
  );
  const deckReadiness =
    deckReview.status === "parsed"
      ? clamp(18 + deckReview.detectedSections.length * 10 + (deckReview.truncated ? -6 : 0))
      : deckReview.status === "unavailable"
        ? 8
        : 0;
  const profilePositioning = clamp(
    textQuality(profileEvidence, 150) * 0.62 +
      textQuality(founder.achievements, 80) * 0.25 +
      (founder.role.length > 4 ? 13 : 0),
  );

  const definitions: Array<Omit<DimensionScore, "explanation" | "evidenceIds"> & { categories: EvidenceItem["category"][]; explanation: string }> = [
    { id: "founder_credibility", label: "Founder credibility", score: founderCredibility, weight: 10, categories: ["founder"], explanation: founderCredibility >= 70 ? "Relevant experience and execution proof are visible." : "The founder story needs more verifiable execution evidence." },
    { id: "founder_market_fit", label: "Founder-market fit", score: founderMarketFit, weight: 10, categories: ["founder", "customer", "problem"], explanation: founderMarketFit >= 70 ? "The founder's operating history connects to this market." : "The link between prior experience and this customer problem is still thin." },
    { id: "problem_clarity", label: "Problem clarity", score: problemClarity, weight: 10, categories: ["problem", "customer"], explanation: problemClarity >= 70 ? "The problem names a customer, workflow, and consequence." : "The problem remains broad or weakly evidenced." },
    { id: "solution_clarity", label: "Solution clarity", score: solutionClarity, weight: 10, categories: ["solution"], explanation: solutionClarity >= 70 ? "The product mechanism and outcome are understandable." : "The solution leans on category language instead of a concrete workflow." },
    { id: "market_quality", label: "Market quality", score: marketQuality, weight: 10, categories: ["market", "customer"], explanation: marketQuality >= 70 ? "The initial market wedge is specific and measurable." : "The market case needs a narrower, bottom-up entry segment." },
    { id: "differentiation", label: "Differentiation", score: differentiation, weight: 10, categories: ["solution", "deck"], explanation: differentiation >= 70 ? "Alternatives and a specific product edge are visible." : "The evidence does not yet explain why this wins against current alternatives." },
    { id: "traction_evidence", label: "Traction and evidence", score: tractionEvidence, weight: 15, categories: ["traction"], explanation: tractionEvidence >= 70 ? "Traction includes quantified customer or revenue proof." : "Demand and progress evidence are missing, vague, or internally inconsistent." },
    { id: "funding_narrative", label: "Funding narrative", score: fundingNarrative, weight: 10, categories: ["funding"], explanation: fundingNarrative >= 70 ? "The ask connects capital to concrete operating priorities." : "The raise amount and milestone logic need more precision." },
    { id: "deck_readiness", label: "Pitch-deck readiness", score: deckReadiness, weight: 10, categories: ["deck"], explanation: deckReview.status === "parsed" ? `${deckReview.detectedSections.length} of 8 expected sections were detected in parsed text.` : "No readable deck evidence was available." },
    { id: "profile_positioning", label: "LinkedIn/founder positioning", score: profilePositioning, weight: 5, categories: ["profile", "founder"], explanation: profilePositioning >= 70 ? "The profile uses authority and execution signals." : "The profile needs a sharper role, proof, and mission statement." },
  ];

  return definitions.map(({ categories, ...dimension }) => ({
    ...dimension,
    evidenceIds: evidenceIds(dossier, categories),
  }));
}

function findingForDimension(dimension: DimensionScore, kind: "strength" | "red_flag"): GrillFinding {
  return {
    id: `${kind}-${dimension.id}`,
    severity: kind === "strength" ? "info" : dimension.score < 30 ? "critical" : "warning",
    title: `${dimension.label}: ${dimension.score}/100`,
    body: dimension.explanation,
    evidenceIds: dimension.evidenceIds,
  };
}

function evidenceCoverage(dossier: GrillDossier) {
  const missing = dossier.missingInformation.filter((item) => item.severity === "missing").length;
  const weak = dossier.missingInformation.filter((item) => item.severity === "weak").length;
  return clamp(100 - missing * 7 - weak * 3);
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function sentenceFragment(value: string, fallback: string) {
  return value.trim().replace(/[.!?]+$/, "") || fallback;
}

const actionTemplates: Record<GrillDimensionId, (dossier: GrillDossier, deckReview: DeckReview) => Omit<PrioritizedAction, "id" | "priority" | "guidanceIds">> = {
  founder_credibility: (dossier) => ({ title: "Replace biography with operating proof", why: "Investors need evidence that the founder can execute under this company's constraints.", action: `Add one ${dossier.startup.name || "startup"}-relevant achievement with scope, metric, and the founder's direct responsibility.` }),
  founder_market_fit: (dossier) => ({ title: "Make the founder-market bridge explicit", why: "Relevant experience only helps when the reader can connect it to the first customer and problem.", action: `Write two sentences connecting ${dossier.founder.fullName || "the founder"}'s prior work to ${sentenceFragment(dossier.startup.targetCustomer, "the target customer")}.` }),
  problem_clarity: (dossier) => ({ title: "Quantify the customer pain", why: "A broad pain statement is hard to prioritize or validate.", action: `For ${sentenceFragment(dossier.startup.targetCustomer, "the first customer")}, state the current workflow, frequency, and measurable cost of the problem.` }),
  solution_clarity: (dossier) => ({ title: "Show the product mechanism", why: "Category labels do not explain what changes for the user.", action: `Rewrite ${dossier.startup.name || "the startup"}'s pitch as customer + trigger + product action + measurable outcome.` }),
  market_quality: (dossier) => ({ title: "Build a bottom-up entry market", why: "A large top-down market does not prove reachable demand.", action: `Estimate the first reachable buyer count for ${sentenceFragment(dossier.startup.targetCustomer, "the target segment")}, expected annual value, and buying trigger.` }),
  differentiation: () => ({ title: "Name the current alternative", why: "Differentiation is credible only against what customers use today.", action: "Compare the product against the top two current alternatives on workflow, evidence, switching cost, and result." }),
  traction_evidence: (dossier) => ({ title: "Turn traction into an evidence table", why: "Unbounded claims cannot support readiness or investor confidence.", action: `For ${dossier.startup.name || "the startup"}, list each traction metric with value, period, denominator, and verification source.` }),
  funding_narrative: () => ({ title: "Tie the raise to de-risking milestones", why: "Department budgets do not show what the round will prove.", action: "State the exact raise, runway, and the two or three measurable milestones the capital must unlock." }),
  deck_readiness: (_dossier, deckReview) => {
    if (deckReview.status === "parsed") {
      const missingSections = deckReview.missingSections.join(", ");
      return {
        title: "Complete the parsed deck story",
        why: missingSections
          ? `The parsed deck is missing explicit ${missingSections} evidence.`
          : "The parsed deck needs a clearer evidence chain across its core narrative.",
        action: missingSections
          ? `Add the missing ${missingSections} sections to the current deck and support each claim with concrete evidence.`
          : "Connect each core section to a concrete claim, metric, or source in the current deck.",
      };
    }
    return {
      title: "Repair the deck evidence chain",
      why: "A missing or unreadable deck blocks narrative and slide-level review.",
      action: "Upload a readable text-based PDF and ensure problem, solution, market, traction, competition, team, model, and fundraise sections are explicit.",
    };
  },
  profile_positioning: (dossier) => ({ title: "Rewrite the founder opening", why: "The opening lines should establish current role, authority, and mission immediately.", action: `Lead with ${dossier.founder.role || "the founder role"}, one quantified proof point, and the specific mission at ${dossier.startup.name || "the startup"}.` }),
};

function buildActions(
  dossier: GrillDossier,
  dimensions: DimensionScore[],
  guidance: RetrievedGuidance[],
  deckReview: DeckReview,
) {
  const sorted = [...dimensions].sort((left, right) => left.score - right.score || left.id.localeCompare(right.id));
  return sorted.slice(0, 7).map((dimension, index) => {
    const template = actionTemplates[dimension.id](dossier, deckReview);
    const priority: PrioritizedAction["priority"] = index < 3 ? "fix_now" : index < 5 ? "fix_next" : "improve_later";
    const matchingGuidance = guidance
      .filter((item) => item.tags.some((tag) => `${dimension.id} ${dimension.label}`.toLowerCase().includes(tag)))
      .map((item) => item.id);
    return {
      ...template,
      id: `action-${dimension.id}`,
      priority,
      guidanceIds: (matchingGuidance.length ? matchingGuidance : guidance.map((item) => item.id)).slice(0, 2),
    };
  });
}

function verdictFor(score: number, confidence: GrillReport["confidence"]) {
  if (score >= 80) return `Funding-ready foundation, ${confidence} confidence. The story is credible but still has room to sharpen.`;
  if (score >= 65) return `Promising, but not yet investor-tight. The next gains come from evidence and narrative precision.`;
  if (score >= 45) return `The idea is visible; the proof is not. Fix the evidence chain before broad outreach.`;
  return `Your funding story is running on assertion. Build proof before you ask investors to believe it.`;
}

export class DeterministicGrillEngine implements GrillEngine {
  analyze(dossier: GrillDossier, guidance: RetrievedGuidance[]): GrillReport {
    const deckReview = buildDeckReview(dossier);
    const dimensions = dimensionsFor(dossier, deckReview);
    const contradictions = findContradictions(dossier);
    const unsupportedClaims = findUnsupportedClaims(dossier);
    const coverage = evidenceCoverage(dossier);
    const weightedTotal = dimensions.reduce((sum, dimension) => sum + dimension.score * dimension.weight, 0);
    const totalWeight = dimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
    const baseScore = weightedTotal / totalWeight;
    const overallScore = clamp(baseScore - contradictions.length * 8 - unsupportedClaims.length * 2);
    const confidence: GrillReport["confidence"] =
      coverage >= 75 && contradictions.length === 0 && deckReview.status === "parsed"
        ? "high"
        : coverage >= 45 && contradictions.length <= 1
          ? "medium"
          : "low";
    const sorted = [...dimensions].sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
    const strongestDimension = sorted[0].id;
    const weakestDimension = sorted[sorted.length - 1].id;
    const strengths = sorted.filter((dimension) => dimension.score >= 70).slice(0, 4).map((dimension) => findingForDimension(dimension, "strength"));
    const dimensionFlags = [...dimensions]
      .sort((left, right) => left.score - right.score || left.id.localeCompare(right.id))
      .filter((dimension) => dimension.score < 50)
      .slice(0, 5)
      .map((dimension) => findingForDimension(dimension, "red_flag"));
    const missingEvidence = dossier.missingInformation.map((item, index) => ({
      id: `missing-${index + 1}`,
      severity: item.severity === "missing" ? "critical" as const : "warning" as const,
      title: item.label,
      body: item.reason,
      evidenceIds: [],
    }));
    const profileDimension = dimensions.find((dimension) => dimension.id === "profile_positioning");
    const profileReview = buildProfileReview(dossier, profileDimension?.score ?? 0);
    const retrievedGuidanceIds = guidance.map((item) => item.id);
    const reportId = `grill-${stableHash(JSON.stringify({ dossier, retrievedGuidanceIds, rubric: GRILL_RUBRIC_VERSION }))}`;

    return {
      schemaVersion: 1,
      reportId,
      rubricVersion: GRILL_RUBRIC_VERSION,
      overallScore,
      evidenceCoverage: coverage,
      confidence,
      verdict: verdictFor(overallScore, confidence),
      strongestDimension,
      weakestDimension,
      dimensions,
      strengths,
      redFlags: [...contradictions, ...dimensionFlags],
      contradictions,
      unsupportedClaims,
      missingEvidence,
      highestLeverageActions: buildActions(dossier, dimensions, guidance, deckReview),
      deckReview,
      profileReview,
      retrievedGuidanceIds,
      startupName: dossier.startup.name,
      founderName: dossier.founder.fullName,
    };
  }
}
