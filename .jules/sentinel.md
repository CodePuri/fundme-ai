## 2024-04-17 - Error Message Leakage in API
**Vulnerability:** The API routes in `app/api/onboarding/route.ts` returned `error.message` directly from the Supabase response when database queries failed.
**Learning:** Returning `error.message` directly can leak database internals or stack trace details to the client. This violates the "fail securely" principle and should be logged server-side instead, returning a generic error to the client.
**Prevention:** Catch errors, log `error.message` using `console.error()`, and return a generic string such as `"Internal Server Error"` or `"An error occurred"` to the client.
