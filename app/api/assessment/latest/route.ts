import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getLatestAssessmentForUser } from "@/lib/assessment/database";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, hasAssessment: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await getLatestAssessmentForUser(userId);
    return NextResponse.json({
      ok: true,
      hasAssessment: data.hasAssessment,
      assessment: data.assessment,
      founder: data.founder,
      startup: data.startup,
    });
  } catch (err: any) {
    console.error("Error in /api/assessment/latest:", err);
    return NextResponse.json({ ok: false, hasAssessment: false, error: err?.message || "Failed to fetch assessment." }, { status: 500 });
  }
}
