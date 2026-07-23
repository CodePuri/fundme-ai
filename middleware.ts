import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";

import {
  CLERK_PUBLIC_ROUTE_PATTERNS,
  isClerkIndependentPublicPath,
} from "@/lib/assessment/public-routes";

const isPublicRoute = createRouteMatcher(CLERK_PUBLIC_ROUTE_PATTERNS);

const clerkRoutes = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (isClerkIndependentPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return clerkRoutes(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
