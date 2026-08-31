"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { loadSession } from "@/lib/assessment/persistence";
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
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  // 1. Clerk authentication state
  let clerkLoaded = true;
  let isSignedIn = false;
  let user: any = null;
  let clerkSignOut: any = async () => {};

  try {
    const clerkUser = useUser();
    const clerk = useClerk();
    clerkLoaded = clerkUser.isLoaded;
    isSignedIn = Boolean(clerkUser.isSignedIn);
    user = clerkUser.user ?? null;
    clerkSignOut = clerk.signOut;
  } catch {
    // Standalone / test fallback when ClerkProvider is absent
    clerkLoaded = true;
    isSignedIn = false;
  }

  // 2. Local browser session state
  const [localSession, setLocalSession] = useState<GrillSession | null>(null);
  const [localHydrated, setLocalHydrated] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const session = loadSession(window.localStorage);
        setLocalSession(session);
      }
    } catch {
      // Storage unavailable
    } finally {
      setLocalHydrated(true);
    }
  }, []);

  // 3. Server saved assessment state for signed-in user
  const [serverData, setServerData] = useState<{
    hasAssessment: boolean;
    assessment: any | null;
    startup: any | null;
    founder: any | null;
    loaded: boolean;
  }>({
    hasAssessment: false,
    assessment: null,
    startup: null,
    founder: null,
    loaded: false,
  });

  const fetchSavedAssessment = useCallback(async () => {
    if (!isSignedIn) {
      setServerData({
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
          setServerData({
            hasAssessment: true,
            assessment: data.assessment,
            startup: data.startup,
            founder: data.founder,
            loaded: true,
          });
          return;
        }
      }
      setServerData({
        hasAssessment: false,
        assessment: null,
        startup: null,
        founder: null,
        loaded: true,
      });
    } catch {
      setServerData({
        hasAssessment: false,
        assessment: null,
        startup: null,
        founder: null,
        loaded: true,
      });
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (clerkLoaded) {
      fetchSavedAssessment();
    }
  }, [clerkLoaded, isSignedIn, fetchSavedAssessment]);

  // Derive high-level product state
  const isLoaded = clerkLoaded && localHydrated && (!isSignedIn || serverData.loaded);

  const hasLocalResult = Boolean(localSession?.report && localSession?.processingState === "complete");
  const hasLocalProgress = Boolean(
    !hasLocalResult &&
      localSession &&
      (localSession.input?.startupName?.trim() ||
        localSession.input?.websiteUrl?.trim() ||
        localSession.input?.founderName?.trim())
  );

  const hasSavedAssessment = serverData.hasAssessment;
  const savedAssessment = serverData.assessment;
  const savedStartupName =
    serverData.startup?.startup_name || serverData.assessment?.startup_name || null;

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
