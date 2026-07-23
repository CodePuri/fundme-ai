import assert from "node:assert/strict";
import test from "node:test";

test("microphone denial remains failed after the browser end event", async () => {
  const originalWindow = globalThis.window;
  const states = [];
  class DeniedRecognition {
    start() {
      this.onerror?.({ error: "not-allowed" });
      this.onend?.();
    }
    stop() {}
  }
  globalThis.window = { SpeechRecognition: DeniedRecognition };
  try {
    const { startBrowserSpeech } = await import("../../components/assessment/browser-speech-adapter.ts");
    startBrowserSpeech({ onState: (state) => states.push(state), onTranscript: () => {} });
    assert.equal(states.at(-1), "failed");
  } finally {
    globalThis.window = originalWindow;
  }
});
