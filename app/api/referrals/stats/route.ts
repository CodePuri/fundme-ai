import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getFounderReferralStats } from "@/lib/analytics/referrals";

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const clerkAuth = await auth();
      userId = clerkAuth.userId;
    } catch {
      // Unauthenticated or unconfigured Clerk
    }
    const clerkUserIdQuery = req.nextUrl.searchParams.get("clerkUserId")?.trim();
    const effectiveUserId = userId || clerkUserIdQuery;

    if (!effectiveUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized. Sign-in required for referral dashboard." }, { status: 401 });
    }

    const origin = req.headers.get("origin") || req.nextUrl.origin || "https://staging.tryfundme.in";
    const stats = await getFounderReferralStats(effectiveUserId, origin);
    return NextResponse.json({ ok: true, stats });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
