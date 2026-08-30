import assert from "node:assert/strict";
import test from "node:test";

test("structured evidence model preserves exact source provenance and separates missing info", async () => {
  const { buildStructuredEvidence } = await import("../../lib/assessment/evidence-model.ts");

  const evidence = buildStructuredEvidence({
    input: {
      founderName: "Rohan Varma",
      founderRole: "CTO",
      startupName: "DataGrid",
      websiteUrl: "https://datagrid.ai",
      linkedInUrl: "https://linkedin.com/in/rohan-varma",
      description: "Real-time analytics engine for IoT devices.",
      profileText: "8 years building database kernels.",
    },
    artifacts: [],
    website: {
      url: "https://datagrid.ai",
      normalizedUrl: "https://datagrid.ai",
      success: true,
      title: "DataGrid | Fast IoT Analytics",
      description: "Process 1M events per second with zero latency.",
      headings: ["Features", "Architecture", "Pricing"],
      cleanText: "DataGrid is an embedded analytics engine...",
      productSignals: ["pricing-present", "developer-product"],
      fetchedAt: "2026-08-30T12:00:00.000Z",
    },
    deckPdf: null,
    resumePdf: null,
    answers: {
      traction: {
        questionId: "traction",
        text: "12 pilots and $15k MRR",
        source: "typed",
        answeredAt: "2026-08-30T12:00:00.000Z",
      },
    },
  });

  assert.equal(evidence.founder.name, "Rohan Varma");
  assert.equal(evidence.founder.role, "CTO");
  assert.equal(evidence.startup.name, "DataGrid");
  assert.equal(evidence.startup.websiteFetched, true);
  assert.equal(evidence.startup.websiteTitle, "DataGrid | Fast IoT Analytics");
  assert.equal(evidence.pitchDeck.attached, false);
  assert.equal(evidence.pitchDeck.parsed, false);

  // Checks that missing information is explicitly tracked, not hallucinated
  assert.ok(evidence.missingEvidenceList.includes("Pitch deck"));
  assert.ok(!evidence.missingEvidenceList.includes("Founder name"));

  // Check evidence list items
  const websiteEvidence = evidence.evidenceList.find((e) => e.id === "startup-website");
  assert.ok(websiteEvidence);
  assert.match(websiteEvidence.value, /Title: DataGrid/);
});
