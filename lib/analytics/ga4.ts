export function trackGA4Event(
  eventName: string,
  eventParams?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !(window as any).gtag) return;

  try {
    (window as any).gtag("event", eventName, eventParams);
  } catch (err) {
    console.warn("GA4 event track error:", err);
  }
}
