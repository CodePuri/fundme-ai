"use client";

import { assessmentStorageForViewer, browserKeyForViewer, createInitialSession, loadSession, saveSession } from "../../lib/assessment/persistence.ts";
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
export function mapOnboardingToAssessment(userId: string | null = null): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(browserKeyForViewer(ONBOARDING_DRAFT_KEY, userId));
    if (!raw) return false;
    const session = mapOnboardingDraftToSession(JSON.parse(raw) as OnboardingDraft);
    const storage = assessmentStorageForViewer(window.localStorage, userId);
    const existing = loadSession(storage);
    if (existing.report || existing.stage !== "intake" || existing.artifacts.length
      || Object.values(existing.input).some((value) => typeof value === "string" && Boolean(value.trim()))) return false;
    return saveSession(storage, session).ok;
  } catch {
    return false;
  }
}
