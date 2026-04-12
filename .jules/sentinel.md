## 2025-02-14 - Information Leakage in API Endpoints
**Vulnerability:** Supabase database errors (`error.message`) were being directly returned to clients in 500 response bodies in `/api/onboarding`.
**Learning:** Returning unhandled database exceptions directly to API consumers can expose schema names, internal column structures, or other backend details that aid attackers in mapping the application.
**Prevention:** Always log specific error details server-side using `console.error` for debugging, and return a generic `{"error": "Internal Server Error"}` message to the client on unexpected failures.
