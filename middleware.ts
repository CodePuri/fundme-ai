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

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!hasClerkKeys || isClerkIndependentPublicPath(request.nextUrl.pathname) || isPublicRoute(request)) {
    return NextResponse.next();
  }
  return clerkRoutes ? clerkRoutes(request, event) : NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
