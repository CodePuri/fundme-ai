import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getLatestAssessmentForUser, getAssessmentByClaimToken } from "@/lib/assessment/database";

export async function GET(req: Request) {
  try {
    let userId: string | null = null;
    try {
      const clerkAuth = await auth();
      userId = clerkAuth.userId;
    } catch {
      // Unauthenticated caller or unconfigured Clerk in preview
    }
    const url = new URL(req.url);
    const claimToken = url.searchParams.get("claim_token")?.trim();

    if (!userId && !claimToken) {
      return NextResponse.json({ ok: false, hasAssessment: false, error: "Unauthorized" }, { status: 401 });
    }

    // 1. If authenticated user, fetch their own latest assessment
    if (userId) {
      const data = await getLatestAssessmentForUser(userId);
      if (data.hasAssessment) {
        return NextResponse.json({
          ok: true,
          hasAssessment: true,
          assessment: data.assessment,
          founder: data.founder,
          startup: data.startup,
        });
      }
    }

    // 2. If claimToken provided for an unauthenticated / pending session
    if (claimToken) {
      const assessment = await getAssessmentByClaimToken(claimToken, userId || null);

      if (!assessment) {
        return NextResponse.json({ ok: false, hasAssessment: false, error: "Assessment not found" }, { status: 404 });
      }

      // Security Guard: If already claimed by another user, deny access
      if (assessment.claim_status === "claimed" && assessment.clerk_user_id && assessment.clerk_user_id !== userId) {
        return NextResponse.json({ ok: false, hasAssessment: false, error: "Access denied. Assessment belongs to another account." }, { status: 403 });
      }

      return NextResponse.json({
        ok: true,
        hasAssessment: true,
        assessment,
        founder: { name: assessment.founder_name },
        startup: { startup_name: assessment.startup_name, website_url: assessment.website_url },
      });
    }

    return NextResponse.json({ ok: false, hasAssessment: false }, { status: 404 });
  } catch (err: any) {
    console.error("Error in /api/assessment/latest:", err);
    return NextResponse.json({ ok: false, hasAssessment: false, error: err?.message || "Failed to fetch assessment." }, { status: 500 });
  }
}
