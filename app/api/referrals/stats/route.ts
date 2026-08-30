import { NextRequest, NextResponse } from "next/server";
import { getFounderReferralStats } from "@/lib/analytics/referrals";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkUserId = searchParams.get("clerkUserId") || searchParams.get("identifier") || "fundme-founder";
    const origin = req.headers.get("origin") || req.nextUrl.origin || "https://staging.tryfundme.in";

    const stats = await getFounderReferralStats(clerkUserId, origin);
    return NextResponse.json({ ok: true, stats });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
