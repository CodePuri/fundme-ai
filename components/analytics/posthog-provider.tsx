"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { initPostHog, identifyPostHogUser, resetPostHogUser } from "@/lib/analytics/posthog";

function ClerkPostHogSync() {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user?.id) {
      identifyPostHogUser(user.id, {
        email: undefined, // Strictly never send raw email to event properties
        created_at: user.createdAt,
      });
    } else if (!isSignedIn) {
      resetPostHogUser();
    }
  }, [isLoaded, isSignedIn, user?.id, user?.createdAt]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <>
      {clerkConfigured ? <ClerkPostHogSync /> : null}
      {children}
    </>
  );
}
