import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";

import {
  CLERK_PUBLIC_ROUTE_PATTERNS,
  isClerkIndependentPublicPath,
} from "@/lib/assessment/public-routes";

const isPublicRoute = createRouteMatcher(CLERK_PUBLIC_ROUTE_PATTERNS);

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

const clerkRoutes = hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    })
  : null;

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  let response: NextResponse;
  if (hasClerkKeys && clerkRoutes) {
    const clerkRes = await clerkRoutes(request, event);
    response = clerkRes || NextResponse.next();
  } else if (isClerkIndependentPublicPath(request.nextUrl.pathname) || isPublicRoute(request)) {
    response = NextResponse.next();
  } else {
    response = NextResponse.next();
  }

  // SEO Isolation Guard: Staging and Preview domains must NEVER be indexed
  const host = request.headers.get("host") || "";
  const isStagingOrPreview = host.includes("staging.tryfundme.in") || host.includes("vercel.app") || process.env.VERCEL_ENV === "preview";
  if (isStagingOrPreview) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
