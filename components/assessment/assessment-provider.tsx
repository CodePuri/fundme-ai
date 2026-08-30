"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { assessSession } from "@/lib/assessment/engine";
import {
  clearSession,
  createInitialSession,
  GRILL_STORAGE_KEY,
  loadSession,
  persistEarlyAccess,
  saveSession,
  type EarlyAccessPersistenceResult,
} from "@/lib/assessment/persistence";
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
  updateInput: (field: keyof StartupInput, value: string) => void;
  attachFile: (file: File, kind: ArtifactKind) => string | null;
  removeArtifact: (id: string) => void;
  submitIntake: () => IntakeValidation;
  editIntake: () => void;
  confirmReview: () => void;
  submitAnswer: (text: string, source: AnswerSource) => boolean;
  skipQuestion: () => void;
  beginAssessment: () => void;
  generateReport: () => void;
  setEarlyAccessDraft: (email: string) => void;
  submitEarlyAccess: (email: string) => EarlyAccessPersistenceResult;
  restart: () => void;
};

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

function now(): string {
  return new Date().toISOString();
}

function eventId(prefix: string, timestamp: string): string {
  return `${prefix}-${timestamp.replace(/[^0-9]/g, "")}`;
}

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<GrillSession>(() => createInitialSession());
  const [hasHydrated, setHasHydrated] = useState(false);
  const fileMapRef = useRef<Map<string, File>>(new Map());

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        setSession(loadSession(window.localStorage));
      } catch {
        setSession(createInitialSession(undefined, "Browser storage is unavailable. Progress can continue in this tab but cannot be recovered after refresh."));
      }
      setHasHydrated(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    let result: ReturnType<typeof saveSession>;
    try {
      result = saveSession(window.localStorage, session);
    } catch {
      result = { ok: false, error: "Progress could not be saved because browser storage is unavailable." };
    }
    if (!result.ok && session.persistenceWarning !== result.error) {
      const warningTimer = window.setTimeout(() => {
        setSession((current) => ({ ...current, persistenceWarning: result.error }));
      }, 0);
      return () => window.clearTimeout(warningTimer);
    }
  }, [hasHydrated, session]);

  const updateInput = useCallback((field: keyof StartupInput, value: string) => {
    setSession((current) => ({
      ...current,
      input: { ...current.input, [field]: value },
      processingState: "preparing",
      report: null,
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
      updatedAt: now(),
    }));
  }, []);

  const generateReport = useCallback(async () => {
    const timestamp = now();

    // 1. Try real server-side analysis with ingestion & PDF parsing
    if (typeof window !== "undefined" && typeof fetch === "function") {
      try {
        const formData = new FormData();
        formData.append("founderName", session.input.founderName || "");
        formData.append("founderRole", session.input.founderRole || "");
        formData.append("startupName", session.input.startupName || "");
        formData.append("websiteUrl", session.input.websiteUrl || "");
        formData.append("linkedInUrl", session.input.linkedInUrl || "");
        formData.append("description", session.input.description || "");
        formData.append("profileText", session.input.profileText || "");
        const refCode = typeof window !== "undefined" ? (window.sessionStorage.getItem("fundme-referral-code") || window.localStorage.getItem("fundme-referral-code") || "") : "";
        if (refCode) formData.append("referralCode", refCode);
        formData.append("answers", JSON.stringify(session.answers));

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
            if (data.claimToken) {
              try { window.localStorage.setItem("fundme-claim-token", data.claimToken); } catch {}
            }
            setSession((current) => ({
              ...current,
              ...(data.session || {}),
              stage: "result",
              processingState: data.report.completionState,
              report: data.report,
              claimToken: data.claimToken || current.claimToken,
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
    setSession((current) => {
      const report = assessSession(current, timestamp);
      return {
        ...current,
        stage: "result",
        processingState: report.completionState,
        report,
        updatedAt: timestamp,
      };
    });
  }, [session.answers, session.input]);

  const setEarlyAccessDraft = useCallback((email: string) => {
    setSession((current) => ({
      ...current,
      earlyAccess: { email, status: "idle", referralCode: null },
      updatedAt: now(),
    }));
  }, []);

  const submitEarlyAccess = useCallback((email: string): EarlyAccessPersistenceResult => {
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { /* handled by persistEarlyAccess */ }
    const result = persistEarlyAccess(storage, session, email);
    setSession(result.session);
    return result;
  }, [session]);

  const restart = useCallback(() => {
    fileMapRef.current.clear();
    try {
      clearSession(window.localStorage);
      setSession(createInitialSession());
    } catch {
      setSession(createInitialSession(undefined, "Browser storage is unavailable. The in-memory assessment was restarted."));
    }
  }, []);

  const value = useMemo<AssessmentContextValue>(() => ({
    session,
    hasHydrated,
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
  }), [
    session,
    hasHydrated,
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
  ]);

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment(): AssessmentContextValue {
  const context = useContext(AssessmentContext);
  if (!context) throw new Error("useAssessment must be used within AssessmentProvider");
  return context;
}
