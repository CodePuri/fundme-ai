import { getSupabaseAdmin } from "../assessment/database.ts";

export type FunnelEventName =
  | "assessment_started"
  | "assessment_completed"
  | "assessment_saved"
  | "assessment_shared"
  | "shared_assessment_viewed"
  | "referral_attributed"
  | "signup_started"
  | "signup_completed"
  | "personalized_explore_viewed";

export type AnalyticsPayload = {
  eventName: FunnelEventName;
  sessionId?: string;
  clerkUserId?: string;
  properties?: Record<string, string | number | boolean | null | undefined>;
};

// Strict sanitizer ensuring no private text, tokens, or PII enter analytics
export function sanitizeAnalyticsProperties(
  properties?: Record<string, unknown>
): Record<string, string | number | boolean | null> {
  if (!properties) return {};
  const sanitized: Record<string, string | number | boolean | null> = {};

  const BLOCKED_KEYS = new Set([
    "email",
    "token",
    "claim_token",
    "claimtoken",
    "raw_session",
    "rawsession",
    "transcript",
    "deck_text",
    "decktext",
    "password",
    "secret",
  ]);

  for (const [key, value] of Object.entries(properties)) {
    const lowerKey = key.toLowerCase();
    if (BLOCKED_KEYS.has(lowerKey)) continue;

    if (typeof value === "string") {
      // Truncate long strings to prevent leaking raw text bodies
      sanitized[key] = value.slice(0, 100);
    } else if (typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      sanitized[key] = null;
    }
  }

  return sanitized;
}

export async function logAnalyticsEvent(payload: AnalyticsPayload): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const cleanProps = sanitizeAnalyticsProperties(payload.properties);

    const { error } = await supabase.from("analytics_events").insert({
      event_name: payload.eventName,
      session_id: payload.sessionId || null,
      clerk_user_id: payload.clerkUserId || null,
      properties: cleanProps,
    });

    if (error) {
      console.warn("Analytics log error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Analytics failure:", err);
    return false;
  }
}
