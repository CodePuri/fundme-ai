export const GRILL_SESSION_VERSION = 1 as const;
export const CANONICAL_RUBRIC_VERSION = "fundme-rubric@2026.08-calibrated-v1" as const;
export const DEMO_RUBRIC_VERSION = CANONICAL_RUBRIC_VERSION;
export const SUPPORTED_RUBRIC_VERSIONS = [
  "fundme-rubric@2026.08-calibrated-v1",
  "fundme-demo-rubric@1",
] as const;
export type RubricVersion = typeof SUPPORTED_RUBRIC_VERSIONS[number];

export type AssessmentRoute =
  | "/assessment"
  | "/assessment/analyzing"
  | "/assessment/review"
  | "/assessment/mentor"
  | "/assessment/result";

export type GrillStage = "intake" | "review" | "mentor" | "result";
export type ArtifactKind = "pitch-deck" | "founder-profile" | "notes";
export type ArtifactStatus = "attached" | "rejected";
export type MentorQuestionId = "stage" | "traction" | "founder-fit" | "differentiation" | "funding-outcome";
export type AnswerSource = "typed" | "voice";
export type VoiceState =
  | "idle"
  | "requesting-permission"
  | "listening"
  | "transcribing"
  | "transcript-ready"
  | "failed"
  | "unavailable";

export type AssessmentProcessingState =
  | "preparing"
  | "validating"
  | "questioning"
  | "ready"
  | "assessing"
  | "partial"
  | "complete"
  | "failed"
  | "recoverable";

export type TractionState = "missing" | "none" | "positive" | "contradictory";

export type StartupInput = {
  startupName: string;
  websiteUrl: string;
  founderName: string;
  founderRole: string;
  description: string;
  profileText: string;
  linkedInUrl?: string;
  websiteTitle?: string;
  websiteDescription?: string;
  extractedWebsiteText?: string;
  productSignals?: string[];
};

export type ArtifactMetadata = {
  id: string;
  kind: ArtifactKind;
  name: string;
  size: number;
  type: string;
  status: ArtifactStatus;
  attachedAt: string;
  extractedText?: string;
  pageCount?: number;
  detectedSections?: string[];
};

export type MentorAnswer = {
  questionId: MentorQuestionId;
  text: string;
  source: AnswerSource;
  answeredAt: string;
};

export type ConversationEvent = {
  id: string;
  role: "mentor" | "founder" | "system";
  kind: "question" | "answer" | "skip" | "status";
  content: string;
  questionId?: MentorQuestionId;
  source?: AnswerSource;
  createdAt: string;
};

export type EvidenceReference = {
  id: string;
  label: string;
  value: string;
  state: "submitted" | "attached" | "missing";
};

export type DimensionId =
  | "founder-credibility"
  | "founder-market-fit"
  | "problem-clarity"
  | "solution-clarity"
  | "market-clarity"
  | "differentiation"
  | "product-maturity"
  | "traction-proof"
  | "funding-narrative"
  | "pitch-deck-readiness";

export type DimensionScore = {
  id: DimensionId;
  label: string;
  score: number;
  explanation: string;
  evidenceUsed: string[];
  missingEvidence: string[];
};

export type Finding = {
  id: string;
  type: "strength" | "red-flag" | "contradiction" | "unsupported-claim" | "missing-evidence";
  severity: "low" | "medium" | "high";
  dimension: DimensionId;
  explanation: string;
  evidenceIds: string[];
  action: string;
};

export type ActionItem = {
  horizon: "fix-now" | "fix-next" | "improve-later";
  title: string;
  detail: string;
};

export type FundingReadinessReport = {
  rubricVersion: typeof DEMO_RUBRIC_VERSION;
  generatedAt: string;
  readinessScore: number;
  verdict: string;
  conciseVerdict: string;
  evidenceCoverage: number;
  confidence: "low" | "medium" | "high";
  completionState: "complete" | "partial";
  tractionState: TractionState;
  strongestDimension: DimensionId;
  weakestDimension: DimensionId;
  dimensions: DimensionScore[];
  evidence: EvidenceReference[];
  findings: Finding[];
  founderReview: {
    credibility: string;
    founderMarketFit: string;
    profilePositioning: string;
  };
  startupReview: {
    problem: string;
    solution: string;
    market: string;
    differentiation: string;
    traction: string;
    fundingNarrative: string;
  };
  deckReview: {
    status: "not-provided" | "received-unparsed" | "parsed";
    summary: string;
    findings: string[];
  };
  actions: ActionItem[];
};

export type EarlyAccessState = {
  email: string;
  status: "idle" | "submitting" | "success" | "error";
  error?: string;
  referralCode: string | null;
};

export type GrillSession = {
  version: typeof GRILL_SESSION_VERSION;
  mode: "demo";
  stage: GrillStage;
  processingState: AssessmentProcessingState;
  input: StartupInput;
  artifacts: ArtifactMetadata[];
  conversation: ConversationEvent[];
  answers: Partial<Record<MentorQuestionId, MentorAnswer>>;
  skippedQuestionIds: MentorQuestionId[];
  reviewedAt: string | null;
  report: FundingReadinessReport | null;
  earlyAccess: EarlyAccessState;
  persistenceWarning: string | null;
  updatedAt: string;
  claimToken?: string;
};

export type MentorQuestion = {
  id: MentorQuestionId;
  prompt: string;
  whyItMatters: string;
  placeholder: string;
};
