import {
  DEMO_RUBRIC_VERSION,
  type DimensionId,
  type DimensionScore,
  type EvidenceReference,
  type Finding,
  type FundingReadinessReport,
  type GrillSession,
  type MentorQuestionId,
  type TractionState,
} from "./types.ts";

const DIMENSION_LABELS: Record<DimensionId, string> = {
  "founder-credibility": "Founder credibility",
  "founder-market-fit": "Founder-market fit",
  "problem-clarity": "Problem clarity",
  "solution-clarity": "Solution clarity",
  "market-clarity": "Market clarity",
  differentiation: "Differentiation",
  "product-maturity": "Product maturity",
  "traction-proof": "Traction proof",
  "funding-narrative": "Funding narrative",
  "pitch-deck-readiness": "Pitch-deck readiness",
};

const SPECIFICITY_PATTERN = /(?:\b\d+(?:[.,]\d+)?\b|₹|\$|%|paid|revenue|retention|pilot|customer|user|month|year|arr|mrr)/i;

const TRACTION_COUNT_QUALIFIER = "(?:(?:active|beta|monthly\\s+active|weekly\\s+active|daily\\s+active|paying|paid)\\s+)?";
const MISSING_TRACTION_PATTERN = /^\s*(?:not provided|unknown|n\/?a|prefer not to say)?\s*$/i;
const HISTORICAL_MARKER_PATTERN = /\b(?:previously|last\s+(?:year|month)|initially|before\s+launch|at\s+launch|earlier|used\s+to|in\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|\d{4}))\b/gi;
const CURRENT_MARKER_PATTERN = /\b(?:now|currently|today|current)\b/gi;

type TractionTimeframe = "historical" | "current" | "unknown";
type TractionMetric = "user" | "customer" | "pilot" | "signup" | "download" | "revenue" | "mrr" | "arr" | "launch";
type MetricClaim = {
  metric: TractionMetric;
  polarity: "positive" | "negative";
  value: number | null;
  timeframe: TractionTimeframe;
  text: string;
  start: number;
  end: number;
};

export type TractionClassification = {
  state: TractionState;
  positiveClaims: string[];
  negativeClaims: string[];
  ambiguousTimeline: boolean;
};

function markerPositions(text: string, pattern: RegExp): Array<{ start: number; end: number }> {
  return [...text.matchAll(pattern)].map((match) => ({
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));
}

function distanceFromRange(marker: { start: number; end: number }, start: number, end: number): number {
  if (marker.end < start) return start - marker.end;
  if (marker.start > end) return marker.start - end;
  return 0;
}

function claimTimeframe(
  start: number,
  end: number,
  historicalMarkers: Array<{ start: number; end: number }>,
  currentMarkers: Array<{ start: number; end: number }>,
): TractionTimeframe {
  const historicalDistance = Math.min(...historicalMarkers.map((marker) => distanceFromRange(marker, start, end)), Number.POSITIVE_INFINITY);
  const currentDistance = Math.min(...currentMarkers.map((marker) => distanceFromRange(marker, start, end)), Number.POSITIVE_INFINITY);
  const closestDistance = Math.min(historicalDistance, currentDistance);
  if (closestDistance > 48) return "unknown";
  if (historicalDistance < currentDistance) return "historical";
  if (currentDistance < historicalDistance) return "current";
  return "unknown";
}

function normalizeMetric(rawMetric: string): TractionMetric {
  const metric = rawMetric.toLowerCase().replace(/s$/, "");
  if (metric === "users" || metric === "user") return "user";
  if (metric === "customers" || metric === "customer") return "customer";
  if (metric === "pilots" || metric === "pilot") return "pilot";
  if (metric === "signups" || metric === "signup") return "signup";
  if (metric === "downloads" || metric === "download") return "download";
  return metric as TractionMetric;
}

function numericValue(rawValue: string): number {
  return Number(rawValue.replaceAll(",", "").trim());
}

function isLocallyNegated(
  text: string,
  claimStart: number,
  metric: TractionMetric,
): boolean {
  const rawPrefix = text.slice(Math.max(0, claimStart - 72), claimStart);
  const clauseBoundary = Math.max(
    rawPrefix.lastIndexOf("."),
    rawPrefix.lastIndexOf("!"),
    rawPrefix.lastIndexOf("?"),
    rawPrefix.lastIndexOf(";"),
    rawPrefix.lastIndexOf(":"),
    rawPrefix.lastIndexOf(","),
  );
  const clausePrefix = rawPrefix.slice(clauseBoundary + 1);
  const contrastBoundary = [...clausePrefix.matchAll(/\b(?:but|however|although|whereas)\b/gi)].at(-1);
  const localPrefix = contrastBoundary
    ? clausePrefix.slice((contrastBoundary.index ?? 0) + contrastBoundary[0].length)
    : clausePrefix;

  const negatedQuantity = /(?:\b(?:do|does|did)\s+not\s+(?:yet\s+|currently\s+)?(?:have|generate|onboard|reach|acquire|sign)|\b(?:don|doesn|didn)['’]t\s+(?:yet\s+|currently\s+)?(?:have|generate|onboard|reach|acquire|sign)|\b(?:have|has|had)\s+not\s+(?:yet\s+)?(?:reached|generated|acquired|signed|onboarded|gone)|\b(?:haven|hasn|hadn)['’]t\s+(?:yet\s+)?(?:reached|generated|acquired|signed|onboarded|gone)|\b(?:are|is|was|were)\s+not\s+(?:currently\s+|yet\s+)?(?:generating|at)|\b(?:aren|isn|wasn|weren)['’]t\s+(?:currently\s+|yet\s+)?(?:generating|at)|\bnot\s+(?:currently\s+|yet\s+)?(?:generating|at)|\b(?:not|no\s+more\s+than))\s*$/i;
  if (negatedQuantity.test(localPrefix)) return true;

  return metric === "launch"
    && /(?:\b(?:are|is|was|were)\s+not|\b(?:aren|isn|wasn|weren)['’]t)\s+(?:currently\s+|yet\s+)?$/i.test(localPrefix);
}

function collectMetricClaims(text: string): MetricClaim[] {
  const historicalMarkers = markerPositions(text, HISTORICAL_MARKER_PATTERN);
  const currentMarkers = markerPositions(text, CURRENT_MARKER_PATTERN);
  const claims: MetricClaim[] = [];
  const keys = new Set<string>();

  const addClaimRange = (
    start: number,
    end: number,
    claimText: string,
    metric: TractionMetric,
    polarity: MetricClaim["polarity"],
    value: number | null,
  ) => {
    const key = `${start}:${end}:${metric}:${polarity}:${value ?? "none"}`;
    if (keys.has(key)) return;
    keys.add(key);
    claims.push({
      metric,
      polarity,
      value,
      timeframe: claimTimeframe(start, end, historicalMarkers, currentMarkers),
      text: claimText.trim(),
      start,
      end,
    });
  };

  const addClaim = (
    match: RegExpMatchArray,
    metric: TractionMetric,
    polarity: MetricClaim["polarity"],
    value: number | null,
  ) => {
    const start = match.index ?? 0;
    addClaimRange(start, start + match[0].length, match[0], metric, polarity, value);
  };

  const countPattern = new RegExp(
    `\\b(\\d[\\d,]*(?:\\.\\d+)?)\\s*${TRACTION_COUNT_QUALIFIER}(users?|customers?|pilots?|signups?|downloads?)\\b`,
    "gi",
  );
  for (const match of text.matchAll(countPattern)) {
    const count = numericValue(match[1]);
    const metric = normalizeMetric(match[2]);
    const negated = isLocallyNegated(text, match.index ?? 0, metric);
    addClaim(match, metric, count > 0 && !negated ? "positive" : "negative", count);
  }

  for (const marker of currentMarkers) {
    const beforeMarker = text.slice(Math.max(0, marker.start - 24), marker.start);
    const afterMarker = text.slice(marker.end, Math.min(text.length, marker.end + 32));
    const beforeValue = beforeMarker.match(/(\d[\d,]*(?:\.\d+)?)\s*$/);
    const afterValue = afterMarker.match(/^\s*(?:(?:we\s+)?(?:have|had|are|is|at)\s+)?(\d[\d,]*(?:\.\d+)?)/i);
    const rawValue = beforeValue?.[1] ?? afterValue?.[1];
    if (!rawValue) continue;

    const valueStart = beforeValue
      ? marker.start - beforeMarker.length + (beforeValue.index ?? 0)
      : marker.end + (afterValue?.index ?? 0) + (afterValue?.[0].lastIndexOf(rawValue) ?? 0);
    const valueEnd = valueStart + rawValue.length;
    const sourceClaim = claims
      .filter((claim) => claim.end <= valueStart
        && valueStart - claim.end <= 80
        && claim.timeframe === "historical"
        && ["user", "customer", "pilot", "signup", "download"].includes(claim.metric))
      .sort((left, right) => right.end - left.end)[0];
    if (!sourceClaim) continue;

    const claimStart = beforeValue ? valueStart : marker.start;
    const claimEnd = beforeValue ? marker.end : valueEnd;
    const value = numericValue(rawValue);
    addClaimRange(
      claimStart,
      claimEnd,
      text.slice(claimStart, claimEnd),
      sourceClaim.metric,
      value > 0 ? "positive" : "negative",
      value,
    );
  }

  const wordZeroPattern = /\b(?:no(?:\s+current)?|zero)\s+(?:paying\s+)?(users?|customers?|pilots?|signups?|downloads?|revenue|mrr|arr)\b/gi;
  for (const match of text.matchAll(wordZeroPattern)) {
    addClaim(match, normalizeMetric(match[1]), "negative", 0);
  }

  const missingPattern = /\b(?:do\s+not|don['’]t)\s+have\s+(?:any\s+)?(?:paying\s+)?(users?|customers?|pilots?|revenue|mrr|arr)\b/gi;
  for (const match of text.matchAll(missingPattern)) {
    addClaim(match, normalizeMetric(match[1]), "negative", 0);
  }

  const metricThenZeroPattern = /\b(revenue|mrr|arr)\s+(?:is|was|=|at)?\s*(?:[$₹]\s*)?(0|zero)\b/gi;
  for (const match of text.matchAll(metricThenZeroPattern)) {
    addClaim(match, normalizeMetric(match[1]), "negative", 0);
  }

  const amountThenMetricPattern = /(?:([$₹])\s*)?(\d[\d,]*(?:\.\d+)?)\s*(?:lakh|lac|crore|k|m)?\s*(?:(?:in|of)\s+|annual\s+recurring\s+)?(revenue|mrr|arr)\b/gi;
  for (const match of text.matchAll(amountThenMetricPattern)) {
    const amount = numericValue(match[2]);
    const metric = normalizeMetric(match[3]);
    const negated = isLocallyNegated(text, match.index ?? 0, metric);
    addClaim(match, metric, amount > 0 && !negated ? "positive" : "negative", amount);
  }

  const negatedRevenuePattern = /\b(?:pre[-\s]?revenue|(?:(?:aren|isn)['’]t|not)\s+(?:(?:currently|now|yet)\s+)?generating\s+(?:any\s+)?revenue)\b/gi;
  for (const match of text.matchAll(negatedRevenuePattern)) {
    addClaim(match, "revenue", "negative", 0);
  }

  const negatedLaunchPattern = /\b(?:(?:have|has)\s+not|(?:haven|hasn)['’]t|not)\s+launched\b/gi;
  for (const match of text.matchAll(negatedLaunchPattern)) {
    addClaim(match, "launch", "negative", null);
  }

  const positiveRevenuePattern = /\b(?:have|has|generating)\s+(?:positive\s+)?(revenue|mrr|arr)\b/gi;
  for (const match of text.matchAll(positiveRevenuePattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const overlapsNegative = claims.some((claim) => claim.metric === normalizeMetric(match[1])
      && claim.polarity === "negative"
      && claim.start < end
      && claim.end > start);
    if (!overlapsNegative) {
      addClaim(match, normalizeMetric(match[1]), "positive", null);
    }
  }

  const positiveCustomerPattern = /\b(?:paying|paid)\s+(customers?|users?|pilots?)\b/gi;
  for (const match of text.matchAll(positiveCustomerPattern)) {
    const overlap = claims.some((claim) => claim.polarity === "negative" && claim.text.includes(match[0]));
    if (!overlap) addClaim(match, normalizeMetric(match[1]), "positive", null);
  }

  const positiveLaunchPattern = /\b(?:launched|live)\b/gi;
  for (const match of text.matchAll(positiveLaunchPattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (isLocallyNegated(text, start, "launch")) {
      addClaim(match, "launch", "negative", null);
      continue;
    }
    const overlapsNegative = claims.some((claim) => claim.metric === "launch"
      && claim.polarity === "negative"
      && claim.start < end
      && claim.end > start);
    if (!overlapsNegative) addClaim(match, "launch", "positive", null);
  }

  return claims;
}

function claimsConflict(claims: MetricClaim[]): boolean {
  const positiveClaims = claims.filter((claim) => claim.polarity === "positive");
  const positiveValues = new Set(positiveClaims.filter((claim) => claim.value !== null).map((claim) => claim.value));
  if (positiveValues.size > 1) return true;

  const categoricalAbsence = claims.some((claim) => claim.polarity === "negative"
    && (claim.value === 0 || claim.value === null));
  if (positiveClaims.length && categoricalAbsence) return true;

  const negatedThresholds = new Set(claims
    .filter((claim) => claim.polarity === "negative" && claim.value !== null && claim.value > 0)
    .map((claim) => claim.value));
  return [...positiveValues].some((value) => negatedThresholds.has(value));
}

function conflictsWithinCurrentTimeframe(claims: MetricClaim[]): boolean {
  return claimsConflict(claims.filter((claim) => claim.timeframe === "current"));
}

function hasAmbiguousTimeline(claims: MetricClaim[]): boolean {
  return claimsConflict(claims.filter((claim) => claim.timeframe === "unknown"));
}

export function classifyTraction(value: string): TractionClassification {
  const text = value.trim();
  if (MISSING_TRACTION_PATTERN.test(text)) {
    return { state: "missing", positiveClaims: [], negativeClaims: [], ambiguousTimeline: false };
  }

  const claims = collectMetricClaims(text);
  const claimsByMetric = new Map<TractionMetric, MetricClaim[]>();
  for (const claim of claims) {
    const metricClaims = claimsByMetric.get(claim.metric) ?? [];
    metricClaims.push(claim);
    claimsByMetric.set(claim.metric, metricClaims);
  }

  const positiveClaims = [...new Set(claims.filter((claim) => claim.polarity === "positive").map((claim) => claim.text))];
  const negativeClaims = [...new Set(claims.filter((claim) => claim.polarity === "negative").map((claim) => claim.text))];
  const contradictory = [...claimsByMetric.values()].some(conflictsWithinCurrentTimeframe);
  const ambiguousTimeline = !contradictory && [...claimsByMetric.values()].some(hasAmbiguousTimeline);
  const currentClaims = claims.filter((claim) => claim.timeframe === "current");

  if (contradictory) return { state: "contradictory", positiveClaims, negativeClaims, ambiguousTimeline: false };
  if (currentClaims.length) {
    return {
      state: currentClaims.some((claim) => claim.polarity === "positive") ? "positive" : "none",
      positiveClaims,
      negativeClaims,
      ambiguousTimeline,
    };
  }
  if (positiveClaims.length) return { state: "positive", positiveClaims, negativeClaims, ambiguousTimeline };
  return { state: "none", positiveClaims, negativeClaims, ambiguousTimeline };
}

function answer(session: GrillSession, id: MentorQuestionId): string {
  return session.answers[id]?.text.trim() ?? "";
}

function evidenceScore(value: string, base = 30): number {
  if (!value) return base;
  const lengthScore = Math.min(30, Math.floor(value.length / 4));
  const specificityScore = SPECIFICITY_PATTERN.test(value) ? 25 : 8;
  return Math.min(92, base + lengthScore + specificityScore);
}

function dimension(
  id: DimensionId,
  score: number,
  explanation: string,
  evidenceUsed: string[],
  missingEvidence: string[],
): DimensionScore {
  return {
    id,
    label: DIMENSION_LABELS[id],
    score: Math.max(0, Math.min(100, Math.round(score))),
    explanation,
    evidenceUsed,
    missingEvidence,
  };
}

function missingFinding(
  id: string,
  dimensionId: DimensionId,
  explanation: string,
  action: string,
): Finding {
  return {
    id,
    type: "missing-evidence",
    severity: "medium",
    dimension: dimensionId,
    explanation,
    evidenceIds: [],
    action,
  };
}

export function assessSession(session: GrillSession, generatedAt: string): FundingReadinessReport {
  const stage = answer(session, "stage");
  const traction = answer(session, "traction");
  const tractionClassification = classifyTraction(traction);
  const founderFit = answer(session, "founder-fit");
  const differentiation = answer(session, "differentiation");
  const fundingOutcome = answer(session, "funding-outcome");
  const hasDeck = session.artifacts.some(
    (artifact) => artifact.kind === "pitch-deck" && artifact.status === "attached",
  );
  const description = session.input.description.trim();
  const profile = session.input.profileText.trim();

  const evidence: EvidenceReference[] = [
    { id: "startup-description", label: "Startup description", value: description, state: "submitted" },
    { id: "founder-role", label: "Founder role", value: session.input.founderRole.trim(), state: "submitted" },
    { id: "founder-profile", label: "Founder profile", value: profile || "Not supplied", state: profile ? "submitted" : "missing" },
    { id: "stage-answer", label: "Product stage", value: stage || "Not answered", state: stage ? "submitted" : "missing" },
    { id: "traction-answer", label: "Traction", value: traction || "Not answered", state: traction ? "submitted" : "missing" },
    { id: "founder-fit-answer", label: "Founder-market fit", value: founderFit || "Not answered", state: founderFit ? "submitted" : "missing" },
    { id: "differentiation-answer", label: "Differentiation", value: differentiation || "Not answered", state: differentiation ? "submitted" : "missing" },
    { id: "funding-answer", label: "Funding outcome", value: fundingOutcome || "Not answered", state: fundingOutcome ? "submitted" : "missing" },
    { id: "pitch-deck", label: "Pitch deck", value: hasDeck ? "Attached; contents not parsed" : "Not supplied", state: hasDeck ? "attached" : "missing" },
  ];

  const dimensions: DimensionScore[] = [
    dimension(
      "founder-credibility",
      evidenceScore(`${session.input.founderRole} ${profile}`, 28),
      profile ? "The submitted role and profile establish a reviewable credibility signal." : "The founder role is present, but profile evidence is limited.",
      ["founder-role", ...(profile ? ["founder-profile"] : [])],
      profile ? [] : ["Founder profile or relevant operating history"],
    ),
    dimension(
      "founder-market-fit",
      evidenceScore(founderFit, 22),
      founderFit ? "The founder supplied a direct founder-market-fit explanation." : "No founder-market-fit explanation was submitted.",
      founderFit ? ["founder-fit-answer"] : [],
      founderFit ? [] : ["Relevant experience, access, or lived insight"],
    ),
    dimension(
      "problem-clarity",
      evidenceScore(description, 32),
      "This score uses only the submitted one-line startup description.",
      ["startup-description"],
      ["A quantified customer pain signal"],
    ),
    dimension(
      "solution-clarity",
      evidenceScore(description, 30),
      "The submitted description identifies the proposed product outcome, but not a verified product walkthrough.",
      ["startup-description"],
      ["Product workflow or usage evidence"],
    ),
    dimension(
      "market-clarity",
      evidenceScore(`${description} ${traction}`, 20),
      "Market clarity is inferred only from named users and submitted traction context.",
      ["startup-description", ...(traction ? ["traction-answer"] : [])],
      ["Market size and reachable segment evidence"],
    ),
    dimension(
      "differentiation",
      evidenceScore(differentiation, 20),
      differentiation ? "The founder named an alternative and switching rationale." : "No competitive alternative or switching rationale was submitted.",
      differentiation ? ["differentiation-answer"] : [],
      differentiation ? [] : ["Named alternative and measurable advantage"],
    ),
    dimension(
      "product-maturity",
      evidenceScore(stage, 20),
      stage ? "Product maturity reflects the founder's submitted stage statement." : "Product stage was not answered.",
      stage ? ["stage-answer"] : [],
      stage ? [] : ["Current stage and shipping evidence"],
    ),
    dimension(
      "traction-proof",
      tractionClassification.state === "positive" ? evidenceScore(traction, 15) : tractionClassification.state === "contradictory" ? 20 : 15,
      tractionClassification.state === "positive"
        ? "Traction strength depends on the specificity of the submitted metrics."
        : tractionClassification.state === "missing"
          ? "No traction information was submitted."
          : tractionClassification.state === "none"
            ? "The founder explicitly reported no current traction."
            : "The traction answer contains conflicting current claims.",
      traction ? ["traction-answer"] : [],
      tractionClassification.state === "positive" ? [] : ["Users, revenue, retention, pilots, or customer references"],
    ),
    dimension(
      "funding-narrative",
      evidenceScore(fundingOutcome, 18),
      fundingOutcome ? "The use-of-funds statement is scored for specificity and milestone linkage." : "No funding outcome was submitted.",
      fundingOutcome ? ["funding-answer"] : [],
      fundingOutcome ? [] : ["Raise amount, runway, use of funds, and target milestone"],
    ),
    dimension(
      "pitch-deck-readiness",
      hasDeck ? 45 : 30,
      hasDeck ? "A deck was attached, but this Preview does not parse or evaluate its contents." : "No deck was supplied, so deck contents were not assessed.",
      hasDeck ? ["pitch-deck"] : [],
      hasDeck ? ["Parsed slide evidence and narrative review"] : ["Pitch deck"],
    ),
  ];

  const findings: Finding[] = [];
  if (tractionClassification.state === "missing") findings.push(missingFinding("missing-traction", "traction-proof", "No traction information was submitted.", "Add one verifiable traction metric with a date."));
  if (tractionClassification.state === "none") findings.push(missingFinding("no-current-traction", "traction-proof", "The founder explicitly reported no current traction.", "Define the first measurable traction milestone and its target date."));
  if (!founderFit) findings.push(missingFinding("missing-founder-fit", "founder-market-fit", "Founder-market fit is unsupported.", "Explain the team's relevant experience, access, or insight."));
  if (!differentiation) findings.push(missingFinding("missing-differentiation", "differentiation", "The current alternative and switching reason are missing.", "Name the buyer's current workaround and why they would switch."));
  if (!fundingOutcome) findings.push(missingFinding("missing-funding-outcome", "funding-narrative", "The round is not connected to a measurable milestone.", "State the raise, runway, use of funds, and target milestone."));
  if (!hasDeck) findings.push(missingFinding("missing-deck", "pitch-deck-readiness", "No pitch deck was provided.", "Attach a deck when you want its presence represented; parsing is not available in this Preview."));
  if (tractionClassification.ambiguousTimeline) {
    findings.push({
      id: "traction-timeline-unclear",
      type: "unsupported-claim",
      severity: "medium",
      dimension: "traction-proof",
      explanation: "The traction answer contains multiple values without enough timing context to compare them safely.",
      evidenceIds: ["traction-answer"],
      action: "Add dates or explicitly label the historical and current traction values.",
    });
  }

  const claimsPreLaunch = /pre[- ]?launch|(?:(?:have|has)\s+not|(?:haven|hasn)['’]t|not)\s+launched|(?:(?:are|is|was|were)\s+not|(?:aren|isn|wasn|weren)['’]t|not)\s+(?:currently\s+|yet\s+)?live|(?:(?:have|has|had)\s+not|(?:haven|hasn|hadn)['’]t)\s+(?:yet\s+)?gone\s+live|no customers|\bidea\b/i.test(stage)
    && !/live today|now live|currently live|launched today/i.test(stage);
  if (tractionClassification.state === "contradictory") {
    findings.unshift({
      id: "traction-claim-conflict",
      type: "contradiction",
      severity: "high",
      dimension: "traction-proof",
      explanation: "The traction answer contains conflicting current claims.",
      evidenceIds: ["traction-answer"],
      action: "Reconcile the current traction values with dates, definitions, and source evidence.",
    });
  } else if (claimsPreLaunch && tractionClassification.state === "positive") {
    findings.unshift({
      id: "stage-traction-conflict",
      type: "contradiction",
      severity: "high",
      dimension: "traction-proof",
      explanation: "The submitted stage says the startup is pre-launch or has no customers, while the traction answer claims current commercial evidence.",
      evidenceIds: ["stage-answer", "traction-answer"],
      action: "Reconcile the product-stage and traction statements with dates and definitions.",
    });
  }

  if (tractionClassification.state === "positive" && SPECIFICITY_PATTERN.test(traction)) {
    findings.push({
      id: "specific-traction",
      type: "strength",
      severity: "low",
      dimension: "traction-proof",
      explanation: "The traction answer includes a measurable signal.",
      evidenceIds: ["traction-answer"],
      action: "Keep source evidence ready for diligence.",
    });
  }

  const readinessScore = Math.round(
    dimensions.reduce((total, item) => total + item.score, 0) / dimensions.length,
  );
  const submittedEvidence = evidence.filter((item) => item.state !== "missing").length;
  const evidenceCoverage = Math.round((submittedEvidence / evidence.length) * 100);
  const answeredQuestionCount = Object.keys(session.answers).length;
  const completionState = answeredQuestionCount === 5 && session.skippedQuestionIds.length === 0 ? "complete" : "partial";
  const sortedDimensions = [...dimensions].sort((a, b) => b.score - a.score);
  const strongest = sortedDimensions[0];
  const weakest = sortedDimensions.at(-1)!;
  const verdict = readinessScore >= 75
    ? "Fundable signals are forming"
    : readinessScore >= 55
      ? "Promising, with evidence gaps"
      : "Build the evidence base first";

  const baseConfidence: FundingReadinessReport["confidence"] = evidenceCoverage >= 78 ? "high" : evidenceCoverage >= 50 ? "medium" : "low";
  const confidence = findings.some((finding) => finding.type === "contradiction") || tractionClassification.ambiguousTimeline
    ? baseConfidence === "high" ? "medium" : "low"
    : baseConfidence;

  return {
    rubricVersion: DEMO_RUBRIC_VERSION,
    generatedAt,
    readinessScore,
    verdict,
    conciseVerdict: `${verdict}. The score reflects submitted Preview evidence, not an investment decision.`,
    evidenceCoverage,
    confidence,
    completionState,
    tractionState: tractionClassification.state,
    strongestDimension: strongest.id,
    weakestDimension: weakest.id,
    dimensions,
    evidence,
    findings,
    founderReview: {
      credibility: dimensions[0].explanation,
      founderMarketFit: dimensions[1].explanation,
      profilePositioning: profile ? "A founder profile was submitted and used as text evidence." : "Add a founder profile to strengthen positioning evidence.",
    },
    startupReview: {
      problem: dimensions[2].explanation,
      solution: dimensions[3].explanation,
      market: dimensions[4].explanation,
      differentiation: dimensions[5].explanation,
      traction: dimensions[7].explanation,
      fundingNarrative: dimensions[8].explanation,
    },
    deckReview: {
      status: hasDeck ? "received-unparsed" : "not-provided",
      summary: hasDeck
        ? "The pitch deck was received as attachment metadata. Its contents were not parsed or analyzed in this Preview."
        : "No pitch deck was provided, so no deck analysis was performed.",
      findings: [],
    },
    actions: [
      ...findings.filter((finding) => finding.severity === "high").slice(0, 1).map((finding) => ({ horizon: "fix-now" as const, title: "Resolve conflicting evidence", detail: finding.action })),
      { horizon: "fix-now", title: `Strengthen ${weakest.label.toLowerCase()}`, detail: weakest.missingEvidence[0] ?? weakest.explanation },
      { horizon: "fix-next", title: "Package source evidence", detail: "Keep dates, source records, and definitions beside every material metric." },
      { horizon: "improve-later", title: "Re-run after evidence changes", detail: "Use the same rubric version to compare progress without changing the scoring boundary." },
    ],
  };
}
