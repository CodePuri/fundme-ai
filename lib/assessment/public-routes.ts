export const CLERK_PUBLIC_ROUTE_PATTERNS = [
  "/",
  "/sign-in",
  "/sign-in/(.*)",
  "/sign-up",
  "/sign-up/(.*)",
  "/login",
  "/login/(.*)",
  "/startup-programs",
  "/startup-programs/(.*)",
  "/search",
  "/search/(.*)",
  "/onboarding",
  "/onboarding/(.*)",
  "/account-save",
  "/account-save/(.*)",
  "/thank-you",
  "/thank-you/(.*)",
  "/explore",
  "/explore/(.*)",
  "/assessment",
  "/assessment/(.*)",
  "/api/onboarding",
  "/api/onboarding/(.*)",
  "/robots.txt",
  "/sitemap.xml",
];

export function isClerkIndependentPublicPath(pathname: string): boolean {
  return pathname === "/"
    || pathname === "/assessment"
    || pathname.startsWith("/assessment/")
    || pathname === "/search"
    || pathname.startsWith("/search/")
    || pathname === "/explore"
    || pathname.startsWith("/explore/");
}
