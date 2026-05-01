## 2025-05-01 - Next.js Middleware Naming Bypass
**Vulnerability:** Next.js middleware was misnamed as `proxy.ts`, which caused it to silently fail to register. This bypassed authentication and route protections entirely.
**Learning:** Next.js middleware must strictly be named `middleware.ts` (or `.js`) and placed at the root of the project (or `src/` folder) to be correctly registered and executed. Misnaming this file causes silent failures rather than errors.
**Prevention:** Ensure middleware files are always named `middleware.ts`. Tests and automated checks should verify the existence and correct naming of this file to prevent accidental renaming.
