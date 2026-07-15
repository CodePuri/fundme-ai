import assert from "node:assert/strict";
import test from "node:test";

import {
  DemoArtifactProcessor,
  boundExtractedPages,
  boundTextItems,
  resolveExtractionBoundary,
} from "../../lib/grill/server/pdf";
import { GRILL_UPLOAD_LIMITS } from "../../lib/grill/validation";

function createTextPdf(text: string) {
  const escaped = text.replace(/([\\()])/g, "\\$1");
  const stream = `BT /F1 18 Tf 72 720 Td (${escaped}) Tj ET`;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += object;
  }
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

test("a real text PDF is parsed on the server", async () => {
  const bytes = createTextPdf("Problem Solution Market Traction Team Fundraise");
  const file = new File([bytes], "sample-deck.pdf", { type: "application/pdf" });

  const result = await new DemoArtifactProcessor().process(file, "pitch_deck");

  assert.equal(result.status, "parsed");
  assert.match(result.text, /Problem Solution Market Traction Team Fundraise/);
  assert.equal(result.pagesParsed, 1);
  assert.equal(result.totalPages, 1);
});

test("a fake PDF signature is rejected as unsafe input", async () => {
  const file = new File(["not a pdf"], "fake.pdf", { type: "application/pdf" });

  await assert.rejects(
    () => new DemoArtifactProcessor().process(file, "pitch_deck"),
    (error: unknown) =>
      error instanceof Error &&
      "code" in error &&
      error.code === "INVALID_PDF_SIGNATURE",
  );
});

test("a corrupt file with a PDF signature returns an honest partial state", async () => {
  const file = new File(["%PDF-1.4\nthis is corrupt"], "broken.pdf", {
    type: "application/pdf",
  });

  const result = await new DemoArtifactProcessor().process(file, "pitch_deck");

  assert.equal(result.status, "unavailable");
  assert.equal(result.text, "");
  assert.equal(result.errorCode, "PDF_PARSE_FAILED");
});

test("a corrupt profile PDF names the profile document in its partial state", async () => {
  const file = new File(["%PDF-1.4\nthis is corrupt"], "broken-profile.pdf", {
    type: "application/pdf",
  });

  const result = await new DemoArtifactProcessor().process(file, "profile_document");

  assert.equal(result.status, "unavailable");
  assert.match(result.errorMessage ?? "", /profile document/i);
  assert.doesNotMatch(result.errorMessage ?? "", /deck/i);
});

test("plain-text profile files are normalized without PDF claims", async () => {
  const file = new File(["Built payments products for 120 businesses."], "profile.txt", {
    type: "text/plain",
  });

  const result = await new DemoArtifactProcessor().process(file, "profile_document");

  assert.equal(result.status, "parsed");
  assert.equal(result.pagesParsed, 0);
  assert.match(result.text, /120 businesses/);
});

test("extracted pages and characters are bounded deterministically", () => {
  const pages = Array.from({ length: 25 }, (_, index) => `Page ${index + 1} ${"x".repeat(4_000)}`);
  const bounded = boundExtractedPages(pages, 25);

  assert.ok(bounded.pagesParsed > 0);
  assert.ok(bounded.pagesParsed <= GRILL_UPLOAD_LIMITS.maxPages);
  assert.ok(bounded.text.length <= GRILL_UPLOAD_LIMITS.maxCharacters);
  assert.equal(bounded.truncated, true);
});

test("expanded PDF text stops being consumed at the character budget", () => {
  let itemsConsumed = 0;
  function* largeItems() {
    for (let index = 0; index < 100; index += 1) {
      itemsConsumed += 1;
      yield "x".repeat(10_000);
    }
  }

  const bounded = boundTextItems(
    largeItems(),
    GRILL_UPLOAD_LIMITS.maxCharacters,
  );

  assert.ok(bounded.text.length <= GRILL_UPLOAD_LIMITS.maxCharacters);
  assert.equal(bounded.truncated, true);
  assert.ok(itemsConsumed < 100);
});

test("an exact cap on the final page is not marked truncated", () => {
  assert.deepEqual(
    resolveExtractionBoundary({
      characters: GRILL_UPLOAD_LIMITS.maxCharacters,
      itemTruncated: false,
      pageNumber: 1,
      totalPages: 1,
    }),
    { stop: true, truncated: false },
  );
  assert.deepEqual(
    resolveExtractionBoundary({
      characters: GRILL_UPLOAD_LIMITS.maxCharacters,
      itemTruncated: false,
      pageNumber: 1,
      totalPages: 2,
    }),
    { stop: true, truncated: true },
  );
});
