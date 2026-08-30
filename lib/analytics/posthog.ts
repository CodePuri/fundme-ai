import posthog from "posthog-js";
import { sanitizeAnalyticsProperties, type AnalyticsEventName } from "./events";

export function initPostHog() {
  if (typeof window === "undefined") return;

  const key =
    process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!key) {
    return;
  }

  try {
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "*",
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
      },
    });
  } catch (err) {
    console.warn("PostHog initialization error:", err);
  }
}

export function trackPostHogEvent(
  eventName: AnalyticsEventName,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  const sanitized = properties ? sanitizeAnalyticsProperties(properties) : {};

  try {
    if (posthog.__loaded) {
      posthog.capture(eventName, sanitized);
    }
  } catch (err) {
    console.warn("PostHog track error:", err);
  }
}

export function identifyPostHogUser(clerkUserId: string, traits?: Record<string, unknown>) {
  if (typeof window === "undefined" || !clerkUserId) return;

  try {
    if (posthog.__loaded) {
      posthog.identify(clerkUserId, traits ? sanitizeAnalyticsProperties(traits) : undefined);
    }
  } catch (err) {
    console.warn("PostHog identify error:", err);
  }
}

export function resetPostHogUser() {
  if (typeof window === "undefined") return;

  try {
    if (posthog.__loaded) {
      posthog.reset();
    }
  } catch (err) {
    console.warn("PostHog reset error:", err);
  }
}
