export type AssessmentAnswer = {
  questionId: number;
  selectedOption: string;
};

export type AnalysisStatus =
  | "idle"
  | "entering"
  | "analyzing"
  | "complete"
  | "error";

export type Weakness = {
  title: string;
  whyItHurts: string;
  quickHint: string;
};

export type AssessmentReport = {
  readinessScore: number;
  verdict: string;
  subscores: {
    founderCredibility: number;
    startupClarity: number;
    tractionProof: number;
    marketFit: number;
    applicationReadiness: number;
    opportunityFit: number;
  };
  weaknesses: Weakness[];
  founderAssessment: string;
  startupAssessment: string;
  websiteAssessment: string;
  missingProofPoints: string[];
  opportunityCategories: string[];
  lockedMatchesPreview: { name: string; reason: string }[];
};

export type AssessmentState = {
  websiteUrl: string;
  startupName: string;
  linkedInUrl: string;
  startupNotes: string;
  uploadedFiles: string[];
  answers: AssessmentAnswer[];
  analysisStatus: AnalysisStatus;
  creditsRemaining: number;
  hasPaid: boolean;
  reportGenerated: boolean;
  report: AssessmentReport | null;
};
