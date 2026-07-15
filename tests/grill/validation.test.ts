import assert from "node:assert/strict";
import test from "node:test";

import {
  GRILL_UPLOAD_LIMITS,
  findMissingInformation,
  hasPdfSignature,
  isAnalyzeResponse,
  sanitizeFilename,
  validateFileMetadata,
} from "../../lib/grill/validation";
import { buildDossier } from "../../lib/grill/evidence";
import { DeterministicGrillEngine } from "../../lib/grill/engine";
import { LocalKnowledgeRetriever } from "../../lib/grill/retrieval";
import { grillKnowledgeCorpus } from "../../lib/grill/server/corpus";
import { parsedDeck, strongIntake, weakIntake } from "./fixtures";

test("pitch decks require PDF type, extension, and size", () => {
  assert.deepEqual(
    validateFileMetadata({ name: "deck.exe", type: "application/x-msdownload", size: 100 }, "pitch_deck"),
    { ok: false, code: "INVALID_FILE_TYPE", message: "Pitch decks must be PDF files." },
  );
  const oversized = validateFileMetadata(
    { name: "deck.pdf", type: "application/pdf", size: GRILL_UPLOAD_LIMITS.maxFileBytes + 1 },
    "pitch_deck",
  );
  assert.equal(oversized.ok, false);
  if (!oversized.ok) assert.equal(oversized.code, "FILE_TOO_LARGE");
});

test("PDF metadata accepts an absent browser MIME type", () => {
  assert.deepEqual(
    validateFileMetadata({ name: "deck.pdf", type: "", size: 100 }, "pitch_deck"),
    { ok: true },
  );
  assert.deepEqual(
    validateFileMetadata({ name: "profile.pdf", type: "", size: 100 }, "profile_document"),
    { ok: true },
  );
});

test("PDF validation checks magic bytes instead of trusting the filename", () => {
  assert.equal(hasPdfSignature(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])), true);
  assert.equal(hasPdfSignature(new TextEncoder().encode("not a pdf")), false);
});

test("filenames are reduced to a safe display form", () => {
  assert.equal(sanitizeFilename("../../Investor Deck (final).pdf"), "Investor-Deck-final.pdf");
  assert.equal(sanitizeFilename("   "), "upload");
});

test("missing-information detection is concrete", () => {
  const missing = findMissingInformation(weakIntake, []);

  assert.ok(missing.some((item) => item.field === "startup.traction"));
  assert.ok(missing.some((item) => item.field === "founder.achievements"));
  assert.ok(missing.some((item) => item.field === "pitchDeck"));
});

test("API response validation rejects incomplete reports", () => {
  assert.equal(isAnalyzeResponse({ ok: true, report: {} }), false);
  assert.equal(isAnalyzeResponse({ ok: false, error: { code: "BAD_REQUEST", message: "Invalid request" } }), true);
});

test("report validation rejects corrupt nested report data", () => {
  const dossier = buildDossier(strongIntake, [parsedDeck]);
  const guidance = new LocalKnowledgeRetriever(grillKnowledgeCorpus).retrieve(dossier, 5);
  const report = new DeterministicGrillEngine().analyze(dossier, guidance);

  assert.equal(isAnalyzeResponse({ ok: true, runtimeMode: "demo", report, artifacts: [] }), true);
  assert.equal(
    isAnalyzeResponse({
      ok: true,
      runtimeMode: "demo",
      report: { ...report, dimensions: [null, ...report.dimensions.slice(1)] },
      artifacts: [],
    }),
    false,
  );
  const { profileReview: _profileReview, ...withoutProfileReview } = report;
  assert.equal(
    isAnalyzeResponse({
      ok: true,
      runtimeMode: "demo",
      report: withoutProfileReview,
      artifacts: [],
    }),
    false,
  );
});
