"use client";

import { createInitialSession, GRILL_STORAGE_KEY } from "../../lib/assessment/persistence.ts";
import type { GrillSession } from "../../lib/assessment/types.ts";

const ONBOARDING_DRAFT_KEY = "onboardingDraft";

type OnboardingDraft = {
  name?: string;
  role?: string;
  companyName?: string;
  linkedIn?: string;
  websiteUrl?: string;
  notes?: string;
  files?: string[];
};

export function mapOnboardingDraftToSession(draft: OnboardingDraft, timestamp = new Date().toISOString()): GrillSession {
  const session = createInitialSession(timestamp);
  session.input.startupName = draft.companyName?.slice(0, 160) ?? "";
  session.input.websiteUrl = draft.websiteUrl?.slice(0, 2_048) ?? "";
  session.input.founderName = draft.name?.slice(0, 120) ?? "";
  session.input.founderRole = draft.role?.slice(0, 120) ?? "";
  session.input.description = draft.notes?.slice(0, 280) ?? "";
  session.input.profileText = draft.linkedIn ? `Founder-supplied profile link: ${draft.linkedIn}`.slice(0, 20_000) : "";
  session.artifacts = (draft.files ?? []).slice(0, 10).map((name, index) => ({
    id: `onboarding-file-${index}`,
    kind: "notes",
    name: name.slice(0, 255),
    size: 0,
    type: "",
    status: "attached",
    attachedAt: timestamp,
  }));
  return session;
}

/** Compatibility bridge for an existing onboarding draft. No service or database write occurs. */
export function mapOnboardingToAssessment(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return false;
    const session = mapOnboardingDraftToSession(JSON.parse(raw) as OnboardingDraft);
    window.localStorage.setItem(GRILL_STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}
