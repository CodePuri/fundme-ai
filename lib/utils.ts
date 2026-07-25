import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * 🛡️ Security: Prevents Open Redirect vulnerabilities.
 * Ensures the provided URL is a relative path starting with a single '/'
 * and not a protocol-relative URL starting with '//' or an absolute URL.
 * If invalid, it falls back to the provided default path.
 */
export function getSafeRedirect(url: string | null | undefined, fallback: string = "/"): string {
  if (!url || typeof url !== "string") return fallback;
  // A safe redirect must start with a single '/' but not double '//' (protocol-relative)
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }
  return fallback;
}
