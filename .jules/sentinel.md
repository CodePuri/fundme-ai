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

## 2026-04-24 - Open Redirect Vulnerability in Clerk Auth Flow
**Vulnerability:** The application was passing unsanitized user input (`params.redirect`) directly into Clerk's `redirect_url` query parameter in `app/login/page.tsx` (`redirect('/sign-in?redirect_url=' + encodeURIComponent(params.redirect))`). This created an Open Redirect vulnerability where attackers could trick users into navigating to a malicious site after logging in.
**Learning:** Clerk's authentication redirects rely on the `redirect_url` query parameter. If this parameter is constructed using unsanitized user input from `searchParams`, it can be exploited to redirect users off-site, potentially leading to phishing attacks.
**Prevention:** Always sanitize any URL parameter that controls redirects. Implement and use a utility function like `getSafeRedirect(url, fallback)` that strictly enforces safe relative paths (e.g., must start with `/` but not `//` to avoid protocol-relative URLs) before passing them to authentication flows or Next.js `redirect()` functions.
