import type {
  ArtifactKind,
  AssessmentRoute,
  GrillSession,
  StartupInput,
} from "./types.ts";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const PROFILE_EXTENSIONS = new Set(["pdf", "doc", "docx", "txt"]);

export type IntakeErrors = Partial<Record<keyof StartupInput | "startupIdentity", string>>;

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

export function validateIntake(input: StartupInput): IntakeValidation {
  const errors: IntakeErrors = {};

  if (!input.startupName.trim() && !input.websiteUrl.trim()) {
    errors.startupIdentity = "Add a startup name or website.";
  }
  if (input.websiteUrl.trim() && !isValidWebsite(input.websiteUrl)) {
    errors.websiteUrl = "Enter a valid website address.";
  }
  if (input.founderName.trim().length < 2) {
    errors.founderName = "Enter the founder's name.";
  }
  if (input.founderRole.trim().length < 2) {
    errors.founderRole = "Enter the founder's role.";
  }
  const descriptionLength = input.description.trim().length;
  if (descriptionLength < 20) {
    errors.description = "Describe the startup in at least 20 characters.";
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
  if (!validateIntake(session.input).valid) return "/assessment";
  if (!session.reviewedAt) return "/assessment/review";
  if (session.report) return "/assessment/result";
  return "/assessment/mentor";
}
