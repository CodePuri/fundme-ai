import { NextRequest, NextResponse } from "next/server";
import { createOrGetShareToken } from "@/lib/assessment/share";
import { logAnalyticsEvent } from "@/lib/analytics/events";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { assessmentId, claimToken } = json || {};

    if (!assessmentId && !claimToken) {
      return NextResponse.json({ ok: false, error: "Missing assessmentId or claimToken" }, { status: 400 });
    }

    const shareData = await createOrGetShareToken({ assessmentId, claimToken });

    // Track analytics event
    await logAnalyticsEvent({
      eventName: "assessment_shared",
      properties: { shareToken: shareData.shareToken, referralCode: shareData.referralCode },
    });

    return NextResponse.json({ ok: true, ...shareData });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
