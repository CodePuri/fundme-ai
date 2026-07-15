import type {
  AnalyzeResponse,
  ArtifactKind,
  ArtifactResult,
  GrillIntake,
  GrillReport,
  MissingInformation,
} from "./types";
import { getProfileEvidenceText } from "./profile-evidence";

export const GRILL_UPLOAD_LIMITS = {
  maxFileBytes: 3_500_000,
  maxCombinedBytes: 4_000_000,
  maxRequestBytes: 4_250_000,
  maxPages: 20,
  maxCharacters: 50_000,
} as const;

export const GRILL_INTAKE_LIMITS = {
  founder: {
    fullName: 120,
    role: 120,
    background: 1_500,
    achievements: 1_500,
    profileText: 6_000,
  },
  startup: {
    name: 120,
    website: 300,
    oneLinePitch: 500,
    problem: 2_000,
    solution: 2_000,
    targetCustomer: 1_000,
    market: 1_500,
    stage: 40,
    traction: 2_000,
    revenueOrUsers: 1_000,
    team: 1_500,
    fundingAsk: 1_000,
    useOfFunds: 1_500,
  },
} as const;

export type FileMetadata = { name: string; type: string; size: number };
export type FileValidation =
  | { ok: true }
  | { ok: false; code: string; message: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const GRILL_DIMENSION_IDS = [
  "founder_credibility",
  "founder_market_fit",
  "problem_clarity",
  "solution_clarity",
  "market_quality",
  "differentiation",
  "traction_evidence",
  "funding_narrative",
  "deck_readiness",
  "profile_positioning",
] as const;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isBoundedScore = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;

function isFinding(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.severity === "info" ||
      value.severity === "warning" ||
      value.severity === "critical") &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    isStringArray(value.evidenceIds)
  );
}

function isFindingArray(value: unknown) {
  return Array.isArray(value) && value.every(isFinding);
}

function isDimension(value: unknown) {
  return (
    isRecord(value) &&
    GRILL_DIMENSION_IDS.includes(
      value.id as (typeof GRILL_DIMENSION_IDS)[number],
    ) &&
    typeof value.label === "string" &&
    isBoundedScore(value.score) &&
    typeof value.weight === "number" &&
    Number.isFinite(value.weight) &&
    value.weight > 0 &&
    typeof value.explanation === "string" &&
    isStringArray(value.evidenceIds)
  );
}

function isDeckReview(value: unknown) {
  return (
    isRecord(value) &&
    (value.status === "parsed" ||
      value.status === "unavailable" ||
      value.status === "not_provided") &&
    typeof value.summary === "string" &&
    isStringArray(value.detectedSections) &&
    isStringArray(value.missingSections) &&
    isFindingArray(value.findings) &&
    typeof value.pagesParsed === "number" &&
    Number.isFinite(value.pagesParsed) &&
    (value.totalPages === null ||
      (typeof value.totalPages === "number" && Number.isFinite(value.totalPages))) &&
    typeof value.truncated === "boolean"
  );
}

function isProfileReview(value: unknown) {
  return (
    isRecord(value) &&
    isBoundedScore(value.positioningQuality) &&
    isStringArray(value.authoritySignals) &&
    isStringArray(value.missingCredibility) &&
    isStringArray(value.improvements) &&
    typeof value.summary === "string"
  );
}

function isPrioritizedAction(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.priority === "fix_now" ||
      value.priority === "fix_next" ||
      value.priority === "improve_later") &&
    typeof value.title === "string" &&
    typeof value.why === "string" &&
    typeof value.action === "string" &&
    isStringArray(value.guidanceIds)
  );
}

const clean = (value: string) => value.trim();

export function sanitizeFilename(value: string) {
  const base = value.split(/[\\/]/).pop()?.trim() ?? "";
  if (!base) return "upload";

  const safe = base
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 120);

  return safe || "upload";
}

export function hasPdfSignature(bytes: Uint8Array) {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export function validateFileMetadata(
  file: FileMetadata,
  kind: ArtifactKind,
): FileValidation {
  if (file.size <= 0) {
    return { ok: false, code: "EMPTY_FILE", message: "Choose a file that is not empty." };
  }

  if (file.size > GRILL_UPLOAD_LIMITS.maxFileBytes) {
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      message: "Each uploaded file must be 3.5 MB or smaller.",
    };
  }

  const lowerName = file.name.toLowerCase();
  const lowerType = file.type.toLowerCase();
  const isPdfMime = lowerType === "application/pdf" || lowerType === "";

  if (kind === "pitch_deck") {
    if (!isPdfMime || !lowerName.endsWith(".pdf")) {
      return {
        ok: false,
        code: "INVALID_FILE_TYPE",
        message: "Pitch decks must be PDF files.",
      };
    }
    return { ok: true };
  }

  const isPdf = isPdfMime && lowerName.endsWith(".pdf");
  const isText =
    (lowerType === "text/plain" || lowerType === "") && lowerName.endsWith(".txt");

  if (!isPdf && !isText) {
    return {
      ok: false,
      code: "INVALID_FILE_TYPE",
      message: "Profile documents must be PDF or plain text files.",
    };
  }

  return { ok: true };
}

export function validateCombinedFileSize(files: FileMetadata[]) {
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > GRILL_UPLOAD_LIMITS.maxCombinedBytes) {
    return {
      ok: false as const,
      code: "REQUEST_TOO_LARGE",
      message: "Combined uploads must be 4 MB or smaller.",
    };
  }
  return { ok: true as const };
}

function addMissing(
  result: MissingInformation[],
  field: string,
  label: string,
  value: string,
  minLength: number,
  weakReason: string,
) {
  const trimmed = clean(value);
  if (!trimmed) {
    result.push({ field, label, severity: "missing", reason: `${label} is missing.` });
  } else if (trimmed.length < minLength) {
    result.push({ field, label, severity: "weak", reason: weakReason });
  }
}

export function findMissingInformation(
  intake: GrillIntake,
  artifacts: ArtifactResult[],
) {
  const result: MissingInformation[] = [];
  const profileEvidence = getProfileEvidenceText(
    intake.founder.profileText,
    artifacts,
  );

  addMissing(result, "founder.background", "Founder background", intake.founder.background, 50, "Founder background needs relevant domain or operating detail.");
  addMissing(result, "founder.achievements", "Founder achievements", intake.founder.achievements, 25, "Add one concrete result, responsibility, or achievement.");
  addMissing(result, "founder.profileText", "LinkedIn/profile evidence", profileEvidence, 80, "The profile evidence is too brief to establish positioning and authority.");
  addMissing(result, "startup.oneLinePitch", "One-line pitch", intake.startup.oneLinePitch, 35, "Name the customer, outcome, and product mechanism more precisely.");
  addMissing(result, "startup.problem", "Problem evidence", intake.startup.problem, 60, "Explain who has the problem, how it appears, and what it costs.");
  addMissing(result, "startup.solution", "Solution evidence", intake.startup.solution, 60, "Explain what the product does and how it changes the current workflow.");
  addMissing(result, "startup.targetCustomer", "Target customer", intake.startup.targetCustomer, 20, "Narrow the initial customer segment.");
  addMissing(result, "startup.market", "Market case", intake.startup.market, 45, "Use a defensible initial segment instead of a broad market label.");
  addMissing(result, "startup.traction", "Traction evidence", intake.startup.traction, 30, "State measured demand, usage, pilots, revenue, or learning velocity.");
  addMissing(result, "startup.revenueOrUsers", "Revenue or user evidence", intake.startup.revenueOrUsers, 12, "Quantify revenue, active users, pilots, or explicitly state pre-launch status.");
  addMissing(result, "startup.team", "Team evidence", intake.startup.team, 25, "Describe who is building the company and the coverage of key functions.");
  addMissing(result, "startup.fundingAsk", "Funding ask", intake.startup.fundingAsk, 12, "State a specific amount and round or instrument.");
  addMissing(result, "startup.useOfFunds", "Use of funds", intake.startup.useOfFunds, 30, "Connect spending to milestones and time horizon.");

  const deck = artifacts.find((artifact) => artifact.kind === "pitch_deck");
  if (!deck || deck.status !== "parsed") {
    result.push({
      field: "pitchDeck",
      label: "Pitch deck evidence",
      severity: "missing",
      reason:
        deck?.status === "unavailable"
          ? "The pitch deck could not be parsed, so no deck claims were used."
          : "No readable pitch deck was provided.",
    });
  }

  return result;
}

export function validateGrillIntake(intake: GrillIntake) {
  const errors: Record<string, string> = {};
  if (!clean(intake.founder.fullName)) errors["founder.fullName"] = "Enter the founder's full name.";
  if (!clean(intake.founder.role)) errors["founder.role"] = "Enter the founder's role.";
  if (!clean(intake.founder.background)) errors["founder.background"] = "Add a short founder background.";
  if (intake.founder.yearsExperience < 0 || intake.founder.yearsExperience > 60) errors["founder.yearsExperience"] = "Enter experience between 0 and 60 years.";
  if (!clean(intake.startup.name)) errors["startup.name"] = "Enter the startup name.";
  if (!clean(intake.startup.oneLinePitch)) errors["startup.oneLinePitch"] = "Add a one-line pitch.";
  if (!clean(intake.startup.problem)) errors["startup.problem"] = "Describe the problem.";
  if (!clean(intake.startup.solution)) errors["startup.solution"] = "Describe the solution.";
  if (!clean(intake.startup.targetCustomer)) errors["startup.targetCustomer"] = "Describe the target customer.";
  if (!clean(intake.startup.stage)) errors["startup.stage"] = "Choose a startup stage.";
  for (const [key, limit] of Object.entries(GRILL_INTAKE_LIMITS.founder)) {
    if (key === "yearsExperience") continue;
    const value = intake.founder[key as keyof typeof GRILL_INTAKE_LIMITS.founder];
    if (typeof value === "string" && value.length > limit) {
      errors[`founder.${key}`] = `Keep this field to ${limit.toLocaleString()} characters or fewer.`;
    }
  }
  for (const [key, limit] of Object.entries(GRILL_INTAKE_LIMITS.startup)) {
    const value = intake.startup[key as keyof typeof GRILL_INTAKE_LIMITS.startup];
    if (value.length > limit) {
      errors[`startup.${key}`] = `Keep this field to ${limit.toLocaleString()} characters or fewer.`;
    }
  }
  return errors;
}

export function parseGrillIntake(value: unknown): GrillIntake | null {
  if (!isRecord(value) || !isRecord(value.founder) || !isRecord(value.startup)) return null;
  const founder = value.founder;
  const startup = value.startup;
  const founderStrings = ["fullName", "role", "background", "achievements", "profileText"] as const;
  const startupStrings = ["name", "website", "oneLinePitch", "problem", "solution", "targetCustomer", "market", "stage", "traction", "revenueOrUsers", "team", "fundingAsk", "useOfFunds"] as const;
  if (!founderStrings.every((key) =>
    typeof founder[key] === "string" &&
    founder[key].length <= GRILL_INTAKE_LIMITS.founder[key]
  )) return null;
  if (!startupStrings.every((key) =>
    typeof startup[key] === "string" &&
    startup[key].length <= GRILL_INTAKE_LIMITS.startup[key]
  )) return null;
  if (typeof founder.yearsExperience !== "number" || !Number.isFinite(founder.yearsExperience)) return null;
  return value as GrillIntake;
}

export function isGrillReport(value: unknown): value is GrillReport {
  if (!isRecord(value)) return false;
  const dimensions = value.dimensions;
  if (!Array.isArray(dimensions) || dimensions.length !== 10) return false;
  if (!dimensions.every(isDimension)) return false;
  const dimensionIds = dimensions.map((dimension) => dimension.id);
  if (new Set(dimensionIds).size !== GRILL_DIMENSION_IDS.length) return false;

  return (
    value.schemaVersion === 1 &&
    value.rubricVersion === "fundme-v1-demo-rubric@1" &&
    typeof value.reportId === "string" &&
    isBoundedScore(value.overallScore) &&
    isBoundedScore(value.evidenceCoverage) &&
    (value.confidence === "low" || value.confidence === "medium" || value.confidence === "high") &&
    typeof value.verdict === "string" &&
    dimensionIds.includes(value.strongestDimension) &&
    dimensionIds.includes(value.weakestDimension) &&
    isFindingArray(value.strengths) &&
    isFindingArray(value.redFlags) &&
    isFindingArray(value.contradictions) &&
    isFindingArray(value.unsupportedClaims) &&
    isFindingArray(value.missingEvidence) &&
    Array.isArray(value.highestLeverageActions) &&
    value.highestLeverageActions.every(isPrioritizedAction) &&
    isDeckReview(value.deckReview) &&
    isProfileReview(value.profileReview) &&
    isStringArray(value.retrievedGuidanceIds) &&
    typeof value.startupName === "string" &&
    typeof value.founderName === "string"
  );
}

export function isAnalyzeResponse(value: unknown): value is AnalyzeResponse {
  if (!isRecord(value) || typeof value.ok !== "boolean") return false;
  if (value.ok === false) {
    return (
      isRecord(value.error) &&
      typeof value.error.code === "string" &&
      typeof value.error.message === "string"
    );
  }
  return value.runtimeMode === "demo" && isGrillReport(value.report) && Array.isArray(value.artifacts);
}
