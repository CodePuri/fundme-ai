"use client";

import type { AnalyticsEventName } from "./events";
import { trackPostHogEvent } from "./posthog";
import { trackGA4Event } from "./ga4";

export function trackClientEvent(
  eventName: AnalyticsEventName,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === "undefined") return;

  try {
    // 1. PostHog Event Tracking (Product Analytics)
    trackPostHogEvent(eventName, properties);

    // 2. Google Analytics 4 (Acquisition / Conversion Events)
    if (["assessment_completed", "signup_completed", "assessment_shared"].includes(eventName)) {
      trackGA4Event(eventName, properties);
    }

    // 3. Internal Audit Stream
    const sessionId = window.sessionStorage.getItem("fundme-session-id") || undefined;
    const body = JSON.stringify({
      eventName,
      sessionId,
      properties,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/event", body);
    } else {
      fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Analytics failures must never interrupt user flow
  }
}
