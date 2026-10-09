"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { assessSession } from "@/lib/assessment/engine";
import {
  assessmentStorageForViewer,
  browserKeyForViewer,
  clearSession,
  createInitialSession,
  GRILL_STORAGE_KEY,
  loadSession,
  persistEarlyAccess,
  saveSession,
  type EarlyAccessPersistenceResult,
} from "@/lib/assessment/persistence";
import { useUser } from "@clerk/nextjs";
import { nextMentorQuestion } from "@/lib/assessment/questions";
import type {
  AnswerSource,
  ArtifactKind,
  GrillSession,
  StartupInput,
} from "@/lib/assessment/types";
import { validateFile, validateIntake, type IntakeValidation } from "@/lib/assessment/validation";

export const ASSESSMENT_STORAGE_KEY = GRILL_STORAGE_KEY;

type AssessmentContextValue = {
  session: GrillSession;
  hasHydrated: boolean;
  viewerId: string | null;
  updateInput: (field: keyof StartupInput, value: string) => void;
  attachFile: (file: File, kind: ArtifactKind) => string | null;
  removeArtifact: (id: string) => void;
  submitIntake: () => IntakeValidation;
  editIntake: () => void;
  confirmReview: () => void;
  submitAnswer: (text: string, source: AnswerSource) => boolean;
  skipQuestion: () => void;
  beginAssessment: () => void;
  generateReport: (ownerId?: string | null) => Promise<void>;
  setEarlyAccessDraft: (email: string) => void;
  submitEarlyAccess: (email: string) => EarlyAccessPersistenceResult;
  restart: () => void;
  finalizeAnonymousSessionSave: (anonymousSession: GrillSession) => boolean;
};

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

function now(): string {
  return new Date().toISOString();
}

function eventId(prefix: string, timestamp: string): string {
  return `${prefix}-${timestamp.replace(/[^0-9]/g, "")}`;
}

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: clerkLoaded, user } = useUser();
  const viewerId = user?.id ?? null;
  const identityKey = clerkLoaded ? (viewerId ?? "anonymous") : null;
  const [session, setSession] = useState<GrillSession>(() => createInitialSession());
  const [loadedIdentityKey, setLoadedIdentityKey] = useState<string | null>(null);
  const hasHydrated = identityKey !== null && loadedIdentityKey === identityKey;
  const blankSession = useMemo(() => createInitialSession(), []);
  const sessionRef = useRef(session);
  const activeIdentityRef = useRef(identityKey);
  const identityEpochRef = useRef(0);
  const fileMapRef = useRef<Map<string, File>>(new Map());

  useLayoutEffect(() => {
    if (activeIdentityRef.current !== identityKey) identityEpochRef.current += 1;
    activeIdentityRef.current = identityKey;
  }, [identityKey]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (identityKey === null) return;
    const hydrationTimer = window.setTimeout(() => {
      fileMapRef.current.clear();
      let loaded: GrillSession;
      try {
        loaded = loadSession(assessmentStorageForViewer(window.localStorage, viewerId));
      } catch {
        loaded = createInitialSession(undefined, "Browser storage is unavailable. Progress can continue in this tab but cannot be recovered after refresh.");
      }
      sessionRef.current = loaded;
      setSession(loaded);
      setLoadedIdentityKey(identityKey);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, [identityKey, viewerId]);

  useEffect(() => {
    if (!hasHydrated) return;
    let result: ReturnType<typeof saveSession>;
    try {
      result = saveSession(assessmentStorageForViewer(window.localStorage, viewerId), session);
    } catch {
      result = { ok: false, error: "Progress could not be saved because browser storage is unavailable." };
    }
    if (!result.ok && session.persistenceWarning !== result.error) {
      const warningTimer = window.setTimeout(() => {
        setSession((current) => ({ ...current, persistenceWarning: result.error }));
      }, 0);
      return () => window.clearTimeout(warningTimer);
    }
  }, [hasHydrated, session, viewerId]);

  const updateInput = useCallback((field: keyof StartupInput, value: string) => {
    setSession((current) => ({
      ...current,
      input: { ...current.input, [field]: value },
      processingState: "preparing",
      report: null,
      reportOwnerId: null,
      claimToken: undefined,
      updatedAt: now(),
    }));
  }, []);

  const attachFile = useCallback((file: File, kind: ArtifactKind): string | null => {
    const validation = validateFile(file, kind);
    if (!validation.valid) return validation.error;
    const timestamp = now();
    fileMapRef.current.set(kind, file);
    setSession((current) => ({
      ...current,
      artifacts: [
        ...current.artifacts.filter((artifact) => artifact.kind !== kind),
        {
          id: eventId(kind, timestamp),
          kind,
          name: file.name,
          size: file.size,
          type: file.type,
          status: "attached",
          attachedAt: timestamp,
        },
      ],
      report: null,
      reportOwnerId: null,
      claimToken: undefined,
      updatedAt: timestamp,
    }));
    return null;
  }, []);

  const removeArtifact = useCallback((id: string) => {
    const artifactToRemove = session.artifacts.find((a) => a.id === id);
    if (artifactToRemove) {
      fileMapRef.current.delete(artifactToRemove.kind);
    }
    setSession((current) => ({
      ...current,
      artifacts: current.artifacts.filter((artifact) => artifact.id !== id),
      report: null,
      reportOwnerId: null,
      claimToken: undefined,
      updatedAt: now(),
    }));
  }, [session.artifacts]);

  const submitIntake = useCallback((): IntakeValidation => {
    const validation = validateIntake(session.input, session.artifacts);
    if (validation.valid) {
      const timestamp = now();
      setSession((current) => ({
        ...current,
        stage: "result",
        processingState: "assessing",
        reviewedAt: timestamp,
        report: null,
        updatedAt: timestamp,
      }));
    } else {
      setSession((current) => ({ ...current, processingState: "validating", updatedAt: now() }));
    }
    return validation;
  }, [session.artifacts, session.input]);

  const editIntake = useCallback(() => {
    setSession((current) => ({ ...current, stage: "intake", processingState: "preparing", updatedAt: now() }));
  }, []);

  const confirmReview = useCallback(() => {
    const timestamp = now();
    setSession((current) => ({
      ...current,
      stage: "mentor",
      processingState: "questioning",
      reviewedAt: timestamp,
      report: null,
      reportOwnerId: null,
      claimToken: undefined,
      updatedAt: timestamp,
    }));
  }, []);

  const submitAnswer = useCallback((text: string, source: AnswerSource): boolean => {
    const trimmed = text.trim();
    const question = nextMentorQuestion(session);
    if (!question || trimmed.length < 2) return false;
    const timestamp = now();
    setSession((current) => {
      const answers = {
        ...current.answers,
        [question.id]: { questionId: question.id, text: trimmed, source, answeredAt: timestamp },
      };
      const resolvedCount = Object.keys(answers).length + current.skippedQuestionIds.length;
      return {
        ...current,
        answers,
        processingState: resolvedCount >= 5 ? "ready" : "questioning",
        conversation: [
          ...current.conversation,
          ...(current.conversation.some((event) => event.questionId === question.id && event.kind === "question") ? [] : [{
            id: eventId(`mentor-${question.id}`, timestamp),
            role: "mentor" as const,
            kind: "question" as const,
            questionId: question.id,
            content: question.prompt,
            createdAt: timestamp,
          }]),
          {
            id: eventId(`founder-${question.id}`, timestamp),
            role: "founder",
            kind: "answer",
            questionId: question.id,
            content: trimmed,
            source,
            createdAt: timestamp,
          },
        ],
        report: null,
        reportOwnerId: null,
        claimToken: undefined,
        updatedAt: timestamp,
      };
    });
    return true;
  }, [session]);

  const skipQuestion = useCallback(() => {
    const question = nextMentorQuestion(session);
    if (!question) return;
    const timestamp = now();
    setSession((current) => {
      const skippedQuestionIds = [...current.skippedQuestionIds, question.id];
      const resolvedCount = Object.keys(current.answers).length + skippedQuestionIds.length;
      return {
        ...current,
        skippedQuestionIds,
        processingState: resolvedCount >= 5 ? "ready" : "questioning",
        conversation: [...current.conversation, {
          id: eventId(`skip-${question.id}`, timestamp),
          role: "system",
          kind: "skip",
          questionId: question.id,
          content: `Skipped: ${question.prompt}`,
          createdAt: timestamp,
        }],
        report: null,
        reportOwnerId: null,
        claimToken: undefined,
        updatedAt: timestamp,
      };
    });
  }, [session]);

  const beginAssessment = useCallback(() => {
    setSession((current) => ({
      ...current,
      stage: "result",
      processingState: "assessing",
      report: null,
      reportOwnerId: null,
      claimToken: undefined,
      updatedAt: now(),
    }));
  }, []);

  const generateReport = useCallback(async (ownerId: string | null = null) => {
    const requestedIdentity = activeIdentityRef.current;
    const requestedEpoch = identityEpochRef.current;
    if (!requestedIdentity) return;
    if ((requestedIdentity === "anonymous" ? null : requestedIdentity) !== ownerId) {
      throw new Error("Account changed before assessment generation. Reload to continue.");
    }
    const timestamp = now();
    const currentSession = sessionRef.current;

    // 1. Try real server-side analysis with ingestion & PDF parsing
    if (typeof window !== "undefined" && typeof fetch === "function") {
      try {
        const formData = new FormData();
        formData.append("founderName", currentSession.input.founderName || "");
        formData.append("founderRole", currentSession.input.founderRole || "");
        formData.append("startupName", currentSession.input.startupName || "");
        formData.append("websiteUrl", currentSession.input.websiteUrl || "");
        formData.append("linkedInUrl", currentSession.input.linkedInUrl || "");
        formData.append("description", currentSession.input.description || "");
        formData.append("profileText", currentSession.input.profileText || "");
        const referralKey = browserKeyForViewer("fundme-referral-code", ownerId);
        const refCode = typeof window !== "undefined" ? (window.sessionStorage.getItem(referralKey) || window.localStorage.getItem(referralKey) || "") : "";
        if (refCode) formData.append("referralCode", refCode);
        formData.append("answers", JSON.stringify(currentSession.answers));

        const deckFile = fileMapRef.current.get("pitch-deck");
        if (deckFile) formData.append("pitchDeck", deckFile);

        const profileFile = fileMapRef.current.get("founder-profile");
        if (profileFile) formData.append("founderProfile", profileFile);

        const res = await fetch("/api/assessment/analyze", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.report) {
            if (activeIdentityRef.current !== requestedIdentity || identityEpochRef.current !== requestedEpoch) return;
            if (data.claimToken) {
              try { window.localStorage.setItem("fundme-claim-token", data.claimToken); } catch {}
            }
            setSession((current) => ({
              ...current,
              ...(data.session || {}),
              stage: "result",
              processingState: data.report.completionState,
              report: data.report,
              reportOwnerId: ownerId,
              claimToken: data.claimToken || undefined,
              updatedAt: timestamp,
            }));
            return;
          }
        }
      } catch (err) {
        console.warn("Server analysis fallback to local assessment engine:", err);
      }
    }

    // 2. Deterministic local engine fallback
    if (activeIdentityRef.current !== requestedIdentity || identityEpochRef.current !== requestedEpoch) return;
    setSession((current) => {
      const report = assessSession(current, timestamp);
      return {
        ...current,
        stage: "result",
        processingState: report.completionState,
        report,
        reportOwnerId: ownerId,
        claimToken: undefined,
        updatedAt: timestamp,
      };
    });
  }, []);

  const setEarlyAccessDraft = useCallback((email: string) => {
    setSession((current) => ({
      ...current,
      earlyAccess: { email, status: "idle", referralCode: null },
      updatedAt: now(),
    }));
  }, []);

  const submitEarlyAccess = useCallback((email: string): EarlyAccessPersistenceResult => {
    let storage: ReturnType<typeof assessmentStorageForViewer> | null = null;
    try { storage = assessmentStorageForViewer(window.localStorage, viewerId); } catch { /* handled by persistEarlyAccess */ }
    const result = persistEarlyAccess(storage, session, email);
    setSession(result.session);
    return result;
  }, [session, viewerId]);

  const restart = useCallback(() => {
    fileMapRef.current.clear();
    try {
      clearSession(assessmentStorageForViewer(window.localStorage, viewerId));
      setSession(createInitialSession());
    } catch {
      setSession(createInitialSession(undefined, "Browser storage is unavailable. The in-memory assessment was restarted."));
    }
  }, [viewerId]);

  const finalizeAnonymousSessionSave = useCallback((anonymousSession: GrillSession): boolean => {
    if (!viewerId || !hasHydrated || activeIdentityRef.current !== viewerId
      || !anonymousSession.report || anonymousSession.reportOwnerId) return false;
    const adopted = { ...anonymousSession, reportOwnerId: viewerId, updatedAt: now() };
    try {
      const storage = window.localStorage;
      if (loadSession(storage).report?.generatedAt !== anonymousSession.report.generatedAt) return false;
      const existing = sessionRef.current;
      const hasExistingDraft = existing.stage !== "intake" || Boolean(existing.report)
        || existing.artifacts.length > 0 || Object.values(existing.answers).length > 0
        || Object.values(existing.input).some((value) => typeof value === "string" && Boolean(value.trim()))
        || Boolean(existing.earlyAccess.email.trim());
      if (hasExistingDraft) {
        // The report is already saved on the server; keep this account's other local draft.
        clearSession(storage);
        return true;
      }
      const saved = saveSession(assessmentStorageForViewer(storage, viewerId), adopted);
      if (!saved.ok) return false;
      clearSession(storage);
      sessionRef.current = adopted;
      setSession(adopted);
      return true;
    } catch {
      return false;
    }
  }, [hasHydrated, viewerId]);

  const value = useMemo<AssessmentContextValue>(() => ({
    session: hasHydrated ? session : blankSession,
    hasHydrated,
    viewerId,
    updateInput,
    attachFile,
    removeArtifact,
    submitIntake,
    editIntake,
    confirmReview,
    submitAnswer,
    skipQuestion,
    beginAssessment,
    generateReport,
    setEarlyAccessDraft,
    submitEarlyAccess,
    restart,
    finalizeAnonymousSessionSave,
  }), [
    session,
    blankSession,
    hasHydrated,
    viewerId,
    updateInput,
    attachFile,
    removeArtifact,
    submitIntake,
    editIntake,
    confirmReview,
    submitAnswer,
    skipQuestion,
    beginAssessment,
    generateReport,
    setEarlyAccessDraft,
    submitEarlyAccess,
    restart,
    finalizeAnonymousSessionSave,
  ]);

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment(): AssessmentContextValue {
  const context = useContext(AssessmentContext);
  if (!context) throw new Error("useAssessment must be used within AssessmentProvider");
  return context;
}
