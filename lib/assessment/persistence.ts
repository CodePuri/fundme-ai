import { createPreviewReferralCode } from "./share.ts";
import {
  GRILL_SESSION_VERSION,
  type AssessmentProcessingState,
  type FundingReadinessReport,
  type GrillSession,
} from "./types.ts";
import { validateEmail } from "./validation.ts";

export const GRILL_STORAGE_KEY = "fundme-grill-preview-v1";
const MAX_STORED_BYTES = 250_000;

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type BrowserStorageHost = {
  readonly localStorage: StorageLike;
};

export type PersistenceResult = { ok: true; error: null } | { ok: false; error: string };
export type StorageReadResult = { ok: true; value: string | null } | { ok: false; value: null };
export type EarlyAccessPersistenceResult = {
  ok: boolean;
  session: GrillSession;
  error: string | null;
};

const stages = new Set(["intake", "review", "mentor", "result"]);
const processingStates = new Set<AssessmentProcessingState>([
  "preparing", "validating", "questioning", "ready", "assessing", "partial", "complete", "failed", "recoverable",
]);
const artifactKinds = new Set(["pitch-deck", "founder-profile", "notes"]);
const artifactStatuses = new Set(["attached", "rejected"]);
const questionIds = new Set(["stage", "traction", "founder-fit", "differentiation", "funding-outcome"]);
const voiceSources = new Set(["typed", "voice"]);
const dimensionIds = new Set([
  "founder-credibility", "founder-market-fit", "problem-clarity", "solution-clarity", "market-clarity",
  "differentiation", "product-maturity", "traction-proof", "funding-narrative", "pitch-deck-readiness",
]);

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function boundedString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max;
}

function nullableString(value: unknown, max: number): boolean {
  return value === null || boundedString(value, max);
}

function stringArray(value: unknown, maxItems: number, maxLength: number): value is string[] {
  return Array.isArray(value) && value.length <= maxItems && value.every((item) => boundedString(item, maxLength));
}

function validInput(value: unknown): boolean {
  if (!record(value)) return false;
  return boundedString(value.startupName, 160)
    && boundedString(value.websiteUrl, 2_048)
    && boundedString(value.founderName, 120)
    && boundedString(value.founderRole, 120)
    && boundedString(value.description, 280)
    && boundedString(value.profileText, 20_000)
    && (value.linkedInUrl === undefined || boundedString(value.linkedInUrl, 2_048));
}

function validArtifact(value: unknown): boolean {
  if (!record(value)) return false;
  return boundedString(value.id, 120)
    && artifactKinds.has(String(value.kind))
    && boundedString(value.name, 255)
    && typeof value.size === "number" && Number.isFinite(value.size) && value.size >= 0 && value.size <= 10 * 1024 * 1024
    && boundedString(value.type, 120)
    && artifactStatuses.has(String(value.status))
    && boundedString(value.attachedAt, 64);
}

function validConversationEvent(value: unknown): boolean {
  if (!record(value)) return false;
  return boundedString(value.id, 120)
    && new Set(["mentor", "founder", "system"]).has(String(value.role))
    && new Set(["question", "answer", "skip", "status"]).has(String(value.kind))
    && boundedString(value.content, 6_000)
    && (value.questionId === undefined || questionIds.has(String(value.questionId)))
    && (value.source === undefined || voiceSources.has(String(value.source)))
    && boundedString(value.createdAt, 64);
}

function validAnswers(value: unknown): boolean {
  if (!record(value) || Object.keys(value).length > 5) return false;
  return Object.entries(value).every(([key, answer]) => {
    if (!questionIds.has(key) || !record(answer)) return false;
    return answer.questionId === key
      && boundedString(answer.text, 5_000)
      && voiceSources.has(String(answer.source))
      && boundedString(answer.answeredAt, 64);
  });
}

function validDimension(value: unknown): boolean {
  if (!record(value)) return false;
  return dimensionIds.has(String(value.id))
    && boundedString(value.label, 120)
    && typeof value.score === "number" && Number.isFinite(value.score) && value.score >= 0 && value.score <= 100
    && boundedString(value.explanation, 2_000)
    && stringArray(value.evidenceUsed, 30, 120)
    && stringArray(value.missingEvidence, 30, 500);
}

function validFinding(value: unknown): boolean {
  if (!record(value)) return false;
  return boundedString(value.id, 120)
    && new Set(["strength", "red-flag", "contradiction", "unsupported-claim", "missing-evidence"]).has(String(value.type))
    && new Set(["low", "medium", "high"]).has(String(value.severity))
    && dimensionIds.has(String(value.dimension))
    && boundedString(value.explanation, 2_000)
    && stringArray(value.evidenceIds, 30, 120)
    && boundedString(value.action, 2_000);
}

function validReport(value: unknown): boolean {
  if (value === null) return true;
  if (!record(value)) return false;
  const evidenceValid = Array.isArray(value.evidence) && value.evidence.length <= 50 && value.evidence.every((item) => record(item)
    && boundedString(item.id, 120) && boundedString(item.label, 160) && boundedString(item.value, 6_000)
    && new Set(["submitted", "attached", "missing"]).has(String(item.state)));
  const actionsValid = Array.isArray(value.actions) && value.actions.length <= 12 && value.actions.every((item) => record(item)
    && new Set(["fix-now", "fix-next", "improve-later"]).has(String(item.horizon))
    && boundedString(item.title, 200) && boundedString(item.detail, 2_000));
  const founderValid = record(value.founderReview) && boundedString(value.founderReview.credibility, 3_000)
    && boundedString(value.founderReview.founderMarketFit, 3_000) && boundedString(value.founderReview.profilePositioning, 3_000);
  const startupReview = value.startupReview;
  const startupValid = record(startupReview) && ["problem", "solution", "market", "differentiation", "traction", "fundingNarrative"]
    .every((key) => boundedString(startupReview[key], 3_000));
  const deckValid = record(value.deckReview) && new Set(["not-provided", "received-unparsed", "parsed"]).has(String(value.deckReview.status))
    && boundedString(value.deckReview.summary, 3_000) && stringArray(value.deckReview.findings, 20, 1_000);

  const isValidRubricVersion = value.rubricVersion === "fundme-rubric@2026.08-calibrated-v1"
    || value.rubricVersion === "fundme-demo-rubric@1";

  return isValidRubricVersion
    && boundedString(value.generatedAt, 64)
    && typeof value.readinessScore === "number" && value.readinessScore >= 0 && value.readinessScore <= 100
    && boundedString(value.verdict, 500) && boundedString(value.conciseVerdict, 1_000)
    && typeof value.evidenceCoverage === "number" && value.evidenceCoverage >= 0 && value.evidenceCoverage <= 100
    && new Set(["low", "medium", "high"]).has(String(value.confidence))
    && new Set(["complete", "partial"]).has(String(value.completionState))
    && new Set(["missing", "none", "positive", "contradictory"]).has(String(value.tractionState))
    && dimensionIds.has(String(value.strongestDimension)) && dimensionIds.has(String(value.weakestDimension))
    && Array.isArray(value.dimensions) && value.dimensions.length === 10 && value.dimensions.every(validDimension)
    && evidenceValid
    && Array.isArray(value.findings) && value.findings.length <= 50 && value.findings.every(validFinding)
    && founderValid && startupValid && deckValid && actionsValid;
}

function validEarlyAccess(value: unknown): boolean {
  if (!record(value)) return false;
  return boundedString(value.email, 254)
    && new Set(["idle", "submitting", "success", "error"]).has(String(value.status))
    && (value.error === undefined || boundedString(value.error, 500))
    && nullableString(value.referralCode, 80);
}

function validLifecycleState(value: Record<string, unknown>): boolean {
  const processingState = String(value.processingState);
  if (value.report !== null) {
    return value.stage === "result"
      && record(value.report)
      && value.report.completionState === processingState
      && new Set(["partial", "complete"]).has(processingState)
      && value.reviewedAt !== null;
  }
  if (value.stage === "result") {
    return new Set(["assessing", "failed", "recoverable"]).has(processingState)
      && value.reviewedAt !== null;
  }
  if (value.stage === "mentor" && value.reviewedAt === null) return false;
  return !new Set(["assessing", "partial", "complete"]).has(processingState);
}

export function createInitialSession(now = new Date().toISOString(), warning: string | null = null): GrillSession {
  return {
    version: GRILL_SESSION_VERSION,
    mode: "demo",
    stage: "intake",
    processingState: warning ? "recoverable" : "preparing",
    input: {
      startupName: "",
      websiteUrl: "",
      founderName: "",
      founderRole: "",
      description: "",
      profileText: "",
      linkedInUrl: "",
    },
    artifacts: [],
    conversation: [],
    answers: {},
    skippedQuestionIds: [],
    reviewedAt: null,
    report: null,
    earlyAccess: { email: "", status: "idle", referralCode: null },
    persistenceWarning: warning,
    updatedAt: now,
  };
}

function isCurrentSession(value: unknown): value is GrillSession {
  if (!record(value)) return false;
  return value.version === GRILL_SESSION_VERSION
    && value.mode === "demo"
    && stages.has(String(value.stage))
    && processingStates.has(value.processingState as AssessmentProcessingState)
    && validInput(value.input)
    && Array.isArray(value.artifacts) && value.artifacts.length <= 10 && value.artifacts.every(validArtifact)
    && Array.isArray(value.conversation) && value.conversation.length <= 100 && value.conversation.every(validConversationEvent)
    && validAnswers(value.answers)
    && Array.isArray(value.skippedQuestionIds) && value.skippedQuestionIds.length <= 5 && value.skippedQuestionIds.every((id) => questionIds.has(String(id)))
    && nullableString(value.reviewedAt, 64)
    && validReport(value.report)
    && validLifecycleState(value)
    && validEarlyAccess(value.earlyAccess)
    && nullableString(value.persistenceWarning, 500)
    && boundedString(value.updatedAt, 64);
}

function clearInvalidStorage(storage: StorageLike): void {
  try { storage.removeItem(GRILL_STORAGE_KEY); } catch { /* recovery remains in memory */ }
}

export function getBrowserStorage(host: BrowserStorageHost | null): StorageLike | null {
  if (!host) return null;
  try {
    return host.localStorage;
  } catch {
    return null;
  }
}

export function readStorageItem(storage: StorageLike | null, key: string): StorageReadResult {
  if (!storage) return { ok: false, value: null };
  try {
    return { ok: true, value: storage.getItem(key) };
  } catch {
    return { ok: false, value: null };
  }
}

export function loadSession(storage: StorageLike): GrillSession {
  const stored = readStorageItem(storage, GRILL_STORAGE_KEY);
  if (!stored.ok) {
    return createInitialSession(undefined, "Browser storage is unavailable. Progress can continue in this tab but cannot be recovered after refresh.");
  }
  const raw = stored.value;
  if (!raw) return createInitialSession();
  if (raw.length > MAX_STORED_BYTES) {
    clearInvalidStorage(storage);
    return createInitialSession(undefined, "Saved assessment data was oversized or invalid and was removed. Start again from this recoverable intake.");
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isCurrentSession(parsed)) return parsed;
  } catch {
    // Invalid JSON follows the same explicit recovery path.
  }
  clearInvalidStorage(storage);
  return createInitialSession(undefined, "Saved assessment data was invalid and was removed. Start again from this recoverable intake.");
}

export function saveSession(storage: StorageLike, session: GrillSession): PersistenceResult {
  try {
    const serialized = JSON.stringify(session);
    if (serialized.length > MAX_STORED_BYTES) return { ok: false, error: "Progress was not saved because it exceeds the browser storage limit." };
    storage.setItem(GRILL_STORAGE_KEY, serialized);
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "Progress could not be saved in this browser." };
  }
}

export function persistEarlyAccess(
  storage: StorageLike | null,
  session: GrillSession,
  email: string,
  updatedAt = new Date().toISOString(),
): EarlyAccessPersistenceResult {
  const normalizedEmail = email.trim();
  const emailError = validateEmail(normalizedEmail);
  const failure = (error: string): EarlyAccessPersistenceResult => ({
    ok: false,
    error,
    session: { ...session, earlyAccess: { email: normalizedEmail, status: "error", error, referralCode: null }, updatedAt },
  });
  if (emailError) return failure(emailError);
  if (!storage) return failure("Your email was not saved because browser storage is unavailable. Keep it here and retry.");

  const nextSession: GrillSession = {
    ...session,
    earlyAccess: { email: normalizedEmail, status: "success", referralCode: createPreviewReferralCode(normalizedEmail) },
    persistenceWarning: null,
    updatedAt,
  };
  const result = saveSession(storage, nextSession);
  return result.ok
    ? { ok: true, session: nextSession, error: null }
    : failure(`Your email was not saved. ${result.error} Keep it here and retry.`);
}

export function clearSession(storage: StorageLike): void {
  storage.removeItem(GRILL_STORAGE_KEY);
}
