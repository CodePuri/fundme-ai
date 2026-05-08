## 2024-05-08 - Critical Authentication Bypass due to Middleware Naming
**Vulnerability:** The authentication middleware was misnamed as `proxy.ts` instead of `middleware.ts`. This caused Next.js to silently ignore the file, bypassing all route protection and authentication checks.
**Learning:** Next.js requires the middleware file to be strictly named `middleware.ts` (or `.js`) at the root of the project (or `src/` folder) to be correctly registered and executed. Any deviation from this convention results in a silent failure where the middleware is not executed.
**Prevention:** Always follow the strict naming convention for Next.js middleware and verify that it is being executed as expected. Include automated tests that explicitly check route protection to catch such misconfigurations.
