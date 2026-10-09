"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { assessmentStorageForViewer, loadSession } from "@/lib/assessment/persistence";
import type { GrillSession } from "@/lib/assessment/types";

export type ProductAuthState =
  | "anonymous_clean"
  | "anonymous_in_progress"
  | "anonymous_with_result"
  | "authenticated_no_assessment"
  | "authenticated_with_saved"
  | "authenticated_fresh_result";

export type ProductAuthContext = {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: any | null;
  signOut: () => Promise<void>;
  hasSavedAssessment: boolean;
  savedAssessment: any | null;
  savedStartupName: string | null;
  hasLocalResult: boolean;
  hasLocalProgress: boolean;
  localSession: GrillSession | null;
  state: ProductAuthState;
  primaryCta: {
    label: string;
    href: string;
    subtext: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  } | null;
  refetchSaved: () => Promise<void>;
};

export function useProductAuthState(): ProductAuthContext {
  // 1. Clerk authentication state
  const clerkUser = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const clerkLoaded = clerkUser.isLoaded;
  const isSignedIn = Boolean(clerkUser.isSignedIn);
  const user = clerkUser.user ?? null;

  // 2. Local browser session state
  const identityKey = clerkLoaded ? (user?.id ?? "anonymous") : null;
  const [localRecord, setLocalRecord] = useState<{ identityKey: string; session: GrillSession | null } | null>(null);
  const localSession = localRecord?.identityKey === identityKey ? localRecord.session : null;
  const localHydrated = identityKey !== null && localRecord?.identityKey === identityKey;

  useEffect(() => {
    if (!clerkLoaded) return;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const session = loadSession(assessmentStorageForViewer(window.localStorage, user?.id ?? null));
        setLocalRecord({ identityKey: identityKey!, session });
      }
    } catch {
      // Storage unavailable
    } finally {
      if (identityKey) setLocalRecord((current) => current?.identityKey === identityKey ? current : { identityKey, session: null });
    }
  }, [clerkLoaded, identityKey, user?.id]);

  // 3. Server saved assessment state for signed-in user
  const [serverData, setServerData] = useState<{
    ownerId: string | null;
    hasAssessment: boolean;
    assessment: any | null;
    startup: any | null;
    founder: any | null;
    loaded: boolean;
  }>({
    ownerId: null,
    hasAssessment: false,
    assessment: null,
    startup: null,
    founder: null,
    loaded: false,
  });
  const serverRequestRef = useRef(0);
  const activeServerData = serverData.ownerId === user?.id ? serverData : null;

  const fetchSavedAssessment = useCallback(async () => {
    const requestId = ++serverRequestRef.current;
    const ownerId = user?.id ?? null;
    const commit = (record: typeof serverData) => {
      if (serverRequestRef.current === requestId) setServerData(record);
    };
    if (!isSignedIn) {
      commit({
        ownerId: null,
        hasAssessment: false,
        assessment: null,
        startup: null,
        founder: null,
        loaded: true,
      });
      return;
    }

    try {
      const res = await fetch("/api/assessment/latest", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.hasAssessment) {
          commit({
            ownerId,
            hasAssessment: true,
            assessment: data.assessment,
            startup: data.startup,
            founder: data.founder,
            loaded: true,
          });
          return;
        }
      }
      commit({
        ownerId,
        hasAssessment: false,
        assessment: null,
        startup: null,
        founder: null,
        loaded: true,
      });
    } catch {
      commit({
        ownerId,
        hasAssessment: false,
        assessment: null,
        startup: null,
        founder: null,
        loaded: true,
      });
    }
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (clerkLoaded) {
      fetchSavedAssessment();
    }
  }, [clerkLoaded, isSignedIn, fetchSavedAssessment]);

  // Derive high-level product state
  const isLoaded = clerkLoaded && localHydrated && (!isSignedIn || Boolean(activeServerData?.loaded));

  const hasLocalResult = Boolean(localSession?.report && localSession?.processingState === "complete");
  const hasLocalProgress = Boolean(
    !hasLocalResult &&
      localSession &&
      (localSession.input?.startupName?.trim() ||
        localSession.input?.websiteUrl?.trim() ||
        localSession.input?.founderName?.trim())
  );

  const hasSavedAssessment = Boolean(activeServerData?.hasAssessment);
  const savedAssessment = activeServerData?.assessment ?? null;
  const savedStartupName =
    activeServerData?.startup?.startup_name || activeServerData?.assessment?.startup_name || null;

  const productState: ProductAuthState = useMemo(() => {
    if (isSignedIn) {
      if (hasSavedAssessment) {
        return "authenticated_with_saved";
      }
      if (hasLocalResult) {
        return "authenticated_fresh_result";
      }
      return "authenticated_no_assessment";
    }

    if (hasLocalResult) {
      return "anonymous_with_result";
    }
    if (hasLocalProgress) {
      return "anonymous_in_progress";
    }
    return "anonymous_clean";
  }, [isSignedIn, hasSavedAssessment, hasLocalResult, hasLocalProgress]);

  const primaryCta = useMemo(() => {
    switch (productState) {
      case "authenticated_with_saved":
        return {
          label: "Open my assessment",
          href: "/app/preview",
          subtext: savedStartupName
            ? `Assessment saved for ${savedStartupName}.`
            : "Your funding readiness assessment is saved.",
        };
      case "authenticated_fresh_result":
        return {
          label: "View my readiness result",
          href: "/assessment/result",
          subtext: "Your readiness score and evidence report are ready to save.",
        };
      case "authenticated_no_assessment":
        return {
          label: "Start funding assessment",
          href: "/assessment",
          subtext: "Scan your startup against real accelerator criteria.",
        };
      case "anonymous_with_result":
        return {
          label: "View my readiness result",
          href: "/assessment/result",
          subtext: "Resume your generated assessment.",
        };
      case "anonymous_in_progress":
        return {
          label: "Continue assessment",
          href: "/assessment",
          subtext: "Resume your intake context.",
        };
      case "anonymous_clean":
      default:
        return {
          label: "Get Started Free",
          href: "/assessment",
          subtext: "Free assessment. No credit card required.",
        };
    }
  }, [productState, savedStartupName]);

  const secondaryCta = useMemo(() => {
    if (productState === "authenticated_with_saved") {
      return {
        label: "Assess another startup",
        href: "/assessment",
      };
    }
    return null;
  }, [productState]);

  const signOut = useCallback(async () => {
    try {
      await clerkSignOut({ redirectUrl: "/" });
    } catch {
      window.location.assign("/");
    }
  }, [clerkSignOut]);

  return {
    isLoaded,
    isSignedIn,
    user,
    signOut,
    hasSavedAssessment,
    savedAssessment,
    savedStartupName,
    hasLocalResult,
    hasLocalProgress,
    localSession,
    state: productState,
    primaryCta,
    secondaryCta,
    refetchSaved: fetchSavedAssessment,
  };
}
