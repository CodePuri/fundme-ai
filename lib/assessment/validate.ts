import type { StructuredReport, ValidationError } from "./schema";

const SIGNAL_LABELS = [
  "Founder",
  "Clarity",
  "Traction",
  "Market",
  "App State",
  "Opp Fit",
];

const BLOCKED_PATTERNS = [
  /guarantee(?:s|d)?\s+(?:acceptance|approval|funding|admission)/i,
  /you\s+(?:will|are\s+guaranteed)\s+(?:get|receive|be\s+accepted)/i,
  /qualified\s+(?:for|to\s+apply)\s+(?:y\s+combinator|techstars|antler|500\s+global)/i,
  /high\s+chance\s+of\s+(?:acceptance|funding|approval)/i,
];

/* ─── Score Ranges ── */

const SCORE_MIN = 0;
const SCORE_MAX = 100;

/* ─── Validation ── */

export function validateReport(report: unknown): {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!report || typeof report !== "object") {
    errors.push({
      field: "root",
      message: "Report is not a valid object",
      severity: "error",
    });
    return { valid: false, errors, warnings };
  }

  const r = report as Record<string, unknown>;

  /* readinessScore */
  if (typeof r.readinessScore !== "number" || r.readinessScore < SCORE_MIN || r.readinessScore > SCORE_MAX) {
    errors.push({
      field: "readinessScore",
      message: `Must be integer ${SCORE_MIN}-${SCORE_MAX}, got ${r.readinessScore}`,
      severity: "error",
    });
  }

  /* verdict */
  if (!r.verdict || typeof r.verdict !== "string" || r.verdict.trim().length < 5) {
    errors.push({
      field: "verdict",
      message: "Must be a meaningful sentence (>=5 chars)",
      severity: "error",
    });
  }

  /* scoreMeaning */
  if (!r.scoreMeaning || typeof r.scoreMeaning !== "string") {
    warnings.push({
      field: "scoreMeaning",
      message: "scoreMeaning is missing or not a string",
      severity: "warning",
    });
  }

  /* signals — must be array of exactly 6 */
  if (!Array.isArray(r.signals)) {
    errors.push({
      field: "signals",
      message: "signals must be an array",
      severity: "error",
    });
  } else {
    for (const signal of r.signals as Record<string, unknown>[]) {
      if (typeof signal.score !== "number" || signal.score < SCORE_MIN || signal.score > SCORE_MAX) {
        errors.push({
          field: `signals.${signal.label}.score`,
          message: `Score must be ${SCORE_MIN}-${SCORE_MAX}`,
          severity: "error",
        });
      }
      if (!["found", "inferred", "missing", "needs_confirmation"].includes(signal.confidence as string)) {
        errors.push({
          field: `signals.${signal.label}.confidence`,
          message: `Invalid confidence: ${signal.confidence}`,
          severity: "error",
        });
      }
      if (!signal.evidence || !Array.isArray(signal.evidence) || signal.evidence.length === 0) {
        warnings.push({
          field: `signals.${signal.label}.evidence`,
          message: `Signal "${signal.label}" has no evidence citations`,
          severity: "warning",
        });
      }
    }
  }

  /* topIssues */
  if (!Array.isArray(r.topIssues)) {
    errors.push({
      field: "topIssues",
      message: "topIssues must be an array",
      severity: "error",
    });
  } else {
    for (const issue of r.topIssues as Record<string, unknown>[]) {
      if (!["high", "medium", "low"].includes(issue.severity as string)) {
        warnings.push({
          field: `topIssues.${issue.title}.severity`,
          message: `Invalid severity: ${issue.severity}`,
          severity: "warning",
        });
      }
    }
  }

  /* lockedFixes */
  if (!Array.isArray(r.lockedFixes)) {
    warnings.push({
      field: "lockedFixes",
      message: "lockedFixes should be an array",
      severity: "warning",
    });
  }

  /* matchedCategories */
  if (!Array.isArray(r.matchedCategories)) {
    warnings.push({
      field: "matchedCategories",
      message: "matchedCategories should be an array",
      severity: "warning",
    });
  }

  /* confidence */
  if (!r.confidence || typeof r.confidence !== "object") {
    warnings.push({
      field: "confidence",
      message: "confidence metadata is missing",
      severity: "warning",
    });
  }

  /* foundFacts — must have at least one */
  if (!Array.isArray(r.foundFacts) || r.foundFacts.length === 0) {
    errors.push({
      field: "foundFacts",
      message: "At least one evidence-backed fact is required",
      severity: "error",
    });
  }

  /* model */
  if (!r.model || typeof r.model !== "string") {
    warnings.push({
      field: "model",
      message: "model identifier is missing",
      severity: "warning",
    });
  }

  /* generatedAt */
  if (!r.generatedAt || typeof r.generatedAt !== "string") {
    warnings.push({
      field: "generatedAt",
      message: "generatedAt timestamp is missing",
      severity: "warning",
    });
  }

  /* Blocked pattern check on verdict and scoreMeaning */
  const textFields = [r.verdict, r.scoreMeaning, ...(r.topIssues as Array<Record<string, unknown>> || []).map((i) => i.title as string)];
  for (const field of textFields) {
    if (typeof field === "string") {
      for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(field)) {
          errors.push({
            field: "blocked_pattern",
            message: `Contains prohibited guarantee language. Pattern: ${pattern.source}`,
            severity: "error",
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/* ─── Sanitize — clamp scores, fill missing defaults ── */

export function sanitizeReport(report: StructuredReport): StructuredReport {
  const clamped = { ...report };

  clamped.readinessScore = Math.max(0, Math.min(100, Math.round(clamped.readinessScore)));

  if (Array.isArray(clamped.signals)) {
    clamped.signals = clamped.signals.map((s) => ({
      ...s,
      score: Math.max(0, Math.min(100, Math.round(s.score))),
    }));
  }

  if (Array.isArray(clamped.matchedCategories)) {
    clamped.matchedCategories = clamped.matchedCategories.map((c) => ({
      ...c,
      fitScore: Math.max(0, Math.min(100, Math.round(c.fitScore))),
    }));
  }

  clamped.generatedAt = clamped.generatedAt || new Date().toISOString();
  clamped.model = clamped.model || "unknown";
  clamped.foundFacts = clamped.foundFacts || [];
  clamped.inferredRisks = clamped.inferredRisks || [];
  clamped.missingInfo = clamped.missingInfo || [];

  return clamped;
}
