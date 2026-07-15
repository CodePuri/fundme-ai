import type {
  ArtifactResult,
  EvidenceItem,
  GrillDossier,
  GrillIntake,
} from "./types";
import { findMissingInformation } from "./validation";

type IntakeEvidenceDefinition = {
  key: string;
  category: EvidenceItem["category"];
  sourceType: EvidenceItem["sourceType"];
  sourceLabel: string;
  value: string | number;
};

function evidenceId(key: string) {
  return `evidence-${key.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`;
}

function createFounderEnteredEvidence(
  definition: IntakeEvidenceDefinition,
): EvidenceItem | null {
  const text = String(definition.value).trim();
  if (!text || text === "0") return null;
  return {
    id: evidenceId(definition.key),
    category: definition.category,
    sourceType: definition.sourceType,
    sourceLabel: definition.sourceLabel,
    text,
    confidence: 0.82,
    origin: "founder_entered",
  };
}

function intakeDefinitions(intake: GrillIntake): IntakeEvidenceDefinition[] {
  return [
    { key: "founder-name", category: "founder", sourceType: "founder_intake", sourceLabel: "Founder name", value: intake.founder.fullName },
    { key: "founder-role", category: "founder", sourceType: "founder_intake", sourceLabel: "Founder role", value: intake.founder.role },
    { key: "founder-background", category: "founder", sourceType: "founder_intake", sourceLabel: "Founder background", value: intake.founder.background },
    { key: "founder-experience", category: "founder", sourceType: "founder_intake", sourceLabel: "Years of relevant experience", value: intake.founder.yearsExperience ? `${intake.founder.yearsExperience} years` : "" },
    { key: "founder-achievements", category: "founder", sourceType: "founder_intake", sourceLabel: "Founder achievements", value: intake.founder.achievements },
    { key: "founder-profile", category: "profile", sourceType: "founder_intake", sourceLabel: "Pasted LinkedIn/profile text", value: intake.founder.profileText },
    { key: "startup-name", category: "solution", sourceType: "startup_intake", sourceLabel: "Startup name", value: intake.startup.name },
    { key: "startup-pitch", category: "solution", sourceType: "startup_intake", sourceLabel: "One-line pitch", value: intake.startup.oneLinePitch },
    { key: "startup-problem", category: "problem", sourceType: "startup_intake", sourceLabel: "Problem", value: intake.startup.problem },
    { key: "startup-solution", category: "solution", sourceType: "startup_intake", sourceLabel: "Solution", value: intake.startup.solution },
    { key: "startup-customer", category: "customer", sourceType: "startup_intake", sourceLabel: "Target customer", value: intake.startup.targetCustomer },
    { key: "startup-market", category: "market", sourceType: "startup_intake", sourceLabel: "Market", value: intake.startup.market },
    { key: "startup-stage", category: "traction", sourceType: "startup_intake", sourceLabel: "Stage", value: intake.startup.stage },
    { key: "startup-traction", category: "traction", sourceType: "startup_intake", sourceLabel: "Traction", value: intake.startup.traction },
    { key: "startup-revenue-users", category: "traction", sourceType: "startup_intake", sourceLabel: "Revenue or users", value: intake.startup.revenueOrUsers },
    { key: "startup-team", category: "team", sourceType: "startup_intake", sourceLabel: "Team", value: intake.startup.team },
    { key: "startup-funding-ask", category: "funding", sourceType: "startup_intake", sourceLabel: "Funding ask", value: intake.startup.fundingAsk },
    { key: "startup-use-of-funds", category: "funding", sourceType: "startup_intake", sourceLabel: "Use of funds", value: intake.startup.useOfFunds },
  ];
}

function artifactEvidence(artifact: ArtifactResult): EvidenceItem | null {
  if (artifact.status !== "parsed" || !artifact.text.trim()) return null;
  const isDeck = artifact.kind === "pitch_deck";
  return {
    id: evidenceId(`${artifact.kind}-${artifact.fileName ?? artifact.sourceLabel}`),
    category: isDeck ? "deck" : "profile",
    sourceType: isDeck ? "pitch_deck" : "profile_document",
    sourceLabel: artifact.sourceLabel,
    text: artifact.text.trim(),
    confidence: 0.68,
    origin: "parser_extracted",
  };
}

export function buildDossier(
  intake: GrillIntake,
  artifacts: ArtifactResult[],
): GrillDossier {
  const evidence = intakeDefinitions(intake)
    .map(createFounderEnteredEvidence)
    .filter((item): item is EvidenceItem => item !== null);

  for (const artifact of artifacts) {
    const item = artifactEvidence(artifact);
    if (item) evidence.push(item);
  }

  return {
    founder: intake.founder,
    startup: intake.startup,
    evidence,
    artifacts,
    missingInformation: findMissingInformation(intake, artifacts),
  };
}
