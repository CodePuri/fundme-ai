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

## 2026-05-16 - Open Redirect in Authentication Flow
**Vulnerability:** The `/login` page was accepting an arbitrary `redirect` query parameter and appending it to the Clerk `/sign-in` URL (`redirect_url`) without validation. This allowed an attacker to craft a malicious URL (e.g., `/login?redirect=https://evil.com`) which would redirect the user to a malicious site after authenticating.
**Learning:** Next.js redirect parameters, especially those tied to authentication flows (like `redirect_url` in Clerk), must be treated as untrusted input. Relying on default fallbacks (`|| "/onboarding"`) does not sanitize the input if the attacker provides a truthy, absolute URL.
**Prevention:** Always validate user-provided redirect URLs to ensure they are relative paths. Created and applied a `getSafeRedirect` utility that explicitly checks that the path starts with `/` and not `//` to prevent protocol-relative and absolute URL redirects.
