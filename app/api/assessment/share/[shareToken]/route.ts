import { NextRequest, NextResponse } from "next/server";
import { getPublicShareReport } from "@/lib/assessment/share";
import { logAnalyticsEvent } from "@/lib/analytics/events";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    const report = await getPublicShareReport(shareToken);

    if (!report) {
      return NextResponse.json({ ok: false, error: "Shared assessment not found or expired" }, { status: 404 });
    }

    // Track public share view
    await logAnalyticsEvent({
      eventName: "shared_assessment_viewed",
      properties: { shareToken, readinessScore: report.readinessScore },
    });

    return NextResponse.json({ ok: true, report });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
