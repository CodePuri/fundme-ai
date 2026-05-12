/* ─── Anonymous Identity ──
 *
 * Provides a stable anonymous_id for pre-auth assessment continuity.
 * Uses crypto.randomUUID() for generation.
 * Stored in localStorage under a fixed key.
 *
 * IMPORTANT: This is for continuity only, NOT for secure entitlement
 * or paid-state logic. Server-side enforcement must ultimately use
 * IP hashing + anonymous_id + Clerk user ID.
 */

const STORAGE_KEY = "fundme-anonymous-id";

/* ─── Get or create anonymous ID ── */

export function getOrCreateAnonymousId(): string {
  const existing = getAnonymousId();
  if (existing) return existing;

  const id = crypto.randomUUID();
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage may be unavailable (private browsing, SSR)
  }
  return id;
}

/* ─── Get existing anonymous ID (without creating) ── */

export function getAnonymousId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/* ─── Clear anonymous ID ── */

export function clearAnonymousId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently ignore
  }
}
