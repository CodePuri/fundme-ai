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

export function getSafeRedirect(url: string | null | undefined, fallback: string) {
  // Security: Prevent Open Redirect vulnerabilities by ensuring the redirect URL
  // is a safe relative path starting with '/' but not '//' (protocol-relative URL).
  if (!url || typeof url !== "string") return fallback;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return fallback;
}
