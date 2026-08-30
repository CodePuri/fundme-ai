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
    const { data: rows, error } = await supabase
      .from("referrals")
      .select("id, status")
      .eq("referrer_clerk_user_id", clerkUserId)
      .in("status", ["assessment_completed", "signed_up"]);

    const referralCount = (!error && rows) ? rows.length : 0;
    const priorityRank = Math.max(1, 100 - referralCount * 15);
    const priorityTier =
      referralCount >= 3
        ? "Top 5% Early Access"
        : referralCount >= 1
        ? "Priority Waitlist"
        : "Standard Waitlist";

    return {
      referralCode,
      referralCount,
      priorityRank,
      priorityTier,
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

export async function recordReferralVisit(params: {
  referralCode: string;
  referrerClerkUserId?: string | null;
}) {
  const { referralCode, referrerClerkUserId } = params;
  if (!referralCode) return;

  const supabase = getSupabaseAdmin();
  const referrer = referrerClerkUserId || referralCode;

  try {
    await supabase.from("referrals").insert({
      referrer_clerk_user_id: referrer,
      referral_code: referralCode,
      status: "visited",
    });
  } catch (err) {
    console.warn("recordReferralVisit failed:", err);
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
    await supabase.from("referrals").insert({
      referrer_clerk_user_id: referralCode,
      referral_code: referralCode,
      referred_claim_token: claimToken,
      status: "assessment_completed",
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
    // If a referral record exists for this claim token or referral code, update it
    if (claimToken) {
      const { data: existing } = await supabase
        .from("referrals")
        .select("id")
        .eq("referred_claim_token", claimToken)
        .limit(1);

      if (existing && existing.length > 0) {
        await supabase
          .from("referrals")
          .update({
            referred_clerk_user_id: clerkUserId,
            status: "signed_up",
            signed_up_at: new Date().toISOString(),
          })
          .eq("id", existing[0].id);
        return;
      }
    }

    if (referralCode) {
      await supabase.from("referrals").insert({
        referrer_clerk_user_id: referralCode,
        referral_code: referralCode,
        referred_clerk_user_id: clerkUserId,
        referred_claim_token: claimToken || null,
        status: "signed_up",
        signed_up_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn("recordReferralSignup failed:", err);
  }
}
