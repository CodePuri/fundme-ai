import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { FundingReadinessReport, GrillSession } from "./types.ts";

const FUNDME_SERVER_INTERNAL_SECRET =
  process.env.FUNDME_SERVER_INTERNAL_SECRET || "fundme_staging_sec_7a89f0e1c2d3b4a5";

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
    global: {
      headers: {
        "x-fundme-server-secret": FUNDME_SERVER_INTERNAL_SECRET,
      },
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
