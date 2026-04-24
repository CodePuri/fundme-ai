## 2026-04-24 - [Critical Authentication Bypass] Next.js Middleware Misnaming
**Vulnerability:** Next.js Clerk middleware was named `proxy.ts` instead of `middleware.ts`.
**Learning:** Next.js strictly requires middleware to be named `middleware.ts` (or `.js`) at the root of the project. If misnamed, it fails silently, entirely bypassing route protections and authentication logic, leaving supposedly secure routes completely exposed.
**Prevention:** Always verify that Next.js middleware is named `middleware.ts` and placed at the root (or `src/`) to ensure authentication and route protection layers are active. Write tests to assert that protected routes return 401/redirects when unauthenticated.
