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

## 2026-05-09 - Fix Open Redirect in Login Route
**Vulnerability:** The application was vulnerable to Open Redirect in the `/login` route (`app/login/page.tsx`). The `redirect` search parameter was read and appended directly into the `redirect_url` of the Clerk `/sign-in` URL without validation. This allowed attackers to craft malicious URLs that would redirect users to arbitrary external domains after authentication.
**Learning:** Never trust user input passed via query parameters (like `redirect`), especially when it's used for routing or redirection. Even if the application expects a relative path like `/onboarding`, attackers can supply absolute URLs (e.g., `//malicious.com`).
**Prevention:** Always validate and sanitize user-provided redirect paths using a utility like `getSafeRedirect`, which ensures the path starts with exactly one slash `/` and is relative to the current origin.
