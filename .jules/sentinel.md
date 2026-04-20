## 2024-05-18 - Database Error Message Leakage
**Vulnerability:** The API routes (`app/api/onboarding/route.ts`) return raw Supabase database error messages (`error.message`) to the client on failure.
**Learning:** Returning internal database errors provides attackers with insight into the database schema and structure. This information exposure should be mitigated.
**Prevention:** Always log raw errors server-side using `console.error` (or a logging service) and return a generic error message (e.g., "Internal Server Error") to the client.

## 2024-05-18 - Missing rel="noopener noreferrer" on External Links
**Vulnerability:** Multiple UI components use `target="_blank"` with only `rel="noreferrer"` on external links (`components/startup-programs/startup-program-row.tsx`, `components/application/application-workspace-view.tsx`, `app/app/programs/[slug]/page.tsx`).
**Learning:** When linking to external pages with `target="_blank"`, omitting `noopener` exposes the application to reverse tabnabbing attacks, where the newly opened page can access the `window.opener` object and potentially redirect the original page.
**Prevention:** Always explicitly include `rel="noopener noreferrer"` on all external links that use `target="_blank"`.
