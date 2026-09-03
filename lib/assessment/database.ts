import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { FundingReadinessReport, GrillSession } from "./types.ts";

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase configuration missing (SUPABASE_URL or SUPABASE_KEY).");
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export type SaveAssessmentParams = {
  claimToken: string;
  clerkUserId?: string | null;
  founderName: string;
  startupName: string;
  websiteUrl?: string | null;
  report: FundingReadinessReport;
  rawSession?: GrillSession | null;
};

export async function saveAssessmentToDatabase(params: SaveAssessmentParams) {
  const supabase = getSupabaseAdmin();
  const {
    claimToken,
    clerkUserId = null,
    founderName,
    startupName,
    websiteUrl = null,
    report,
    rawSession = null,
  } = params;

  const { data, error } = await supabase.rpc("rpc_save_assessment", {
    p_claim_token: claimToken,
    p_clerk_user_id: clerkUserId,
    p_founder_name: founderName || null,
    p_startup_name: startupName || null,
    p_website_url: websiteUrl || null,
    p_report: report,
    p_raw_session: rawSession,
  });

  if (error) {
    console.error("Database saveAssessment error:", error);
    throw new Error(`Failed to save assessment: ${error.message}`);
  }

  return data;
}

export async function claimAssessmentForUser(params: {
  clerkUserId: string;
  claimToken: string;
  userEmail?: string | null;
  userName?: string | null;
}) {
  const { clerkUserId, claimToken, userEmail = null, userName = null } = params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc("rpc_claim_assessment", {
    p_clerk_user_id: clerkUserId,
    p_claim_token: claimToken,
    p_user_email: userEmail,
    p_user_name: userName,
  });

  if (error) {
    throw new Error(`Failed to claim assessment: ${error.message}`);
  }

  return {
    ...data,
    already_claimed: data?.already_claimed ?? (data?.assessment?.claim_status === "claimed"),
  };
}

export async function getLatestAssessmentForUser(clerkUserId: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc("rpc_get_latest_assessment", {
    p_clerk_user_id: clerkUserId,
  });

  if (error) {
    console.error("Error fetching latest assessment:", error);
    throw new Error(`Failed to fetch user assessment: ${error.message}`);
  }

  return {
    hasAssessment: Boolean(data?.hasAssessment),
    assessment: data?.assessment || null,
    founder: data?.founder || null,
    startup: data?.startup || null,
  };
}

export async function getAssessmentByClaimToken(claimToken: string, clerkUserId?: string | null) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc("rpc_get_assessment_by_claim_token", {
    p_claim_token: claimToken,
    p_clerk_user_id: clerkUserId || null,
  });

  if (error) {
    throw new Error(`Failed to get assessment by claim token: ${error.message}`);
  }

  return data?.found ? data.assessment : null;
}

export async function getFirstSaveEmailDeliveryStatus(params: {
  assessmentId: string;
  clerkUserId: string;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("assessments")
    .select("first_save_email_sent_at")
    .eq("id", params.assessmentId)
    .eq("clerk_user_id", params.clerkUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read first-save email delivery status: ${error.message}`);
  }

  return Boolean(data?.first_save_email_sent_at);
}

export async function recordFirstSaveEmailDelivery(params: {
  assessmentId: string;
  clerkUserId: string;
  providerMessageId?: string;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("assessments")
    .update({
      first_save_email_sent_at: new Date().toISOString(),
      first_save_email_provider_id: params.providerMessageId || null,
    })
    .eq("id", params.assessmentId)
    .eq("clerk_user_id", params.clerkUserId)
    .is("first_save_email_sent_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to record first-save email delivery: ${error.message}`);
  }

  return Boolean(data?.id);
}
