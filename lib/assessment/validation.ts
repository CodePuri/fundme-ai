import type {
  ArtifactKind,
  AssessmentRoute,
  GrillSession,
  StartupInput,
} from "./types.ts";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const PROFILE_EXTENSIONS = new Set(["pdf", "doc", "docx", "txt"]);

export type IntakeErrors = Partial<Record<keyof StartupInput | "startupIdentity" | "fundingSource", string>>;

export type IntakeValidation = {
  valid: boolean;
  errors: IntakeErrors;
};

export type FileValidation = {
  valid: boolean;
  error: string | null;
};

function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidWebsite(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(normalizeWebsite(value));
    return Boolean(url.hostname.includes(".") && !url.hostname.startsWith("."));
  } catch {
    return false;
  }
}

function isValidLinkedInProfile(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(normalizeWebsite(value));
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    return hostname === "linkedin.com" && /^\/in\/[^/]+\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
}

export function validateIntake(
  input: StartupInput,
  artifacts: GrillSession["artifacts"] = [],
): IntakeValidation {
  const errors: IntakeErrors = {};

  if (input.websiteUrl.trim() && !isValidWebsite(input.websiteUrl)) {
    errors.websiteUrl = "Enter a valid website address.";
  }
  if (input.linkedInUrl?.trim() && !isValidLinkedInProfile(input.linkedInUrl)) {
    errors.linkedInUrl = "Paste a full LinkedIn profile URL, such as linkedin.com/in/founder.";
  }
  if (input.founderName.trim().length < 2) {
    errors.founderName = "Enter the founder's name.";
  }
  const descriptionLength = input.description.trim().length;
  const hasDeck = artifacts.some(
    (artifact) => artifact.kind === "pitch-deck" && artifact.status === "attached",
  );
  if (!input.websiteUrl.trim() && !hasDeck && descriptionLength < 20) {
    errors.fundingSource = "Add a startup website, pitch deck, or one-line description.";
  } else if (descriptionLength > 280) {
    errors.description = "Keep the startup description under 280 characters.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Enter an email address.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validateFile(
  file: { name: string; size: number; type: string },
  kind: ArtifactKind,
): FileValidation {
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  if (file.size <= 0) return { valid: false, error: "The selected file is empty." };
  if (file.size > MAX_FILE_BYTES) return { valid: false, error: "Files must be 10 MB or smaller." };

  if (kind === "pitch-deck" && extension !== "pdf") {
    return { valid: false, error: "Pitch decks must be PDF files for this Preview." };
  }
  if (kind !== "pitch-deck" && !PROFILE_EXTENSIONS.has(extension)) {
    return { valid: false, error: "Use a PDF, DOC, DOCX, or TXT file." };
  }
  return { valid: true, error: null };
}

export function earliestValidRoute(session: GrillSession): AssessmentRoute {
  if (!validateIntake(session.input, session.artifacts).valid) return "/assessment";
  if (session.report) return "/assessment/result";
  if (session.stage === "result" && session.processingState === "assessing" && session.reviewedAt) {
    return "/assessment/analyzing";
  }
  return "/assessment";
}
