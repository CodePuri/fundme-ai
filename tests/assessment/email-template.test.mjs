import test from "node:test";
import assert from "node:assert/strict";
import { renderAssessmentSavedEmail } from "../../lib/email/templates/assessment-saved.ts";

test("assessment email escapes founder-controlled content before rendering HTML", () => {
  const injection = '<img src=x onerror="alert(1)">';
  const { html } = renderAssessmentSavedEmail({
    founderName: injection,
    startupName: injection,
    readinessScore: 72,
    verdict: injection,
    workspaceUrl: "https://tryfundme.in/app/preview",
  });

  assert.doesNotMatch(html, /<img src=x onerror/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
});
