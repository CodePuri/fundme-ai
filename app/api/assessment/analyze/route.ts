import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limit";
import { recordReferralAssessmentCompleted } from "@/lib/analytics/referrals";
import { logAnalyticsEvent } from "@/lib/analytics/events";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ingestWebsite } from "@/lib/ingestion/website";
import { parsePdfBuffer } from "@/lib/ingestion/pdf";
import { ingestFounderProfile } from "@/lib/ingestion/founder";
import { buildStructuredEvidence } from "@/lib/assessment/evidence-model";
import { assessSession } from "@/lib/assessment/engine";
import { synthesizeAssessmentWithAi } from "@/lib/assessment/ai-provider";
import { saveAssessmentToDatabase } from "@/lib/assessment/database";
import type { ArtifactMetadata, GrillSession, MentorAnswer, MentorQuestionId } from "@/lib/assessment/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  const rate = checkRateLimit(req, "analyze", { maxRequests: 15, windowMs: 60_000 });
  if (!rate.allowed) {
    return createRateLimitResponse(rate.resetInMs);
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let founderName = "";
    let founderRole = "";
    let startupName = "";
    let websiteUrl = "";
    let linkedInUrl = "";
    let description = "";
    let profileText = "";
    let referralCode = "";
    let answers: Partial<Record<MentorQuestionId, MentorAnswer>> = {};
    let pitchDeckBuffer: Buffer | null = null;
    let pitchDeckName = "";
    let pitchDeckSize = 0;
    let founderProfileBuffer: Buffer | null = null;
    let founderProfileName = "";
    let founderProfileSize = 0;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      founderName = String(formData.get("founderName") || "").trim();
      founderRole = String(formData.get("founderRole") || "").trim();
      startupName = String(formData.get("startupName") || "").trim();
      websiteUrl = String(formData.get("websiteUrl") || "").trim();
      linkedInUrl = String(formData.get("linkedInUrl") || "").trim();
      description = String(formData.get("description") || "").trim();
      profileText = String(formData.get("profileText") || "").trim();
      referralCode = String(formData.get("referralCode") || "").trim();

      const rawAnswers = formData.get("answers");
      if (rawAnswers && typeof rawAnswers === "string") {
        try { answers = JSON.parse(rawAnswers); } catch {}
      }

      const pitchDeckFile = formData.get("pitchDeck") as File | null;
      if (pitchDeckFile && pitchDeckFile.size > 0) {
        pitchDeckName = pitchDeckFile.name;
        pitchDeckSize = pitchDeckFile.size;
        pitchDeckBuffer = Buffer.from(await pitchDeckFile.arrayBuffer());
      }

      const profileFile = formData.get("founderProfile") as File | null;
      if (profileFile && profileFile.size > 0) {
        founderProfileName = profileFile.name;
        founderProfileSize = profileFile.size;
        founderProfileBuffer = Buffer.from(await profileFile.arrayBuffer());
      }
    } else {
      const json = await req.json();
      founderName = String(json.founderName || "").trim();
      founderRole = String(json.founderRole || "").trim();
      startupName = String(json.startupName || "").trim();
      websiteUrl = String(json.websiteUrl || "").trim();
      linkedInUrl = String(json.linkedInUrl || "").trim();
      description = String(json.description || "").trim();
      profileText = String(json.profileText || "").trim();
      answers = json.answers || {};
    }

    if (!founderName) {
      return NextResponse.json({ ok: false, error: "Founder name is required." }, { status: 400 });
    }

    // 1. Real Ingestion: Parse pitch deck if uploaded
    let parsedDeck = null;
    if (pitchDeckBuffer && pitchDeckBuffer.length > 0) {
      parsedDeck = await parsePdfBuffer(pitchDeckBuffer, pitchDeckName || "pitch-deck.pdf");
    }

    // 2. Real Ingestion: Parse founder profile / resume if uploaded
    let parsedResume = null;
    if (founderProfileBuffer && founderProfileBuffer.length > 0) {
      parsedResume = await parsePdfBuffer(founderProfileBuffer, founderProfileName || "founder-profile.pdf");
    }

    // 3. Real Ingestion: Fetch website if provided
    let ingestedWeb = null;
    if (websiteUrl) {
      ingestedWeb = await ingestWebsite(websiteUrl);
    }

    // 4. Ingest founder profile metadata
    const founderInfo = ingestFounderProfile(
      founderName,
      founderRole,
      profileText,
      linkedInUrl,
      parsedResume?.extractedText,
      parsedResume?.filename
    );

    // Build artifacts array
    const timestamp = new Date().toISOString();
    const artifacts: ArtifactMetadata[] = [];
    if (pitchDeckName) {
      artifacts.push({
        id: `pitch-deck-${Date.now()}`,
        kind: "pitch-deck",
        name: pitchDeckName,
        size: pitchDeckSize,
        type: "application/pdf",
        status: "attached",
        attachedAt: timestamp,
        extractedText: parsedDeck?.extractedText,
        pageCount: parsedDeck?.pageCount,
        detectedSections: parsedDeck?.detectedSections,
      });
    }
    if (founderProfileName) {
      artifacts.push({
        id: `founder-profile-${Date.now()}`,
        kind: "founder-profile",
        name: founderProfileName,
        size: founderProfileSize,
        type: "application/pdf",
        status: "attached",
        attachedAt: timestamp,
        extractedText: parsedResume?.extractedText,
        pageCount: parsedResume?.pageCount,
        detectedSections: parsedResume?.detectedSections,
      });
    }

    // 5. Build structured evidence record
    const evidenceRecord = buildStructuredEvidence({
      input: {
        founderName,
        founderRole,
        startupName,
        websiteUrl,
        linkedInUrl,
        description,
        profileText,
        websiteTitle: ingestedWeb?.title || undefined,
        websiteDescription: ingestedWeb?.description || undefined,
        extractedWebsiteText: ingestedWeb?.cleanText || undefined,
        productSignals: ingestedWeb?.productSignals || undefined,
      },
      artifacts,
      website: ingestedWeb,
      deckPdf: parsedDeck,
      resumePdf: parsedResume,
      founderProfile: founderInfo,
      answers,
    });

    // 6. Build grill session and assess
    const session: GrillSession = {
      version: 1,
      mode: "demo",
      stage: "result",
      processingState: "assessing",
      input: {
        founderName,
        founderRole,
        startupName: evidenceRecord.startup.name,
        websiteUrl,
        linkedInUrl,
        description,
        profileText,
        websiteTitle: ingestedWeb?.title || undefined,
        websiteDescription: ingestedWeb?.description || undefined,
        extractedWebsiteText: ingestedWeb?.cleanText || undefined,
        productSignals: ingestedWeb?.productSignals || undefined,
      },
      artifacts,
      conversation: [],
      answers,
      skippedQuestionIds: [],
      reviewedAt: timestamp,
      report: null,
      earlyAccess: { email: "", status: "idle", referralCode: null },
      persistenceWarning: null,
      updatedAt: timestamp,
    };

    const deterministicReport = assessSession(session, timestamp);
    const { report, aiMetadata } = await synthesizeAssessmentWithAi(evidenceRecord, deterministicReport);
    session.report = report;
    session.processingState = report.completionState;

    // 7. Generate claim token and save pending assessment to Supabase
    const claimToken = randomUUID();
    session.claimToken = claimToken;

    try {
      await saveAssessmentToDatabase({
        claimToken,
        founderName,
        startupName: evidenceRecord.startup.name,
        websiteUrl,
        report,
        rawSession: session,
      });
    } catch (dbErr) {
      console.warn("Could not save pending assessment to database:", dbErr);
    }

    if (referralCode) {
        await recordReferralAssessmentCompleted({ referralCode, claimToken });
      }
      await logAnalyticsEvent({
        eventName: "assessment_completed",
        properties: { referralCode: referralCode || null, readinessScore: report.readinessScore },
      });

      return NextResponse.json({
        ok: true,
        claimToken,
      report,
      aiMetadata,
      evidenceRecord,
      session,
    });
  } catch (err: any) {
    console.error("Error in /api/assessment/analyze:", err);
    return NextResponse.json({ ok: false, error: err?.message || "Analysis failed." }, { status: 500 });
  }
}
