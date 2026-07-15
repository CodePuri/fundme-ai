import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeGrill,
  GrillRequestError,
} from "../../lib/grill/client/analyze";
import { strongIntake } from "./fixtures";

class PendingXmlHttpRequest {
  static current: PendingXmlHttpRequest | null = null;

  responseType = "";
  response: unknown = null;
  status = 0;
  upload = { addEventListener: () => undefined };
  private listeners = new Map<string, () => void>();
  aborted = false;

  constructor() {
    PendingXmlHttpRequest.current = this;
  }

  open() {}

  addEventListener(event: string, listener: () => void) {
    this.listeners.set(event, listener);
  }

  send() {}

  abort() {
    this.aborted = true;
    this.listeners.get("abort")?.();
  }
}

test("aborting an in-flight analysis prevents stale completion after navigation", async () => {
  const original = globalThis.XMLHttpRequest;
  Object.assign(globalThis, {
    XMLHttpRequest: PendingXmlHttpRequest,
  });
  const controller = new AbortController();

  try {
    const request = analyzeGrill({
      intake: strongIntake,
      identity: { kind: "anonymous_demo_session", sessionId: "demo-test" },
      profileFile: null,
      deckFile: null,
      onProgress: () => undefined,
      signal: controller.signal,
    } as Parameters<typeof analyzeGrill>[0] & { signal: AbortSignal });

    controller.abort();
    const outcome = await Promise.race([
      request.then(
        () => "resolved",
        (error: unknown) => error,
      ),
      new Promise((resolve) => setTimeout(() => resolve("timed_out"), 25)),
    ]);

    assert.equal(PendingXmlHttpRequest.current?.aborted, true);
    assert.ok(outcome instanceof GrillRequestError);
    assert.equal(outcome.code, "REQUEST_ABORTED");
  } finally {
    Object.assign(globalThis, { XMLHttpRequest: original });
  }
});
