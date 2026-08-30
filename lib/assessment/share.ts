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
      // Rejected and unsupported native shares use the explicit clipboard fallback.
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
}): Promise<{ shareToken: string; shareUrl: string; referralCode: string }> {
  const supabase = getSupabaseAdmin();
  const { assessmentId, claimToken } = params;

  // Find row
  let query = supabase.from("assessments").select("id, claim_token, share_token, clerk_user_id, startup_name");
  if (assessmentId) {
    query = query.eq("id", assessmentId);
  } else if (claimToken) {
    query = query.eq("claim_token", claimToken);
  } else {
    throw new Error("Must provide assessmentId or claimToken");
  }

  const { data: row, error } = await query.single();
  if (error || !row) {
    throw new Error("Assessment not found for sharing");
  }

  const referralCode = createPreviewReferralCode(row.clerk_user_id || row.claim_token);

  if (row.share_token) {
    return {
      shareToken: row.share_token,
      shareUrl: `/share/${row.share_token}`,
      referralCode,
    };
  }

  // Generate new unguessable token
  const token = `sh_${crypto.randomBytes(12).toString("hex")}`;
  await supabase
    .from("assessments")
    .update({
      share_token: token,
      shared_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  return {
    shareToken: token,
    shareUrl: `/share/${token}`,
    referralCode,
  };
}

export async function getPublicShareReport(shareToken: string): Promise<PublicShareReport | null> {
  if (!shareToken) return null;
  const supabase = getSupabaseAdmin();

  // Query ONLY public-safe columns
  const { data: row, error } = await supabase
    .from("assessments")
    .select(
      "share_token, startup_name, readiness_score, verdict, concise_verdict, confidence, evidence_coverage, strongest_dimension, weakest_dimension, traction_state, dimensions, actions, created_at, share_views, clerk_user_id, claim_token"
    )
    .eq("share_token", shareToken)
    .single();

  if (error || !row) {
    return null;
  }

  // Increment view count asynchronously
  supabase
    .from("assessments")
    .update({ share_views: (row.share_views || 0) + 1 })
    .eq("share_token", shareToken)
    .then(() => {});

  const referralCode = createPreviewReferralCode(row.clerk_user_id || row.claim_token);

  // Strictly filter public actions (title, horizon, detail only)
  const rawActions = Array.isArray(row.actions) ? row.actions : [];
  const publicActions = rawActions.map((a: any) => ({
    horizon: String(a.horizon || "fix-now"),
    title: String(a.title || ""),
    detail: String(a.detail || ""),
  }));

  const rawDimensions = Array.isArray(row.dimensions) ? row.dimensions : [];
  const dimensions = rawDimensions.map((d: any) => ({
    id: String(d.id || ""),
    label: String(d.label || ""),
    score: Number(d.score || 0),
    explanation: String(d.explanation || ""),
  }));

  return {
    shareToken: row.share_token,
    startupName: row.startup_name || "Startup",
    readinessScore: row.readiness_score,
    verdict: row.verdict,
    conciseVerdict: row.concise_verdict || row.verdict,
    confidence: row.confidence,
    evidenceCoverage: row.evidence_coverage,
    strongestDimension: row.strongest_dimension || "problem-clarity",
    weakestDimension: row.weakest_dimension || "traction-proof",
    tractionState: row.traction_state || "unverified",
    dimensions,
    publicActions,
    generatedAt: row.created_at,
    referralCode,
  };
}
