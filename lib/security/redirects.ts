export function sanitizeInternalRedirect(
  value: string | string[] | undefined,
  fallback: `/${string}`,
) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return fallback;
  }
  try {
    const parsed = new URL(value, "https://fundme.invalid");
    if (parsed.origin !== "https://fundme.invalid") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
