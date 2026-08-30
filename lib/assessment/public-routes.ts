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
  "/app/preview",
  "/api/onboarding",
  "/api/onboarding/(.*)",
  "/api/assessment/analyze",
  "/api/assessment/analyze/(.*)",
  "/api/assessment/save",
  "/api/assessment/latest",
  "/robots.txt",
  "/sitemap.xml",
];

export function isClerkIndependentPublicPath(pathname: string): boolean {
  const isRouteOrChild = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  return pathname === "/"
    || isRouteOrChild("/assessment")
    || isRouteOrChild("/search")
    || isRouteOrChild("/explore")
    || pathname === "/app/preview";
}
