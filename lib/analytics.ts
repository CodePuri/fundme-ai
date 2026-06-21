/**
 * Analytics Shell 
 * Status: Pending external provider selection (e.g. PostHog, Mixpanel).
 */

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Analytics Track] ${eventName}`, properties);
  }
  // TODO: Add implementation once provider is selected
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Analytics Identify] User: ${userId}`, properties);
  }
  // TODO: Add implementation once provider is selected
}
