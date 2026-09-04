import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Next configuration does not inline runtime credentials into browser bundles", async () => {
  const source = await readFile(new URL("../../next.config.ts", import.meta.url), "utf8");

  assert.doesNotMatch(source, /\benv\s*:/);
});
