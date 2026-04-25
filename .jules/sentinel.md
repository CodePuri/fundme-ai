## 2025-02-25 - [CRITICAL] Fix missing authentication due to misnamed middleware.ts
**Vulnerability:** Next.js middleware was named `proxy.ts` instead of `middleware.ts`, causing it to silently fail to register and bypass all route protections.
**Learning:** Next.js strictly requires the middleware to be named `middleware.ts` (or `.js`). Any other name will be ignored, leading to unprotected routes without any build errors.
**Prevention:** Ensure that Next.js middleware is always named correctly.
