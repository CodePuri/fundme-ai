import assert from "node:assert/strict";
import test from "node:test";

import { createServerRuntime, resolveRuntimeMode } from "../../lib/grill/runtime";

test("local and Preview environments default safely to demo", () => {
  assert.equal(resolveRuntimeMode(undefined, undefined), "demo");
  assert.equal(resolveRuntimeMode(undefined, "preview"), "demo");
  assert.equal(resolveRuntimeMode("demo", "production"), "demo");
});

test("Production defaults to live and unconfigured live mode fails explicitly", () => {
  assert.equal(resolveRuntimeMode(undefined, "production"), "live");
  assert.throws(
    () => createServerRuntime({ FUNDME_RUNTIME_MODE: "live", VERCEL_ENV: "preview" }),
    /Live runtime is not configured/,
  );
});

test("invalid runtime values fail instead of falling back", () => {
  assert.throws(() => resolveRuntimeMode("staging", "preview"), /Invalid FUNDME_RUNTIME_MODE/);
});
