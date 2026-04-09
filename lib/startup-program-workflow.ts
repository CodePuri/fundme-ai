import {
  type FounderProfile,
  type MatchLabel,
  type Opportunity,
  type StartupProfile,
} from "@/lib/demo-data";
import { type StartupProgram } from "@/lib/startup-programs";

export type StartupProgramWorkspaceContext = {
  subtitle: string;
  fitSummary: string;
  requirements: string[];
  gaps: string[];
  contextCards: Array<{ label: string; text: string }>;
};

function buildMatchLabel(score: number): MatchLabel {
  if (score >= 80) {
    return "Strong Match";
  }

  if (score >= 65) {
    return "Good Match";
  }

  return "Possible Match";
}

function buildShortName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
}

export function buildOpportunityFromStartupProgram(program: StartupProgram): Opportunity {
  const fitScore = Math.min(96, Math.round((program.ranking_score + program.editorial_score) / 2));
  const timestamp = new Date().toISOString();

  return {
    slug: program.workflow_slug,
    shortName: buildShortName(program.name),
    name: program.name,
    domain: new URL(program.website_url).hostname.replace(/^www\./, ""),
    type: program.program_type,
    category: program.organization_type,
    location: program.display_geography_chips.join(" / ") || program.hq_country,
    deadline: program.application_deadline || (program.rolling_applications ? "Rolling" : "Active"),
    description: program.short_description,
    fitScore,
    fitLabel: buildMatchLabel(fitScore),
    why: program.founder_profile_fit,
    overview: program.investment_thesis,
    requirements: [
      `${program.program_type} focus on ${program.curriculum_focus.slice(0, 2).join(" and ").toLowerCase()}`,
      `Best fit stages: ${program.display_stage_chips.join(", ")}`,
      `Format: ${program.program_format}${program.relocation_required ? " with relocation expectations" : ""}`,
      `Primary geographies: ${program.display_geography_chips.join(", ")}`,
    ],
    gaps: [
      "Clarify company website and incorporation details",
      "Tighten why this program is the right next room",
      "Prepare a sharper founder-credibility answer for reviewers",
    ],
    signals: [
      program.display_thesis_snippet,
      program.perks_summary,
      program.founder_profile_fit,
    ],
    status: "Drafting",
    intelligence: null,
    lastUpdated: timestamp,
    lastEdited: timestamp,
    questionCount: 5,
    questionsCompleted: 0,
    tracked: true,
  };
}

export function buildStartupProgramWorkspaceContext(
  program: StartupProgram,
  startupProfile: StartupProfile,
  founderProfile: FounderProfile,
): StartupProgramWorkspaceContext {
  const gapCandidates = [
    ...startupProfile.missingInfo.map((item) => `Missing startup input: ${item}`),
    ...founderProfile.missingInfo.map((item) => `Missing founder input: ${item}`),
    program.relocation_required ? "Confirm relocation willingness for this program" : null,
    program.equity_free ? null : "Be explicit about financing expectations and equity tradeoffs",
  ].filter(Boolean) as string[];

  return {
    subtitle: `${program.organization_type} · ${program.program_type}`,
    fitSummary: `${program.name} looks relevant for ${startupProfile.companyName} because ${program.founder_profile_fit.toLowerCase()}`,
    requirements: [
      `Target stages: ${program.display_stage_chips.join(", ")}`,
      `Program format: ${program.program_format}${program.relocation_required ? " with relocation required" : ""}`,
      `Curriculum emphasis: ${program.curriculum_focus.slice(0, 3).join(", ")}`,
      `Perks: ${program.perks_summary}`,
    ],
    gaps: gapCandidates.slice(0, 3),
    contextCards: [
      {
        label: "Program thesis",
        text: program.display_thesis_snippet,
      },
      {
        label: "Why Flowstate fits",
        text: `${startupProfile.companyName} is a ${startupProfile.stage.toLowerCase()} ${startupProfile.sector.toLowerCase()} startup tackling ${startupProfile.problem.toLowerCase()}`,
      },
      {
        label: "Founder edge",
        text: founderProfile.credibility,
      },
      {
        label: "What reviewers should remember",
        text: `${program.name} should leave with one crisp takeaway: ${startupProfile.solution}`,
      },
    ],
  };
}
