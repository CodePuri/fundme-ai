export type ArtifactKind = "pitch_deck" | "profile_document";
export type ArtifactStatus = "parsed" | "unavailable" | "not_provided";
export type ConfidenceLevel = "low" | "medium" | "high";

export type FounderIntake = {
  fullName: string;
  role: string;
  background: string;
  yearsExperience: number;
  achievements: string;
  profileText: string;
};

export type StartupIntake = {
  name: string;
  website: string;
  oneLinePitch: string;
  problem: string;
  solution: string;
  targetCustomer: string;
  market: string;
  stage: string;
  traction: string;
  revenueOrUsers: string;
  team: string;
  fundingAsk: string;
  useOfFunds: string;
};

export type GrillIntake = {
  founder: FounderIntake;
  startup: StartupIntake;
};

export type ArtifactResult = {
  kind: ArtifactKind;
  status: ArtifactStatus;
  sourceLabel: string;
  fileName: string | null;
  mimeType: string | null;
  byteSize: number;
  text: string;
  pagesParsed: number;
  totalPages: number | null;
  truncated: boolean;
  errorCode?: string;
  errorMessage?: string;
};

export type EvidenceSourceType =
  | "founder_intake"
  | "startup_intake"
  | "profile_document"
  | "pitch_deck";

export type EvidenceItem = {
  id: string;
  category:
    | "founder"
    | "profile"
    | "problem"
    | "solution"
    | "customer"
    | "market"
    | "traction"
    | "team"
    | "funding"
    | "deck";
  sourceType: EvidenceSourceType;
  sourceLabel: string;
  text: string;
  confidence: number;
  origin: "founder_entered" | "parser_extracted";
};

export type MissingInformation = {
  field: string;
  label: string;
  severity: "missing" | "weak";
  reason: string;
};

export type GrillDossier = {
  founder: FounderIntake;
  startup: StartupIntake;
  evidence: EvidenceItem[];
  artifacts: ArtifactResult[];
  missingInformation: MissingInformation[];
};

export type KnowledgeCategory =
  | "founder"
  | "application"
  | "problem"
  | "market"
  | "traction"
  | "deck"
  | "positioning"
  | "funding";

export type KnowledgeCorpusItem = {
  id: string;
  title: string;
  source: string;
  provenance: string;
  category: KnowledgeCategory;
  tags: string[];
  guidance: string;
};

export type RetrievedGuidance = KnowledgeCorpusItem & {
  score: number;
  matchedTerms: string[];
};

export type GrillDimensionId =
  | "founder_credibility"
  | "founder_market_fit"
  | "problem_clarity"
  | "solution_clarity"
  | "market_quality"
  | "differentiation"
  | "traction_evidence"
  | "funding_narrative"
  | "deck_readiness"
  | "profile_positioning";

export type DimensionScore = {
  id: GrillDimensionId;
  label: string;
  score: number;
  weight: number;
  explanation: string;
  evidenceIds: string[];
};

export type GrillFinding = {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  evidenceIds: string[];
};

export type DeckReview = {
  status: ArtifactStatus;
  summary: string;
  detectedSections: string[];
  missingSections: string[];
  findings: GrillFinding[];
  pagesParsed: number;
  totalPages: number | null;
  truncated: boolean;
};

export type ProfileReview = {
  positioningQuality: number;
  authoritySignals: string[];
  missingCredibility: string[];
  improvements: string[];
  summary: string;
};

export type PrioritizedAction = {
  id: string;
  priority: "fix_now" | "fix_next" | "improve_later";
  title: string;
  why: string;
  action: string;
  guidanceIds: string[];
};

export type GrillReport = {
  schemaVersion: 1;
  reportId: string;
  rubricVersion: "fundme-v1-demo-rubric@1";
  overallScore: number;
  evidenceCoverage: number;
  confidence: ConfidenceLevel;
  verdict: string;
  strongestDimension: GrillDimensionId;
  weakestDimension: GrillDimensionId;
  dimensions: DimensionScore[];
  strengths: GrillFinding[];
  redFlags: GrillFinding[];
  contradictions: GrillFinding[];
  unsupportedClaims: GrillFinding[];
  missingEvidence: GrillFinding[];
  highestLeverageActions: PrioritizedAction[];
  deckReview: DeckReview;
  profileReview: ProfileReview;
  retrievedGuidanceIds: string[];
  startupName: string;
  founderName: string;
};

export type DemoIdentity = {
  kind: "anonymous_demo_session";
  sessionId: string;
};

export type OptimizationEntitlement = {
  status: "locked";
  label: "Coming in Early Access";
};

export type PersistedGrillState = {
  schemaVersion: 1;
  sessionId: string;
  currentStep: number;
  intake: GrillIntake;
  report: GrillReport | null;
  activeAnalysisId: string | null;
};

export type AnalyzeSuccessResponse = {
  ok: true;
  runtimeMode: "demo";
  report: GrillReport;
  artifacts: ArtifactResult[];
};

export type AnalyzeErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
    field?: string;
  };
};

export type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;
