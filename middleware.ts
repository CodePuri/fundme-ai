import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";

import { isClerkIndependentPublicPath } from "@/lib/grill/public-routes";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/startup-programs(.*)",
  "/search(.*)",
  "/onboarding(.*)",
  "/account-save(.*)",
  "/thank-you(.*)",
  "/explore(.*)",
  "/grill(.*)",
  "/api/grill(.*)",
  "/api/onboarding(.*)",
  "/robots.txt",
  "/sitemap.xml",
]);

const clerkRoutes = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect();
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (isClerkIndependentPublicPath(request.nextUrl.pathname)) return NextResponse.next();
  return clerkRoutes(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
