import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getFounderReferralStats } from "@/lib/analytics/referrals";

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      userId = (await auth()).userId;
    } catch {
      // Treat missing Clerk configuration as unauthenticated.
    }
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized. Sign-in required for referral dashboard." }, { status: 401 });
    }

    const origin = req.nextUrl.origin;
    const stats = await getFounderReferralStats(userId, origin);
    return NextResponse.json({ ok: true, stats });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
