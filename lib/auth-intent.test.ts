import assert from "node:assert";
import { test } from "node:test";
import { parseAuthIntent } from "./auth-intent.ts";

test("parseAuthIntent returns null for invalid JSON", () => {
  const result = parseAuthIntent("invalid-json");
  assert.strictEqual(result, null);
});

test("parseAuthIntent returns null for null input", () => {
  const result = parseAuthIntent(null);
  assert.strictEqual(result, null);
});

test("parseAuthIntent returns parsed object for valid input", () => {
  const intent = { action: "default", destination: "/app" };
  const result = parseAuthIntent(JSON.stringify(intent));
  assert.deepStrictEqual(result, intent);
});
