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

export function getSafeRedirect(url: string | null | undefined, fallback = "/"): string {
  if (!url) return fallback;
  try {
    // Only allow absolute paths that don't start with //
    if (url.startsWith("/") && !url.startsWith("//")) {
      return url;
    }
    return fallback;
  } catch {
    return fallback;
  }
}
