import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createOrGetShareToken } from "@/lib/assessment/share";
import { logAnalyticsEvent } from "@/lib/analytics/events";

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req, "share", { maxRequests: 30, windowMs: 60_000 });
  if (!rate.allowed) {
    return createRateLimitResponse(rate.resetInMs);
  }

  try {
    const { userId } = await auth();
    const json = await req.json();
    const { assessmentId, claimToken } = json || {};

    if (!assessmentId && !claimToken) {
      return NextResponse.json({ ok: false, error: "Missing assessmentId or claimToken" }, { status: 400 });
    }

    const shareData = await createOrGetShareToken({
      assessmentId,
      claimToken,
      clerkUserId: userId || undefined,
    });

    // Track analytics event
    await logAnalyticsEvent({
      eventName: "assessment_shared",
      clerkUserId: userId || undefined,
      properties: { shareToken: shareData.shareToken, referralCode: shareData.referralCode },
    });

    return NextResponse.json({ ok: true, ...shareData });
  } catch (err: any) {
    const isAuthError = err.message?.includes("Access denied");
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: isAuthError ? 403 : 500 }
    );
  }
}
