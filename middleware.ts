import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/explore(.*)",
  "/startup-programs(.*)",
  "/search(.*)",
]);

// 🛡️ Sentinel: Enforce Next.js authentication middleware.
// Security Concern: The middleware file was previously named `proxy.ts`, which bypasses
// Next.js middleware execution entirely, leaving all non-public routes unauthenticated.
// Renaming to `middleware.ts` correctly registers it to protect sensitive endpoints.
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
