## 2024-05-05 - Fix Next.js Middleware Authentication Bypass
**Vulnerability:** Silent authentication bypass due to misnamed Next.js middleware file (`proxy.ts` instead of `middleware.ts`). The Clerk authentication logic in `proxy.ts` was not being executed.
**Learning:** Next.js middleware must be exactly named `middleware.ts` (or `.js`) and placed at the root (or `src/`) to be registered. A misnamed file does not throw an error during build but causes route protections to be bypassed entirely.
**Prevention:** Include a file existence check or a linter rule specifically enforcing that if Clerk/NextAuth middleware is used, a strictly named `middleware.ts` file exists in the expected location.
