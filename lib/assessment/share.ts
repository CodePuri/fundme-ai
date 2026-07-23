import type { FundingReadinessReport } from "./types.ts";

export type ShareInput = {
  title: string;
  text: string;
  share?: (data: { title: string; text: string }) => Promise<void>;
  writeText: (text: string) => Promise<void>;
};

export function serializeReport(report: FundingReadinessReport): string {
  const dimensions = report.dimensions
    .map((item) => `- ${item.label}: ${item.score}/100 — ${item.explanation}`)
    .join("\n");
  const actions = report.actions
    .map((item) => `- ${item.horizon}: ${item.title} — ${item.detail}`)
    .join("\n");
  const findings = report.findings.length
    ? report.findings.map((item) => `- ${item.type}: ${item.explanation} — ${item.action}`).join("\n")
    : "- No contradiction or missing-evidence findings were produced.";

  return [
    "FundMe Funding Readiness Preview",
    `Generated: ${report.generatedAt}`,
    `Rubric: ${report.rubricVersion}`,
    "",
    `Readiness: ${report.readinessScore}/100`,
    `Verdict: ${report.verdict}`,
    `Assessment state: ${report.completionState}`,
    `Traction state: ${report.tractionState}`,
    `Evidence coverage: ${report.evidenceCoverage}% (${report.confidence} confidence)`,
    "",
    "Dimensions",
    dimensions,
    "",
    "Findings",
    findings,
    "",
    "Founder review",
    `- Credibility: ${report.founderReview.credibility}`,
    `- Founder-market fit: ${report.founderReview.founderMarketFit}`,
    `- Profile positioning: ${report.founderReview.profilePositioning}`,
    "",
    "Startup review",
    `- Problem: ${report.startupReview.problem}`,
    `- Solution: ${report.startupReview.solution}`,
    `- Market: ${report.startupReview.market}`,
    `- Differentiation: ${report.startupReview.differentiation}`,
    `- Traction: ${report.startupReview.traction}`,
    `- Funding narrative: ${report.startupReview.fundingNarrative}`,
    "",
    "Deck review",
    `- Status: ${report.deckReview.status}`,
    `- ${report.deckReview.summary}`,
    "",
    "Actions",
    actions,
    "",
    "Preview boundary: This deterministic report uses only submitted text and attachment metadata. It is not an investment decision.",
  ].join("\n");
}

export async function shareReport(input: ShareInput): Promise<"shared" | "copied"> {
  if (input.share) {
    try {
      await input.share({ title: input.title, text: input.text });
      return "shared";
    } catch {
      // Rejected and unsupported native shares use the explicit clipboard fallback.
    }
  }
  await input.writeText(input.text);
  return "copied";
}

export function createPreviewReferralCode(email: string): string {
  const normalized = email.trim().toLowerCase();
  let hash = 2166136261;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `PREVIEW-${(hash >>> 0).toString(36).toUpperCase().padStart(8, "0").slice(-8)}`;
}
