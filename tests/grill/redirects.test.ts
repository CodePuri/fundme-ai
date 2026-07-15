import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeInternalRedirect } from "../../lib/security/redirects";

test("internal paths are preserved", () => {
  assert.equal(sanitizeInternalRedirect("/grill/result?from=login", "/onboarding"), "/grill/result?from=login");
});

test("external, protocol-relative, and malformed redirects use the fallback", () => {
  assert.equal(sanitizeInternalRedirect("https://example.com", "/onboarding"), "/onboarding");
  assert.equal(sanitizeInternalRedirect("//example.com/path", "/onboarding"), "/onboarding");
  assert.equal(sanitizeInternalRedirect("javascript:alert(1)", "/onboarding"), "/onboarding");
  assert.equal(sanitizeInternalRedirect(undefined, "/onboarding"), "/onboarding");
});

test("repeated redirect parameters are rejected instead of crashing", () => {
  assert.equal(
    sanitizeInternalRedirect(["/grill", "//example.com"], "/onboarding"),
    "/onboarding",
  );
});
