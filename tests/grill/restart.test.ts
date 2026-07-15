import assert from "node:assert/strict";
import test from "node:test";

import { restartGrillDemo } from "../../lib/grill/client/restart";

test("restart clears demo state before forcing a fresh intake document", () => {
  const calls: string[] = [];

  restartGrillDemo(
    { clear: () => calls.push("clear") },
    { replace: (url) => calls.push(`replace:${url}`) },
  );

  assert.deepEqual(calls, ["clear", "replace:/grill"]);
});
