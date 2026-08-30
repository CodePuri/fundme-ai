"use client";

import type { FunnelEventName } from "./events";

export function trackClientEvent(
  eventName: FunnelEventName,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === "undefined") return;

  try {
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
