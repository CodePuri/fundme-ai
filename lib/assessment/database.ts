import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { FundingReadinessReport, GrillSession } from "./types";

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase configuration missing (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).");
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

  const row = {
    claim_token: claimToken,
    clerk_user_id: clerkUserId,
    claim_status: clerkUserId ? "claimed" : "pending",
    founder_name: founderName || null,
    startup_name: startupName || null,
    website_url: websiteUrl || null,
    readiness_score: report.readinessScore,
    verdict: report.verdict,
    concise_verdict: report.conciseVerdict,
    confidence: report.confidence,
    completion_state: report.completionState,
    evidence_coverage: report.evidenceCoverage,
    strongest_dimension: report.strongestDimension,
    weakest_dimension: report.weakestDimension,
    traction_state: report.tractionState,
    rubric_version: report.rubricVersion,
    dimensions: report.dimensions,
    evidence: report.evidence,
    findings: report.findings,
    founder_review: report.founderReview,
    startup_review: report.startupReview,
    deck_review: report.deckReview,
    actions: report.actions,
    raw_session: rawSession,
    claimed_at: clerkUserId ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("assessments")
    .upsert(row, { onConflict: "claim_token" })
    .select("id, claim_token, created_at")
    .single();

  if (error) {
    console.error("Database saveAssessment error:", error);
    throw new Error(`Failed to save assessment: ${error.message}`);
  }

  // If user is already authenticated, also sync their profiles
  if (clerkUserId) {
    await syncUserProfiles(supabase, clerkUserId, {
      founderName,
      startupName,
      websiteUrl,
      description: rawSession?.input.description || null,
      profileText: rawSession?.input.profileText || null,
      linkedInUrl: rawSession?.input.linkedInUrl || null,
      role: rawSession?.input.founderRole || null,
    });
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

  // 1. Fetch existing assessment
  const { data: existing, error: fetchErr } = await supabase
    .from("assessments")
    .select("id, clerk_user_id, claim_status, founder_name, startup_name, website_url, raw_session")
    .eq("claim_token", claimToken)
    .maybeSingle();

  if (fetchErr) {
    throw new Error(`Database error looking up assessment: ${fetchErr.message}`);
  }

  if (!existing) {
    throw new Error("Assessment not found for the provided claim token.");
  }

  // Prevent cross-user claiming
  if (existing.clerk_user_id && existing.clerk_user_id !== clerkUserId) {
    throw new Error("This assessment has already been claimed by another account.");
  }

  // 2. Update assessment with owner
  const { data: updated, error: updateErr } = await supabase
    .from("assessments")
    .update({
      clerk_user_id: clerkUserId,
      claim_status: "claimed",
      claimed_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select("id, clerk_user_id, claim_status, claimed_at")
    .single();

  if (updateErr) {
    throw new Error(`Failed to claim assessment: ${updateErr.message}`);
  }

  // 3. Upsert Founder Profile & Startup Profile
  const raw = existing.raw_session as GrillSession | null;
  const founderName = existing.founder_name || userName || raw?.input?.founderName || "Founder";
  const startupName = existing.startup_name || raw?.input?.startupName || "Your startup";

  await syncUserProfiles(supabase, clerkUserId, {
    email: userEmail,
    founderName,
    startupName,
    websiteUrl: existing.website_url || raw?.input?.websiteUrl || null,
    description: raw?.input?.description || null,
    profileText: raw?.input?.profileText || null,
    linkedInUrl: raw?.input?.linkedInUrl || null,
    role: raw?.input?.founderRole || null,
  });

  return { success: true, assessmentId: updated.id };
}

async function syncUserProfiles(
  supabase: SupabaseClient,
  clerkUserId: string,
  data: {
    email?: string | null;
    founderName?: string | null;
    startupName?: string | null;
    websiteUrl?: string | null;
    description?: string | null;
    profileText?: string | null;
    linkedInUrl?: string | null;
    role?: string | null;
  },
) {
  try {
    // Founder profile
    await supabase.from("founder_profiles").upsert(
      {
        clerk_user_id: clerkUserId,
        email: data.email || null,
        name: data.founderName || null,
        role: data.role || null,
        linkedin_url: data.linkedInUrl || null,
        profile_text: data.profileText || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id" },
    );

    // Startup profile
    await supabase.from("startup_profiles").upsert(
      {
        clerk_user_id: clerkUserId,
        startup_name: data.startupName || null,
        website_url: data.websiteUrl || null,
        description: data.description || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id" },
    );
  } catch (err) {
    console.warn("Non-fatal profile sync warning:", err);
  }
}

export async function getLatestAssessmentForUser(clerkUserId: string) {
  const supabase = getSupabaseAdmin();

  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching latest assessment:", error);
    throw new Error(`Failed to fetch user assessment: ${error.message}`);
  }

  const { data: founder } = await supabase
    .from("founder_profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  const { data: startup } = await supabase
    .from("startup_profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  return {
    hasAssessment: Boolean(assessment),
    assessment: assessment || null,
    founder: founder || null,
    startup: startup || null,
  };
}
