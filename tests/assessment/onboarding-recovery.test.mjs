import assert from "node:assert/strict";
import test from "node:test";

test("maps compatible onboarding context into a recoverable Grill session", async () => {
  const { mapOnboardingDraftToSession } = await import("../../components/assessment/onboarding-bridge.ts");
  const session = mapOnboardingDraftToSession({
    name: "Asha Rao",
    role: "Founder",
    companyName: "SignalStack",
    websiteUrl: "signalstack.example",
    linkedIn: "https://linkedin.com/in/asha",
    notes: "SignalStack helps procurement teams replace manual vendor reviews.",
    files: ["pitch-v1.pdf"],
  }, "2026-07-23T00:00:00.000Z");

  assert.equal(session.input.founderName, "Asha Rao");
  assert.equal(session.input.description, "SignalStack helps procurement teams replace manual vendor reviews.");
  assert.equal(session.artifacts[0].name, "pitch-v1.pdf");
  assert.equal(session.artifacts[0].kind, "notes");
  assert.equal(session.stage, "intake");
});
