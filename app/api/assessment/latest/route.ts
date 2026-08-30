import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getLatestAssessmentForUser, getSupabaseAdmin } from "@/lib/assessment/database";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const url = new URL(req.url);
    const claimToken = url.searchParams.get("claim_token");

    if (!userId && !claimToken) {
      return NextResponse.json({ ok: false, hasAssessment: false, error: "Unauthorized" }, { status: 401 });
    }

    if (claimToken) {
      const supabase = getSupabaseAdmin();
      const { data: assessment } = await supabase
        .from("assessments")
        .select("*")
        .eq("claim_token", claimToken)
        .single();

      if (assessment) {
        return NextResponse.json({
          ok: true,
          hasAssessment: true,
          assessment,
          founder: { name: assessment.founder_name },
          startup: { startup_name: assessment.startup_name, website_url: assessment.website_url },
        });
      }
    }

    if (userId) {
      const data = await getLatestAssessmentForUser(userId);
      return NextResponse.json({
        ok: true,
        hasAssessment: data.hasAssessment,
        assessment: data.assessment,
        founder: data.founder,
        startup: data.startup,
      });
    }

    return NextResponse.json({ ok: false, hasAssessment: false }, { status: 404 });
  } catch (err: any) {
    console.error("Error in /api/assessment/latest:", err);
    return NextResponse.json({ ok: false, hasAssessment: false, error: err?.message || "Failed to fetch assessment." }, { status: 500 });
  }
}
