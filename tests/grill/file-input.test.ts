import assert from "node:assert/strict";
import test from "node:test";

import {
  clearFileSelection,
  handleFileSelection,
} from "../../lib/grill/client/files";

test("removing a file clears the native value before updating React state", () => {
  const input = { value: "/fake/path/deck.pdf" };
  const changes: Array<null> = [];

  clearFileSelection(input, (file) => changes.push(file));

  assert.equal(input.value, "");
  assert.deepEqual(changes, [null]);
});

test("rejecting a file clears the native value so the same file can be retried", () => {
  const input = { value: "/fake/path/deck.pdf" };
  const file = new File(["invalid"], "deck.pdf", { type: "application/pdf" });

  handleFileSelection(input, file, () => false);

  assert.equal(input.value, "");
});
