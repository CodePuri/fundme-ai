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

export function getSafeRedirect(url: string | undefined | null, fallback: string): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  // Ensure the URL is relative and not a protocol-relative URL (e.g. //malicious.com)
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  return fallback;
}
