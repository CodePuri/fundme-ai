import type { IngestedWebsite } from "../ingestion/website";
import type { IngestedPdf } from "../ingestion/pdf";
import type { IngestedFounderProfile } from "../ingestion/founder";
import type { ArtifactMetadata, EvidenceReference, MentorAnswer, MentorQuestionId, StartupInput } from "./types";

export type FactSource =
  | "website"
  | "pitch-deck"
  | "founder-profile"
  | "resume-pdf"
  | "founder-input"
  | "question-answer"
  | "inferred";

export type StructuredEvidenceRecord = {
  founder: {
    name: string;
    role: string;
    linkedInUrl: string | null;
    profileText: string | null;
    resumeParsed: boolean;
    resumeFilename: string | null;
    yearsOfExperience: number | null;
    previousCompaniesOrRoles: string[];
    signals: string[];
  };
  startup: {
    name: string;
    websiteUrl: string | null;
    websiteFetched: boolean;
    websiteTitle: string | null;
    websiteDescription: string | null;
    websiteHeadings: string[];
    websiteSignals: string[];
    pitchDescription: string;
  };
  pitchDeck: {
    attached: boolean;
    parsed: boolean;
    filename: string | null;
    pageCount: number;
    detectedSections: string[];
    slideSummaries: Array<{ slideIndex: number; title: string; content: string }>;
    extractedSnippet: string;
  };
  answers: Partial<Record<MentorQuestionId, { text: string; source: "typed" | "voice"; answeredAt: string }>>;
  evidenceList: EvidenceReference[];
  missingEvidenceList: string[];
  createdAt: string;
};

export function buildStructuredEvidence(params: {
  input: StartupInput;
  artifacts: ArtifactMetadata[];
  website?: IngestedWebsite | null;
  deckPdf?: IngestedPdf | null;
  resumePdf?: IngestedPdf | null;
  founderProfile?: IngestedFounderProfile | null;
  answers?: Partial<Record<MentorQuestionId, MentorAnswer>>;
}): StructuredEvidenceRecord {
  const { input, artifacts, website, deckPdf, resumePdf, founderProfile, answers = {} } = params;
  const createdAt = new Date().toISOString();

  const deckArtifact = artifacts.find((a) => a.kind === "pitch-deck");
  const profileArtifact = artifacts.find((a) => a.kind === "founder-profile");

  const founderName = (input.founderName || founderProfile?.founderName || "").trim();
  const founderRole = (input.founderRole || founderProfile?.founderRole || "").trim();
  const linkedInUrl = input.linkedInUrl?.trim() || null;
  const profileText = input.profileText?.trim() || null;
  const startupDescription = input.description?.trim() || "";
  const websiteUrl = input.websiteUrl?.trim() || null;

  const startupName = input.startupName?.trim()
    || (website?.title ? website.title.split(/[-|–:]/)[0].trim() : "")
    || (deckArtifact?.name ? deckArtifact.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ") : "")
    || "Your startup";

  const evidenceList: EvidenceReference[] = [];
  const missingEvidenceList: string[] = [];

  // 1. Founder evidence
  if (founderName) {
    evidenceList.push({ id: "founder-name", label: "Founder name", value: founderName, state: "submitted" });
  } else {
    missingEvidenceList.push("Founder name");
  }

  if (founderRole) {
    evidenceList.push({ id: "founder-role", label: "Founder role", value: founderRole, state: "submitted" });
  }

  if (profileText) {
    evidenceList.push({
      id: "founder-profile-text",
      label: "Founder experience text",
      value: profileText.slice(0, 500),
      state: "submitted",
    });
  }

  if (resumePdf && resumePdf.success) {
    evidenceList.push({
      id: "founder-resume-parsed",
      label: `Resume (${resumePdf.filename})`,
      value: `Extracted experience: ${resumePdf.extractedText.slice(0, 300)}...`,
      state: "submitted",
    });
  } else if (profileArtifact) {
    evidenceList.push({
      id: "founder-profile-file",
      label: "Founder profile file",
      value: profileArtifact.name,
      state: "attached",
    });
  }

  if (linkedInUrl) {
    evidenceList.push({
      id: "founder-linkedin-ref",
      label: "LinkedIn profile (reference)",
      value: linkedInUrl,
      state: "submitted",
    });
  }

  if (!profileText && !resumePdf?.success && !profileArtifact) {
    missingEvidenceList.push("Founder operating history or resume");
  }

  // 2. Startup & Website evidence
  if (startupDescription) {
    evidenceList.push({
      id: "startup-description",
      label: "Startup description",
      value: startupDescription,
      state: "submitted",
    });
  }

  if (website && website.success) {
    const websiteSummary = [
      website.title ? `Title: ${website.title}` : "",
      website.description ? `Meta: ${website.description}` : "",
      website.headings.length ? `Headings: ${website.headings.slice(0, 3).join(" | ")}` : "",
    ].filter(Boolean).join(" | ");

    evidenceList.push({
      id: "startup-website",
      label: `Startup website (${website.normalizedUrl})`,
      value: websiteSummary || "Website content extracted successfully.",
      state: "submitted",
    });
  } else if (websiteUrl) {
    evidenceList.push({
      id: "startup-website",
      label: "Startup website URL",
      value: websiteUrl,
      state: "submitted",
    });
  } else {
    missingEvidenceList.push("Startup website or public product page");
  }

  // 3. Pitch deck evidence
  if (deckPdf && deckPdf.success) {
    evidenceList.push({
      id: "pitch-deck",
      label: `Pitch deck (${deckPdf.filename})`,
      value: `Parsed ${deckPdf.pageCount} slides. Sections found: ${deckPdf.detectedSections.join(", ") || "General presentation"}.`,
      state: "submitted",
    });
  } else if (deckArtifact) {
    evidenceList.push({
      id: "pitch-deck",
      label: `Pitch deck (${deckArtifact.name})`,
      value: "Pitch deck file attached.",
      state: "attached",
    });
  } else {
    missingEvidenceList.push("Pitch deck");
  }

  // 4. Mentor answers
  if (answers.stage?.text) {
    evidenceList.push({ id: "stage-answer", label: "Product stage", value: answers.stage.text, state: "submitted" });
  }
  if (answers.traction?.text) {
    evidenceList.push({ id: "traction-answer", label: "Traction proof", value: answers.traction.text, state: "submitted" });
  }
  if (answers["founder-fit"]?.text) {
    evidenceList.push({ id: "founder-fit-answer", label: "Founder-market fit", value: answers["founder-fit"].text, state: "submitted" });
  }
  if (answers.differentiation?.text) {
    evidenceList.push({ id: "differentiation-answer", label: "Differentiation", value: answers.differentiation.text, state: "submitted" });
  }
  if (answers["funding-outcome"]?.text) {
    evidenceList.push({ id: "funding-answer", label: "Funding outcome & target milestone", value: answers["funding-outcome"].text, state: "submitted" });
  }

  return {
    founder: {
      name: founderName,
      role: founderRole,
      linkedInUrl,
      profileText,
      resumeParsed: Boolean(resumePdf?.success),
      resumeFilename: resumePdf?.filename || null,
      yearsOfExperience: founderProfile?.extractedYearsOfExperience || null,
      previousCompaniesOrRoles: founderProfile?.previousCompaniesOrRoles || [],
      signals: founderProfile?.detectedSignals || [],
    },
    startup: {
      name: startupName,
      websiteUrl,
      websiteFetched: Boolean(website?.success),
      websiteTitle: website?.title || null,
      websiteDescription: website?.description || null,
      websiteHeadings: website?.headings || [],
      websiteSignals: website?.productSignals || [],
      pitchDescription: startupDescription,
    },
    pitchDeck: {
      attached: Boolean(deckArtifact || deckPdf),
      parsed: Boolean(deckPdf?.success),
      filename: deckPdf?.filename || deckArtifact?.name || null,
      pageCount: deckPdf?.pageCount || 0,
      detectedSections: deckPdf?.detectedSections || [],
      slideSummaries: deckPdf?.slideSections || [],
      extractedSnippet: deckPdf?.extractedText?.slice(0, 4000) || "",
    },
    answers,
    evidenceList,
    missingEvidenceList,
    createdAt,
  };
}
