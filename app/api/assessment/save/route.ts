import { sendAssessmentSavedEmail } from "@/lib/email/resend";
import { recordReferralSignup } from "@/lib/analytics/referrals";
import { logAnalyticsEvent } from "@/lib/analytics/events";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  claimAssessmentForUser,
  getFirstSaveEmailDeliveryStatus,
  recordFirstSaveEmailDelivery,
  saveAssessmentToDatabase,
} from "@/lib/assessment/database";
import type { GrillSession } from "@/lib/assessment/types";

async function sendFirstSaveEmail(params: {
  assessmentId: string;
  clerkUserId: string;
  userEmail: string | null;
  founderName: string;
  startupName: string;
  readinessScore: number;
  verdict: string;
  workspaceUrl: string;
}) {
  if (!params.userEmail) return;

  try {
    if (await getFirstSaveEmailDeliveryStatus(params)) return;

    const emailResult = await sendAssessmentSavedEmail(params.userEmail, {
      founderName: params.founderName,
      startupName: params.startupName,
      readinessScore: params.readinessScore,
      verdict: params.verdict,
      workspaceUrl: params.workspaceUrl,
    }, { assessmentId: params.assessmentId });

    if (!emailResult.ok) {
      console.warn("Assessment saved email was not accepted by the provider.");
      return;
    }

    if (!await recordFirstSaveEmailDelivery({
      assessmentId: params.assessmentId,
      clerkUserId: params.clerkUserId,
      providerMessageId: emailResult.messageId,
    })) {
      console.warn("Assessment saved email delivery was already recorded.");
    }
  } catch {
    console.warn("Assessment saved email delivery could not be recorded.");
  }
}

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
          properties: { hasReferral: Boolean(body.referralCode) },
        });
        
        const assessmentId = result.assessmentId || result.assessment?.id;
        if (assessmentId) {
          await sendFirstSaveEmail({
            assessmentId,
            clerkUserId: userId,
            userEmail,
            founderName: userName || "Founder",
            startupName: result.assessment?.startup_name || "Your startup",
            readinessScore: result.assessment?.readiness_score || 0,
            verdict: result.assessment?.verdict || "Funding Readiness Assessment Saved",
            workspaceUrl: `${baseUrl}/app/preview?claim_token=${claimToken}`,
          });
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
      const report = session.report;
      if (!report) {
        return NextResponse.json({ ok: false, error: "Missing assessment report." }, { status: 400 });
      }
      const effectiveToken = claimToken || session.claimToken || `claim-${userId}-${Date.now()}`;
      const saved = await saveAssessmentToDatabase({
        claimToken: effectiveToken,
        clerkUserId: userId,
        founderName: session.input.founderName || userName || "Founder",
        startupName: session.input.startupName || "Your startup",
        websiteUrl: session.input.websiteUrl || null,
        report,
        rawSession: session,
      });
      if (body.referralCode || effectiveToken) {
        await recordReferralSignup({ referralCode: body.referralCode, clerkUserId: userId, claimToken: effectiveToken });
      }
      await logAnalyticsEvent({
        eventName: "assessment_saved",
        clerkUserId: userId,
        properties: { hasReferral: Boolean(body.referralCode) },
      });
      
      if (saved.report && saved.id) {
        await sendFirstSaveEmail({
          assessmentId: saved.id,
          clerkUserId: userId,
          userEmail,
          founderName: session.input.founderName || userName || "Founder",
          startupName: session.input.startupName || "Your startup",
          readinessScore: report.readinessScore,
          verdict: report.verdict,
          workspaceUrl: `${baseUrl}/app/preview?claim_token=${effectiveToken}`,
        });
      }
      return NextResponse.json({ ok: true, success: true, assessmentId: saved.id });
    }

    return NextResponse.json({ ok: false, error: "Missing claimToken or session data." }, { status: 400 });
  } catch (err: any) {
    console.error("Error in /api/assessment/save:", err);
    return NextResponse.json({ ok: false, error: err?.message || "Failed to save assessment." }, { status: 500 });
  }
}
