import { getSupabaseAdmin } from "../assessment/database.ts";
import { createPreviewReferralCode } from "../assessment/share.ts";

export type ReferralStats = {
  referralCode: string;
  referralCount: number;
  priorityRank: number;
  priorityTier: string;
  referralLink: string;
};

export async function getFounderReferralStats(
  clerkUserId: string,
  baseUrl: string = "https://staging.tryfundme.in"
): Promise<ReferralStats> {
  const supabase = getSupabaseAdmin();
  const referralCode = createPreviewReferralCode(clerkUserId);

  try {
    const { data, error } = await supabase.rpc("rpc_get_referral_stats", {
      p_clerk_user_id: clerkUserId,
      p_origin: baseUrl,
    });

    if (error || !data) {
      return {
        referralCode,
        referralCount: 0,
        priorityRank: 100,
        priorityTier: "Standard Waitlist",
        referralLink: `${baseUrl}/assessment?ref=${referralCode}`,
      };
    }

    return {
      referralCode,
      referralCount: data.referralCount || 0,
      priorityRank: data.priorityRank || 100,
      priorityTier: data.priorityTier || "Standard Waitlist",
      referralLink: `${baseUrl}/assessment?ref=${referralCode}`,
    };
  } catch {
    return {
      referralCode,
      referralCount: 0,
      priorityRank: 100,
      priorityTier: "Standard Waitlist",
      referralLink: `${baseUrl}/assessment?ref=${referralCode}`,
    };
  }
}

export async function recordReferralAssessmentCompleted(params: {
  referralCode: string;
  claimToken: string;
}) {
  const { referralCode, claimToken } = params;
  if (!referralCode || !claimToken) return;

  const supabase = getSupabaseAdmin();

  try {
    await supabase.rpc("rpc_record_referral_signup", {
      p_referral_code: referralCode,
      p_referred_clerk_user_id: null,
      p_referred_claim_token: claimToken,
    });
  } catch (err) {
    console.warn("recordReferralAssessmentCompleted failed:", err);
  }
}

export async function recordReferralSignup(params: {
  referralCode?: string | null;
  clerkUserId: string;
  claimToken?: string | null;
}) {
  const { referralCode, clerkUserId, claimToken } = params;
  if (!clerkUserId) return;

  const supabase = getSupabaseAdmin();

  try {
    await supabase.rpc("rpc_record_referral_signup", {
      p_referral_code: referralCode || claimToken || "PREVIEW-DIRECT",
      p_referred_clerk_user_id: clerkUserId,
      p_referred_claim_token: claimToken || null,
    });
  } catch (err) {
    console.warn("recordReferralSignup failed:", err);
  }
}
