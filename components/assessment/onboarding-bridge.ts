"use client";

import { ASSESSMENT_STORAGE_KEY } from "@/components/assessment/assessment-provider";

const ONBOARDING_DRAFT_KEY = "onboardingDraft";

/**
 * Map onboarding draft data into assessment state.
 * Reads from localStorage "onboardingDraft", transforms, and writes
 * to the assessment storage so /assessment pages pick it up.
 */
export function mapOnboardingToAssessment(): void {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return;

    const draft = JSON.parse(raw);
    if (!draft) return;

    // Read existing assessment state (if any)
    let assessmentState = {
      websiteUrl: "",
      startupName: "",
      linkedInUrl: "",
      uploadedFiles: [],
      answers: [],
      analysisStatus: "idle" as const,
      creditsRemaining: 10,
      hasPaid: false,
      reportGenerated: false,
      report: null as unknown,
    };

    try {
      const existing = window.localStorage.getItem(ASSESSMENT_STORAGE_KEY);
      if (existing) {
        assessmentState = { ...assessmentState, ...JSON.parse(existing) };
      }
    } catch {
      // start fresh
    }

    // Map onboarding fields -> assessment fields
    const merged = {
      ...assessmentState,
      startupName: draft.companyName || assessmentState.startupName || "",
      linkedInUrl: draft.linkedIn || assessmentState.linkedInUrl || "",
      websiteUrl: draft.websiteUrl || assessmentState.websiteUrl || "",
    };

    // Persist
    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Silently fail -- assessment page will still work with defaults
  }
}
