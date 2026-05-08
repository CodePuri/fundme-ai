import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Security Fix: Next.js middleware MUST be named middleware.ts (or .js) at the root.
// Previously this file was misnamed proxy.ts, causing the authentication middleware
// to be silently ignored and resulting in an authentication bypass vulnerability.
// Renaming it to middleware.ts ensures the protections are correctly enforced.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/explore(.*)",
  "/startup-programs(.*)",
  "/search(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
