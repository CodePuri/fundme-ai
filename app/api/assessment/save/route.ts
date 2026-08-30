import { sendAssessmentSavedEmail } from "@/lib/email/resend";
import { recordReferralSignup } from "@/lib/analytics/referrals";
import { logAnalyticsEvent } from "@/lib/analytics/events";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { claimAssessmentForUser, saveAssessmentToDatabase } from "@/lib/assessment/database";
import type { GrillSession } from "@/lib/assessment/types";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized. Please sign in with Google." }, { status: 401 });
    }

    let userEmail: string | null = null;
    let userName: string | null = null;
    try {
      const user = await currentUser();
      userEmail = user?.emailAddresses?.[0]?.emailAddress ?? null;
      userName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;
    } catch {}

    const body = await req.json() as {
      claimToken?: string;
      session?: GrillSession;
      referralCode?: string;
    };

    const claimToken = body.claimToken?.trim();

    const host = req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = proto && host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || "https://tryfundme.in");

    // If claimToken provided, link existing assessment
    if (claimToken) {
      try {
        const result = await claimAssessmentForUser({
          clerkUserId: userId,
          claimToken,
          userEmail,
          userName,
        });
        if (body.referralCode || claimToken) {
          await recordReferralSignup({ referralCode: body.referralCode, clerkUserId: userId, claimToken });
        }
        await logAnalyticsEvent({
          eventName: "assessment_saved",
          clerkUserId: userId,
          properties: { referralCode: body.referralCode || null },
        });
        
        if (userEmail) {
          sendAssessmentSavedEmail(userEmail, {
            founderName: userName || "Founder",
            startupName: result.assessment?.startup_name || "Your startup",
            readinessScore: result.assessment?.readiness_score || 0,
            verdict: result.assessment?.verdict || "Funding Readiness Assessment Saved",
            workspaceUrl: `${baseUrl}/app/preview?claim_token=${claimToken}`,
          }).catch(e => console.warn("Email send error:", e));
        }
        return NextResponse.json({ ok: true, success: true, assessmentId: result.assessmentId });
      } catch (claimErr: any) {
        // If assessment wasn't found by claim token but session is supplied, create directly
        if (!body.session || !body.session.report) {
          return NextResponse.json({ ok: false, error: claimErr?.message || "Failed to claim assessment." }, { status: 400 });
        }
      }
    }

    // Direct save if session provided
    if (body.session && body.session.report) {
      const session = body.session;
      const effectiveToken = claimToken || session.claimToken || `claim-${userId}-${Date.now()}`;
      const saved = await saveAssessmentToDatabase({
        claimToken: effectiveToken,
        clerkUserId: userId,
        founderName: session.input.founderName || userName || "Founder",
        startupName: session.input.startupName || "Your startup",
        websiteUrl: session.input.websiteUrl || null,
        report: session.report,
        rawSession: session,
      });
      if (body.referralCode || effectiveToken) {
        await recordReferralSignup({ referralCode: body.referralCode, clerkUserId: userId, claimToken: effectiveToken });
      }
      await logAnalyticsEvent({
        eventName: "assessment_saved",
        clerkUserId: userId,
        properties: { referralCode: body.referralCode || null },
      });
      
      if (userEmail && saved.report) {
        sendAssessmentSavedEmail(userEmail, {
          founderName: session.input.founderName || userName || "Founder",
          startupName: session.input.startupName || "Your startup",
          readinessScore: session.report.readinessScore,
          verdict: session.report.verdict,
          workspaceUrl: `${baseUrl}/app/preview?claim_token=${effectiveToken}`,
        }).catch(e => console.warn("Email send error:", e));
      }
      return NextResponse.json({ ok: true, success: true, assessmentId: saved.id });
    }

    return NextResponse.json({ ok: false, error: "Missing claimToken or session data." }, { status: 400 });
  } catch (err: any) {
    console.error("Error in /api/assessment/save:", err);
    return NextResponse.json({ ok: false, error: err?.message || "Failed to save assessment." }, { status: 500 });
  }
}
