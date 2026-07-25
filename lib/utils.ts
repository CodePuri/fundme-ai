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

// Security Enhancement: Sanitize redirect URLs to prevent Open Redirect vulnerabilities.
// Ensures the redirect is a relative path starting with '/' and not '//'.
export function getSafeRedirect(url: string | string[] | null | undefined): string {
  if (!url || typeof url !== "string") return "/onboarding";
  if (url.startsWith("/")) {
    if (url.startsWith("//")) {
      return "/onboarding"; // Prevent protocol-relative URLs
    }
    return url;
  }
  return "/onboarding"; // Fallback to safe default
}
