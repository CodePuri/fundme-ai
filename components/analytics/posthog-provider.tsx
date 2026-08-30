"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { initPostHog, identifyPostHogUser, resetPostHogUser } from "@/lib/analytics/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    initPostHog();
  }, []);

  // Track user identity changes
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

  return <>{children}</>;
}
