/* ─── Rate Limit Foundation ──
 *
 * Pure helper functions for assessment rate limiting.
 *
 * IMPORTANT: This module provides types and utilities only.
 * FINAL ENFORCEMENT happens server-side inside API routes
 * (e.g., app/api/assessment/analyze/route.ts).
 *
 * localStorage-based enforcement is NOT implemented because
 * it can be trivially bypassed. Only server-side enforcement
 * is meaningful for rate limiting.
 */

/* ─── Types ── */

export type RateLimitDecision =
  | { allowed: true; remaining: number }
  | { allowed: false; reason: "daily_limit_reached"; limit: number; resetAt: string };

export type UserType = "anonymous" | "signed_in";

/* ─── Daily limits per user type ── */

export const DAILY_LIMITS: Record<UserType, number> = {
  anonymous: 2,
  signed_in: 5,
};

export function getDailyLimitForUserType(userType: UserType): number {
  return DAILY_LIMITS[userType];
}

/* ─── Rate limit key builder ──
 *
 * Builds a deterministic key for rate limit tracking.
 * This will be used server-side to query/upsert
 * the assessment_rate_limits table.
 */

export function buildRateLimitKey(options: {
  clerkUserId?: string | null;
  anonymousId?: string | null;
  ipHash?: string | null;
  dateKey: string;
}): string {
  const { clerkUserId, anonymousId, ipHash, dateKey } = options;
  return [dateKey, clerkUserId || "", anonymousId || "", ipHash || ""]
    .filter(Boolean)
    .join(":");
}

/* ─── Date key normalization ──
 *
 * Returns "YYYY-MM-DD" for a given Date or ISO string.
 * All rate limit keys use UTC dates.
 */

export function normalizeDateKey(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().slice(0, 10);
}

/* ─── IP hash placeholder ──
 *
 * Server-side IP hashing is the responsibility of the
 * API route handler. This documents the expected pattern.
 *
 * Implementation notes for API routes:
 *
 *   import { sha256 } from "crypto"; // or similar
 *   const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
 *             ?? req.headers.get("x-real-ip")
 *             ?? "unknown";
 *   const ipHash = createHash("sha256").update(ip + IP_SALT).digest("hex");
 *
 * IP_SALT should be an env var to prevent pre-computation.
 *
 * For now, this function returns a placeholder that documents
 * the intent. Replace with real hashing when server routes are built.
 */

export function hashIpPlaceholder(ip: string): string {
  // TODO: Replace with real hashing when API routes are built.
  // Example:
  //   const { createHash } = await import("node:crypto");
  //   return createHash("sha256").update(ip + process.env.IP_HASH_SALT).digest("hex");
  return `ip_placeholder_${ip}`;
}
