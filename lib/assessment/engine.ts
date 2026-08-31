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
  const stageAnswer = answer(session, "stage");
  const tractionAnswer = answer(session, "traction");
  const founderFitAnswer = answer(session, "founder-fit");
  const differentiationAnswer = answer(session, "differentiation");
  const fundingOutcomeAnswer = answer(session, "funding-outcome");
  
  const deckArtifact = session.artifacts.find(
    (artifact) => artifact.kind === "pitch-deck" && artifact.status === "attached",
  );
  const hasDeck = Boolean(deckArtifact);
  const isDeckParsed = Boolean(deckArtifact?.extractedText || (deckArtifact?.detectedSections && deckArtifact.detectedSections.length > 0));
  
  const description = session.input.description.trim();
  const profile = session.input.profileText.trim();
  const linkedInUrl = session.input.linkedInUrl?.trim() ?? "";
  const founderProfileArtifact = session.artifacts.find(
    (artifact) => artifact.kind === "founder-profile" && artifact.status === "attached",
  );
  const isResumeParsed = Boolean(founderProfileArtifact?.extractedText);
  const hasFounderProfileEvidence = Boolean(profile || linkedInUrl || founderProfileArtifact);
  const founderProfileEvidenceValue = profile
    || (isResumeParsed ? `Parsed resume: ${founderProfileArtifact!.name}` : "")
    || (linkedInUrl ? "Founder-submitted LinkedIn profile URL; contents not fetched" : "")
    || (founderProfileArtifact ? `${founderProfileArtifact.name}; contents not parsed` : "Not supplied");
  
  const website = session.input.websiteUrl.trim();
  const websiteExtractedText = session.input.extractedWebsiteText?.trim() || "";
  const websiteTitle = session.input.websiteTitle?.trim() || "";
  const websiteDescription = session.input.websiteDescription?.trim() || "";
  const hasWebsiteContent = Boolean(websiteExtractedText || websiteTitle || websiteDescription);

  // Multi-source extraction for traction
  const tractionExtracted = ((description + " " + websiteExtractedText).match(/(?:\$?\d+(?:[.,]\d+)?\s*(?:k|m|b)?\s*(?:mrr|arr|revenue|customers?|users?|logos?|pilots?|growth)|paying\s+customers?|enterprise\s+logos?|hospital\s+pilots?)[^.]*/gi) || []).join("; ");
  const tractionDeck = deckArtifact?.detectedSections?.includes("traction") ? (deckArtifact.extractedText?.match(/(?:\$?\d+(?:[.,]\d+)?\s*(?:k|m|b)?\s*(?:mrr|arr|revenue|customers?|users?|logos?|pilots?|growth)|annual\s+run\s+rate|arr|mrr)[^.]*/gi)?.join("; ") || "Pitch deck includes traction slide") : "";
  const effectiveTraction = tractionAnswer || tractionExtracted || tractionDeck;
  const tractionClassification = classifyTraction(effectiveTraction);

  // Multi-source extraction for founder-market fit
  const fmfExtracted = profile || (isResumeParsed ? founderProfileArtifact!.extractedText : "") || (deckArtifact?.detectedSections?.includes("team") ? "Pitch deck includes team and experience slide" : "");
  const effectiveFounderFit = founderFitAnswer || fmfExtracted;

  // Multi-source extraction for differentiation
  const diffExtracted = (description + " " + websiteExtractedText).match(/(?:unlike|replaces|alternative|versus|vs\.?|faster than|automated|proprietary|workflow|moat|advantage|competitive|better than)[^.]*/i)?.[0] || (deckArtifact?.detectedSections?.some((s) => s === "competition" || s === "advantage") ? "Pitch deck includes competitive landscape" : "");
  const effectiveDifferentiation = differentiationAnswer || diffExtracted;

  // Multi-source extraction for product maturity / stage
  const combinedMaturityText = (stageAnswer + " " + description + " " + websiteExtractedText + " " + (deckArtifact?.extractedText || "")).toLowerCase();
  let maturityScore = 20;
  let maturityExplanation = "Product stage was not answered.";
  let maturityEvidenceUsed: string[] = [];
  if (stageAnswer) {
    maturityScore = evidenceScore(stageAnswer, 20);
    maturityExplanation = "Product maturity reflects the founder's submitted stage statement.";
    maturityEvidenceUsed = ["stage-answer"];
  } else if (/(?:\$?\d+(?:,\d+)?\s*(?:mrr|arr|revenue)|paying\s+customers?|enterprise\s+logos?|paying\s+teams?|live\s+product|in\s+production)/i.test(combinedMaturityText)) {
    maturityScore = 75;
    maturityExplanation = "Submitted materials confirm live product with commercial adoption.";
    maturityEvidenceUsed = description ? ["startup-description"] : (hasWebsiteContent ? ["startup-website"] : []);
  } else if (/(?:pilot|pilots|beta|poc|agreements?\s+signed|hospital\s+pilots?)/i.test(combinedMaturityText)) {
    maturityScore = 55;
    maturityExplanation = "Submitted materials indicate active pilot validation or beta stage.";
    maturityEvidenceUsed = description ? ["startup-description"] : (hasWebsiteContent ? ["startup-website"] : []);
  } else if (/(?:prototype|architecting|building|mvp)/i.test(combinedMaturityText)) {
    maturityScore = 38;
    maturityExplanation = "Submitted materials describe an active prototype in development.";
    maturityEvidenceUsed = description ? ["startup-description"] : [];
  } else if (/(?:pre[- ]?launch|idea|concept|stealth)/i.test(combinedMaturityText)) {
    maturityScore = 25;
    maturityExplanation = "Product is in early concept / pre-launch stage.";
    maturityEvidenceUsed = description ? ["startup-description"] : [];
  }

  // Multi-source extraction for funding narrative
  const fundingExtracted = ((description + " " + (deckArtifact?.extractedText || "")).match(/(?:raising|raise|seed\s+round|series\s+[a-z]|round\s+size|runway|\$\d+(?:\.\d+)?\s*[mkb])[^.]*/i)?.[0] || "") || (deckArtifact?.detectedSections?.includes("funding-ask") ? "Pitch deck includes funding ask and milestones slide" : "");
  const effectiveFundingOutcome = fundingOutcomeAnswer || fundingExtracted;

  const evidence: EvidenceReference[] = [
    { id: "startup-description", label: "Startup description", value: description || "Not supplied", state: description ? "submitted" : "missing" },
    { id: "startup-website", label: "Startup website", value: website ? (hasWebsiteContent ? `${website} (extracted: ${websiteTitle || websiteDescription || "live content"})` : website) : "Not supplied", state: website ? "submitted" : "missing" },
    { id: "founder-name", label: "Founder name", value: session.input.founderName.trim(), state: "submitted" },
    { id: "founder-role", label: "Founder role", value: session.input.founderRole.trim() || "Not supplied", state: session.input.founderRole.trim() ? "submitted" : "missing" },
    { id: "founder-profile", label: "Founder profile", value: founderProfileEvidenceValue, state: hasFounderProfileEvidence ? "submitted" : "missing" },
    { id: "stage-answer", label: "Product stage", value: stageAnswer || (maturityEvidenceUsed.length ? "Inferred from submitted materials" : "Not answered"), state: stageAnswer || maturityEvidenceUsed.length ? "submitted" : "missing" },
    { id: "traction-answer", label: "Traction", value: effectiveTraction || "Not answered", state: effectiveTraction ? "submitted" : "missing" },
    { id: "founder-fit-answer", label: "Founder-market fit", value: effectiveFounderFit || "Not answered", state: effectiveFounderFit ? "submitted" : "missing" },
    { id: "differentiation-answer", label: "Differentiation", value: effectiveDifferentiation || "Not answered", state: effectiveDifferentiation ? "submitted" : "missing" },
    { id: "funding-answer", label: "Funding outcome", value: effectiveFundingOutcome || "Not answered", state: effectiveFundingOutcome ? "submitted" : "missing" },
    { id: "pitch-deck", label: "Pitch deck", value: isDeckParsed ? `Parsed ${deckArtifact!.pageCount || 1} slides (${deckArtifact!.name})` : (hasDeck ? "Attached; contents not parsed" : "Not supplied"), state: hasDeck ? (isDeckParsed ? "submitted" : "attached") : "missing" },
  ];

  // Scoring pitch deck
  let deckScore = 30;
  let deckExplanation = "No deck was supplied, so deck contents were not assessed.";
  let deckMissing: string[] = ["Pitch deck"];
  let deckStatus: "not-provided" | "received-unparsed" | "parsed" = "not-provided";
  let deckSummary = "No pitch deck was provided, so no deck analysis was performed.";
  const deckFindings: string[] = [];

  if (isDeckParsed && deckArtifact) {
    deckStatus = "parsed";
    const detected = deckArtifact.detectedSections || [];
    const sectionCount = detected.length;
    deckScore = Math.min(88, 52 + sectionCount * 5 + ((deckArtifact.pageCount || 1) >= 6 && (deckArtifact.pageCount || 1) <= 20 ? 8 : 2));
    deckExplanation = `Parsed ${deckArtifact.pageCount || 1} slides from ${deckArtifact.name}. Detected core sections: ${detected.join(", ") || "General content"}.`;
    deckMissing = ["problem", "solution", "traction", "team", "funding-ask"]
      .filter((s) => !detected.includes(s))
      .map((s) => `Explicit ${s.replace("-", " ")} slide`);
    deckSummary = `The pitch deck (${deckArtifact.name}) was parsed into ${deckArtifact.pageCount || 1} slides with ${detected.length} core sections identified.`;
    if (detected.includes("traction")) deckFindings.push("Deck includes dedicated traction and metrics data.");
    if (detected.includes("problem") && detected.includes("solution")) deckFindings.push("Clear problem-solution narrative structure detected.");
    if (!detected.includes("funding-ask")) deckFindings.push("Missing explicit round size, runway, and milestone slide.");
  } else if (hasDeck) {
    deckStatus = "received-unparsed";
    deckScore = 45;
    deckExplanation = "A deck was attached, but this Preview does not parse or evaluate its contents.";
    deckMissing = ["Parsed slide evidence and narrative review"];
    deckSummary = "The pitch deck was received as attachment metadata. Its contents were not parsed or analyzed in this Preview.";
  }

  // Founder credibility score
  const founderText = `${session.input.founderName} ${session.input.founderRole} ${profile} ${isResumeParsed ? founderProfileArtifact?.extractedText || "" : ""}`;
  const founderCredibilityScore = evidenceScore(founderText, 26) + (linkedInUrl || founderProfileArtifact ? 4 : 0);

  const dimensions: DimensionScore[] = [
    dimension(
      "founder-credibility",
      founderCredibilityScore,
      profile || isResumeParsed
        ? "The submitted founder text establishes a reviewable credibility signal."
        : hasFounderProfileEvidence
          ? "Founder profile metadata was supplied, but its contents were not fetched or parsed."
          : "The founder name is present, but operating-history evidence is limited.",
      ["founder-name", ...(session.input.founderRole.trim() ? ["founder-role"] : []), ...(hasFounderProfileEvidence ? ["founder-profile"] : [])],
      hasFounderProfileEvidence ? [] : ["Founder profile or relevant operating history"],
    ),
    dimension(
      "founder-market-fit",
      founderFitAnswer ? evidenceScore(founderFitAnswer, 22) : (effectiveFounderFit ? Math.min(88, evidenceScore(effectiveFounderFit, 24)) : 22),
      founderFitAnswer
        ? "The founder supplied a direct founder-market-fit explanation."
        : (effectiveFounderFit
          ? "Founder background demonstrates relevant domain context and experience."
          : "No founder-market-fit explanation was submitted."),
      founderFitAnswer ? ["founder-fit-answer"] : (hasFounderProfileEvidence ? ["founder-profile"] : (hasDeck ? ["pitch-deck"] : [])),
      effectiveFounderFit ? [] : ["Relevant experience, access, or lived insight"],
    ),
    dimension(
      "problem-clarity",
      evidenceScore(description || (hasWebsiteContent ? `${websiteTitle} ${websiteDescription}` : ""), 32),
      description
        ? "This score uses only the submitted one-line startup description."
        : (hasWebsiteContent
          ? "Problem signals extracted from the submitted startup website."
          : "No startup description was supplied; a website address or deck file is not treated as extracted problem evidence."),
      description ? ["startup-description"] : (hasWebsiteContent ? ["startup-website"] : []),
      ["A quantified customer pain signal"],
    ),
    dimension(
      "solution-clarity",
      evidenceScore(description || (hasWebsiteContent ? websiteDescription : ""), 30),
      description
        ? "The submitted description identifies the proposed product outcome, but not a verified product walkthrough."
        : (hasWebsiteContent
          ? "Solution signals extracted from the submitted startup website."
          : "No solution description was supplied, and this Preview does not infer one from a URL or unparsed deck."),
      description ? ["startup-description"] : (hasWebsiteContent ? ["startup-website"] : []),
      ["Product workflow or usage evidence"],
    ),
    dimension(
      "market-clarity",
      evidenceScore(`${description} ${websiteExtractedText} ${effectiveTraction}`, 20) + (deckArtifact?.detectedSections?.some((s) => s === "market" || s === "business-model") ? 10 : 0),
      "Market clarity is inferred from named users, industry terms, and submitted traction context.",
      [...(description ? ["startup-description"] : []), ...(website ? ["startup-website"] : []), ...(effectiveTraction ? ["traction-answer"] : [])],
      ["Market size and reachable segment evidence"],
    ),
    dimension(
      "differentiation",
      differentiationAnswer ? evidenceScore(differentiationAnswer, 20) : (effectiveDifferentiation ? Math.min(85, evidenceScore(effectiveDifferentiation, 28)) : 20),
      differentiationAnswer
        ? "The founder named an alternative and switching rationale."
        : (effectiveDifferentiation
          ? "Submitted materials identify competitive positioning and workflow advantages."
          : "No competitive alternative or switching rationale was submitted."),
      differentiationAnswer ? ["differentiation-answer"] : (diffExtracted ? (description ? ["startup-description"] : ["startup-website"]) : (hasDeck ? ["pitch-deck"] : [])),
      effectiveDifferentiation ? [] : ["Named alternative and measurable advantage"],
    ),
    dimension(
      "product-maturity",
      maturityScore,
      maturityExplanation,
      maturityEvidenceUsed,
      maturityScore > 25 ? [] : ["Current stage and shipping evidence"],
    ),
    dimension(
      "traction-proof",
      tractionClassification.state === "positive" ? Math.min(92, evidenceScore(effectiveTraction, 28)) : tractionClassification.state === "contradictory" ? 20 : tractionClassification.state === "none" ? 20 : 15,
      tractionClassification.state === "positive"
        ? "Traction strength reflects submitted customer, revenue, or pilot proof."
        : tractionClassification.state === "missing"
          ? "No traction information was submitted."
          : tractionClassification.state === "none"
            ? "The founder explicitly reported no current traction."
            : "The traction answer contains conflicting current claims.",
      effectiveTraction ? (tractionAnswer ? ["traction-answer"] : (description ? ["startup-description"] : (hasWebsiteContent ? ["startup-website"] : ["pitch-deck"]))) : [],
      tractionClassification.state === "positive" ? [] : ["Users, revenue, retention, pilots, or customer references"],
    ),
    dimension(
      "funding-narrative",
      fundingOutcomeAnswer ? evidenceScore(fundingOutcomeAnswer, 18) : (effectiveFundingOutcome ? Math.min(85, evidenceScore(effectiveFundingOutcome, 25)) : 18),
      fundingOutcomeAnswer
        ? "The use-of-funds statement is scored for specificity and milestone linkage."
        : (effectiveFundingOutcome
          ? "Funding ask and milestone targets identified in submitted materials."
          : "No funding outcome was submitted."),
      fundingOutcomeAnswer ? ["funding-answer"] : (fundingExtracted ? (hasDeck ? ["pitch-deck"] : ["startup-description"]) : []),
      effectiveFundingOutcome ? [] : ["Raise amount, runway, use of funds, and target milestone"],
    ),
    dimension(
      "pitch-deck-readiness",
      deckScore,
      deckExplanation,
      hasDeck ? ["pitch-deck"] : [],
      deckMissing,
    ),
  ];

  const findings: Finding[] = [];
  if (tractionClassification.state === "missing") findings.push(missingFinding("missing-traction", "traction-proof", "No traction information was submitted.", "Add one verifiable traction metric with a date."));
  if (tractionClassification.state === "none") findings.push(missingFinding("no-current-traction", "traction-proof", "The founder explicitly reported no current traction.", "Define the first measurable traction milestone and its target date."));
  if (!description && !hasWebsiteContent) findings.push(missingFinding("missing-startup-description", "problem-clarity", "No startup description was submitted, and the Preview did not extract claims from the website or deck.", "Add one sentence naming the customer, problem, and product approach."));
  if (!founderFitAnswer) findings.push(missingFinding("missing-founder-fit", "founder-market-fit", "Founder-market fit is unsupported.", "Explain the team's relevant experience, access, or insight."));
  if (!differentiationAnswer) findings.push(missingFinding("missing-differentiation", "differentiation", "The current alternative and switching reason are missing.", "Name the buyer's current workaround and why they would switch."));
  if (!fundingOutcomeAnswer) findings.push(missingFinding("missing-funding-outcome", "funding-narrative", "The round is not connected to a measurable milestone.", "State the raise, runway, use of funds, and target milestone."));
  if (!hasDeck) findings.push(missingFinding("missing-deck", "pitch-deck-readiness", "No pitch deck was provided.", "Attach a deck when you want its presence represented; parsing is not available in this Preview."));
  if (tractionClassification.ambiguousTimeline) {
    findings.push({
      id: "traction-timeline-unclear",
      type: "unsupported-claim",
      severity: "medium",
      dimension: "traction-proof",
      explanation: "The traction answer contains multiple values without enough timing context to compare them safely.",
      evidenceIds: [tractionAnswer ? "traction-answer" : "startup-description"],
      action: "Add dates or explicitly label the historical and current traction values.",
    });
  }

  const claimsPreLaunch = /pre[- ]?launch|(?:(?:have|has)\s+not|(?:haven|hasn)['’]t|not)\s+launched|(?:(?:are|is|was|were)\s+not|(?:aren|isn|wasn|weren)['’]t|not)\s+(?:currently\s+|yet\s+)?live|(?:(?:have|has|had)\s+not|(?:haven|hasn|hadn)['’]t)\s+(?:yet\s+)?gone\s+live|no customers|\bidea\b/i.test(stageAnswer || description)
    && !/live today|now live|currently live|launched today/i.test(stageAnswer || description);
  if (tractionClassification.state === "contradictory") {
    findings.unshift({
      id: "traction-claim-conflict",
      type: "contradiction",
      severity: "high",
      dimension: "traction-proof",
      explanation: "The traction answer contains conflicting current claims.",
      evidenceIds: [tractionAnswer ? "traction-answer" : "startup-description"],
      action: "Reconcile the current traction values with dates, definitions, and source evidence.",
    });
  } else if (claimsPreLaunch && tractionClassification.state === "positive") {
    findings.unshift({
      id: "stage-traction-conflict",
      type: "contradiction",
      severity: "high",
      dimension: "traction-proof",
      explanation: "The submitted stage says the startup is pre-launch or has no customers, while the traction answer claims current commercial evidence.",
      evidenceIds: [stageAnswer ? "stage-answer" : "startup-description", tractionAnswer ? "traction-answer" : "startup-description"],
      action: "Reconcile the product-stage and traction statements with dates and definitions.",
    });
  }

  if (tractionClassification.state === "positive" && SPECIFICITY_PATTERN.test(effectiveTraction)) {
    findings.push({
      id: "specific-traction",
      type: "strength",
      severity: "low",
      dimension: "traction-proof",
      explanation: "The traction answer includes a measurable signal.",
      evidenceIds: [tractionAnswer ? "traction-answer" : "startup-description"],
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
      profilePositioning: profile || isResumeParsed
        ? "Pasted founder profile text was used as submitted evidence."
        : hasFounderProfileEvidence
          ? "Founder profile metadata was recorded, but its contents were not fetched or parsed."
          : "Add a founder profile to strengthen positioning evidence.",
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
      status: deckStatus,
      summary: deckSummary,
      findings: deckFindings,
    },
    actions: [
      ...findings.filter((finding) => finding.severity === "high").slice(0, 1).map((finding) => ({ horizon: "fix-now" as const, title: "Resolve conflicting evidence", detail: finding.action })),
      { horizon: "fix-now", title: `Strengthen ${weakest.label.toLowerCase()}`, detail: weakest.missingEvidence[0] ?? weakest.explanation },
      { horizon: "fix-next", title: "Package source evidence", detail: "Keep dates, source records, and definitions beside every material metric." },
      { horizon: "improve-later", title: "Re-run after evidence changes", detail: "Use the same rubric version to compare progress without changing the scoring boundary." },
    ],
  };
}