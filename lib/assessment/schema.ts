/* ─── Proximity Signal Confidence ── */

export type SignalConfidence =
  | "found"
  | "inferred"
  | "missing"
  | "needs_confirmation";

/* ─── Individual Signal ── */

export type SignalItem = {
  label: string;
  score: number;
  status: string;
  explanation: string;
  detail: string;
  evidence: string[];
  confidence: SignalConfidence;
};

/* ─── Top Issue ── */

export type TopIssue = {
  title: string;
  whyItHurts: string;
  quickHint: string;
  severity: "high" | "medium" | "low";
  foundIn: string;
};

/* ─── Locked Fix ── */

export type LockedFix = {
  title: string;
  whyItHurts: string;
  previewText: string;
  category: string;
};

/* ─── Matched Category ── */

export type MatchedCategory = {
  name: string;
  reason: string;
  fitScore: number;
  type: string;
};

/* ─── Confidence Metadata ── */

export type AnalysisConfidence = {
  overall: "high" | "medium" | "low";
  notes: string[];
};

/* ─── Structured Report (canonical output of the AI pipeline) ── */

export type StructuredReport = {
  readinessScore: number;
  verdict: string;
  scoreMeaning: string;
  signals: SignalItem[];
  topIssues: TopIssue[];
  missingInfo: string[];
  lockedFixes: LockedFix[];
  matchedCategories: MatchedCategory[];
  opportunityFitPreview: { name: string; reason: string }[];
  recommendedNextAction: string;
  confidence: AnalysisConfidence;
  foundFacts: string[];
  inferredRisks: string[];
  generatedAt: string;
  model: string;
};

/* ─── Website Extract ── */

export type WebsiteExtract = {
  url: string;
  title: string;
  metaDescription: string;
  headings: { level: number; text: string }[];
  visibleText: string;
  ctaText: string[];
  links: { href: string; text: string }[];
  ogImage: string | null;
  wordCount: number;
};

/* ─── Analysis Request ── */

export type AnalysisRequest = {
  websiteUrl?: string;
  websiteExtract?: WebsiteExtract | null;
  linkedInUrl?: string;
  startupName?: string;
  startupNotes?: string;
  uploadedFiles?: string[];
  answers: { questionId: number; selectedOption: string }[];
};

/* ─── Validation Error ── */

export type ValidationError = {
  field: string;
  message: string;
  severity: "error" | "warning";
};

/* ─── Score Label Helper ── */

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Strong signal", color: "#22c55e" };
  if (score >= 60) return { label: "Promising, needs sharpening", color: "#f59e0b" };
  if (score >= 40) return { label: "Weak application signal", color: "#f97316" };
  return { label: "Not ready yet", color: "#9ca3af" };
}

/* ─── Map StructuredReport to Legacy AssessmentReport ── */

import type {
  AssessmentReport as LegacyAssessmentReport,
  Weakness as LegacyWeakness,
} from "@/components/assessment/assessment-types";

export function mapToLegacyReport(report: StructuredReport): LegacyAssessmentReport {
  const legacySignalScore = (label: string): number => {
    const signal = report.signals.find(
      (s) => s.label.toLowerCase() === label.toLowerCase(),
    );
    return signal?.score ?? 50;
  };

  const weaknesses: LegacyWeakness[] = report.topIssues.map((issue) => ({
    title: issue.title,
    whyItHurts: issue.whyItHurts,
    quickHint: issue.quickHint,
  }));

  const founderSignal = report.signals.find(
    (s) => s.label.toLowerCase().includes("founder"),
  );
  const claritySignal = report.signals.find(
    (s) => s.label.toLowerCase().includes("clarity") || s.label.toLowerCase().includes("startup"),
  );
  const websiteSignal = report.signals.find(
    (s) => s.label.toLowerCase().includes("website") || s.label.toLowerCase().includes("positioning"),
  );

  return {
    readinessScore: report.readinessScore,
    verdict: report.verdict,
    subscores: {
      founderCredibility: legacySignalScore("Founder"),
      startupClarity: legacySignalScore("Clarity"),
      tractionProof: legacySignalScore("Traction"),
      marketFit: legacySignalScore("Market"),
      applicationReadiness: legacySignalScore("App State"),
      opportunityFit: legacySignalScore("Opp Fit"),
    },
    weaknesses,
    founderAssessment: founderSignal?.detail ?? report.foundFacts.slice(0, 3).join(" "),
    startupAssessment: claritySignal?.detail ?? report.scoreMeaning,
    websiteAssessment: websiteSignal?.detail ?? "Website analysis was not available.",
    missingProofPoints: report.missingInfo,
    opportunityCategories: report.matchedCategories.map((c) => c.name),
    lockedMatchesPreview: report.opportunityFitPreview,
  };
}
