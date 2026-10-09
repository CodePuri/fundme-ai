import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logAnalyticsEvent } from "@/lib/analytics/events";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { eventName, sessionId, properties } = json || {};
    const { userId } = await auth().catch(() => ({ userId: null }));

    if (!eventName) {
      return NextResponse.json({ ok: false, error: "Missing eventName" }, { status: 400 });
    }

    await logAnalyticsEvent({
      eventName,
      sessionId,
      clerkUserId: userId ?? undefined,
      properties,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
