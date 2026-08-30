import crypto from "crypto";
import { getSupabaseAdmin } from "./database.ts";
import type { FundingReadinessReport } from "./types.ts";

export type PublicShareReport = {
  shareToken: string;
  startupName: string;
  readinessScore: number;
  verdict: string;
  conciseVerdict: string;
  confidence: string;
  evidenceCoverage: number;
  strongestDimension: string;
  weakestDimension: string;
  tractionState: string;
  dimensions: Array<{ id: string; label: string; score: number; explanation: string }>;
  publicActions: Array<{ horizon: string; title: string; detail: string }>;
  generatedAt: string;
  referralCode: string;
};

export type ShareInput = {
  title: string;
  text: string;
  url?: string;
  share?: (data: { title: string; text: string; url?: string }) => Promise<void>;
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
      await input.share({ title: input.title, text: input.text, url: input.url });
      return "shared";
    } catch {
      // Fallback to clipboard
    }
  }
  await input.writeText(input.url || input.text);
  return "copied";
}

export function createPreviewReferralCode(identifier: string): string {
  const normalized = (identifier || "fundme-founder").trim().toLowerCase();
  let hash = 2166136261;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `PREVIEW-${(hash >>> 0).toString(36).toUpperCase().padStart(8, "0").slice(-8)}`;
}

export async function createOrGetShareToken(params: {
  assessmentId?: string;
  claimToken?: string;
  clerkUserId?: string;
}): Promise<{ shareToken: string; shareUrl: string; referralCode: string }> {
  const supabase = getSupabaseAdmin();
  const { assessmentId, claimToken, clerkUserId } = params;

  const { data, error } = await supabase.rpc("rpc_create_or_get_share_token", {
    p_assessment_id: assessmentId || null,
    p_claim_token: claimToken || null,
    p_clerk_user_id: clerkUserId || null,
  });

  if (error || !data) {
    throw new Error(`Failed to create or get share token: ${error?.message || "Not found"}`);
  }

  const referralCode = createPreviewReferralCode(data.referralCode);

  return {
    shareToken: data.shareToken,
    shareUrl: data.shareUrl,
    referralCode,
  };
}

export async function getPublicShareReport(shareToken: string): Promise<PublicShareReport | null> {
  if (!shareToken) return null;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc("get_public_share_report", {
    p_share_token: shareToken,
  });

  if (error || !data) {
    return null;
  }

  const referralCode = createPreviewReferralCode(data.referralCode || data.shareToken);

  return {
    ...data,
    referralCode,
  };
}
