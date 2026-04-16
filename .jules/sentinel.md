## 2026-04-16 - [MEDIUM] Fix database error leakage in API
**Vulnerability:** API routes (specifically `app/api/onboarding/route.ts`) were returning raw database error messages directly to the client via `NextResponse.json({ error: error.message }, { status: 500 })`.
**Learning:** Returning unhandled database errors to the frontend can expose sensitive internal information about the database schema, query structures, or state, which attackers can leverage.
**Prevention:** Always log detailed errors server-side (e.g., using `console.error`) and return generic error messages (e.g., "Internal Server Error") to the client.
