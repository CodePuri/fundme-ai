import test from "node:test";
import assert from "node:assert/strict";
import { sendAssessmentSavedEmail } from "../../lib/email/resend.ts";

const emailProps = {
  founderName: "Avery Founder",
  startupName: "Northstar Labs",
  readinessScore: 72,
  verdict: "Promising foundation",
  workspaceUrl: "https://staging.tryfundme.in/app/preview",
};

test("first-save email fails explicitly when Resend is not configured", async () => {
  const result = await sendAssessmentSavedEmail("founder@example.test", emailProps, {
    apiKey: undefined,
    assessmentId: "assessment-123",
  });

  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /not configured/i);
});

test("first-save email uses a stable assessment-scoped idempotency key", async () => {
  let capturedOptions = null;
  const resend = {
    emails: {
      send: async (_email, options) => {
        capturedOptions = options;
        return { data: { id: "email-123" }, error: null };
      },
    },
  };

  const result = await sendAssessmentSavedEmail("founder@example.test", emailProps, {
    apiKey: "test-api-key",
    assessmentId: "assessment-123",
    resend,
  });

  assert.equal(result.ok, true);
  assert.equal(capturedOptions?.idempotencyKey, "assessment-saved:assessment-123");
});
