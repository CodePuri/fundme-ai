## 2026-04-24

**Issue:** Unauthorized Access / Authentication Bypass
**Severity:** High

**Root Cause:**
1. The Next.js middleware file was incorrectly named `proxy.ts`. Next.js requires the middleware file to be strictly named `middleware.ts` (or `.js`) and placed at the root of the project (or `src/` folder) to be executed.
2. Because of this misnaming, the middleware was failing silently, bypassing Clerk authentication and route protections entirely.
3. The `/explore` route, which is an authenticated dashboard page using `DashboardFrame` and `DemoProvider`, was incorrectly listed in the `isPublicRoute` array.
4. Public navigation links in the header and footer were pointing directly to the `/explore` route instead of the dedicated public search page (`/search`), exposing the stub version of the authenticated workbench intended for the video demo.

**Resolution:**
1. Renamed `proxy.ts` to `middleware.ts` to correctly register the Next.js middleware.
2. Removed `/explore(.*)` from the `isPublicRoute` array in `middleware.ts` to enforce authentication for the explorer page.
3. Updated the `href` for the "Explore" and "Programs" nav links in `components/public/homepage/public-homepage.tsx` to point to `/search`.
4. Updated navigation links in `app/app/programs/[slug]/page.tsx` pointing to `/explore` to point to `/search`.

**Security Standards Enforced:**
- Failing Securely: Ensuring the middleware is properly registered so that unprotected routes fail closed (require authentication) by default.
- Defense in Depth: Multiple layers of protection (middleware routing + component-level state checks) are now properly aligned.
