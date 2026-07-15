import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "../../app/api/grill/analyze/route";
import { isAnalyzeResponse } from "../../lib/grill/validation";
import { GRILL_UPLOAD_LIMITS } from "../../lib/grill/validation";
import { strongIntake } from "./fixtures";

test("the analysis API returns a sanitized error schema for malformed intake", async () => {
  const form = new FormData();
  form.set("intake", JSON.stringify({ founder: {} }));
  const response = await POST(
    new Request("http://localhost/api/grill/analyze", { method: "POST", body: form }),
  );
  const body: unknown = await response.json();

  assert.equal(response.status, 400);
  assert.equal(isAnalyzeResponse(body), true);
  assert.deepEqual(body, {
    ok: false,
    error: { code: "INVALID_INTAKE", message: "Review the founder and startup information and try again." },
  });
});

test("the public analysis API rejects overlong intake fields before report generation", async () => {
  const form = new FormData();
  form.set(
    "intake",
    JSON.stringify({
      ...strongIntake,
      startup: { ...strongIntake.startup, name: "x".repeat(121) },
    }),
  );
  const response = await POST(
    new Request("http://localhost/api/grill/analyze", { method: "POST", body: form }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: {
      code: "INVALID_INTAKE",
      message: "Review the founder and startup information and try again.",
    },
  });
});

test("live mode rejects before reading multipart founder data", async () => {
  const originalMode = process.env.FUNDME_RUNTIME_MODE;
  let bodyRead = false;
  process.env.FUNDME_RUNTIME_MODE = "live";

  try {
    const request = {
      headers: new Headers({ "content-type": "multipart/form-data; boundary=test" }),
      formData: async () => {
        bodyRead = true;
        return new FormData();
      },
    } as unknown as Request;
    const response = await POST(request);
    const body: unknown = await response.json();

    assert.equal(response.status, 503);
    assert.equal(bodyRead, false);
    assert.deepEqual(body, {
      ok: false,
      error: {
        code: "LIVE_RUNTIME_NOT_CONFIGURED",
        message: "The live assessment runtime is not configured.",
      },
    });
  } finally {
    if (originalMode === undefined) delete process.env.FUNDME_RUNTIME_MODE;
    else process.env.FUNDME_RUNTIME_MODE = originalMode;
  }
});

test("malformed multipart bodies return a sanitized client error", async () => {
  const response = await POST(
    new Request("http://localhost/api/grill/analyze", {
      method: "POST",
      headers: { "content-type": "multipart/form-data" },
      body: "not-a-multipart-body",
    }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: {
      code: "MALFORMED_MULTIPART",
      message: "The uploaded form data is malformed.",
    },
  });
});

test("explicitly uploaded empty files are rejected instead of treated as absent", async () => {
  const form = new FormData();
  form.set("intake", JSON.stringify(strongIntake));
  form.set("profileFile", new File([], "empty-profile.txt", { type: "text/plain" }));

  const response = await POST(
    new Request("http://localhost/api/grill/analyze", { method: "POST", body: form }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: {
      code: "EMPTY_FILE",
      message: "Choose a file that is not empty.",
    },
  });
});

test("unknown multipart parts cannot bypass the bounded request body", async () => {
  const form = new FormData();
  form.set("intake", JSON.stringify(strongIntake));
  form.set(
    "unexpectedFile",
    new File(
      [new Uint8Array(GRILL_UPLOAD_LIMITS.maxRequestBytes + 1)],
      "oversized.bin",
      { type: "application/octet-stream" },
    ),
  );

  const response = await POST(
    new Request("http://localhost/api/grill/analyze", { method: "POST", body: form }),
  );

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: {
      code: "REQUEST_TOO_LARGE",
      message: "The analysis request is too large.",
    },
  });
});
