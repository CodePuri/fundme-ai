import type { VoiceState } from "@/lib/assessment/types";

type SpeechRecognitionEventLike = { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> };
type SpeechRecognitionErrorEventLike = { error: string };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function recognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function isBrowserSpeechSupported(): boolean {
  return Boolean(recognitionConstructor());
}

export function startBrowserSpeech({
  onState,
  onTranscript,
}: {
  onState: (state: VoiceState) => void;
  onTranscript: (transcript: string) => void;
}): { stop: () => void } | null {
  const Recognition = recognitionConstructor();
  if (!Recognition) {
    onState("unavailable");
    return null;
  }

  const recognition = new Recognition();
  let transcript = "";
  let failed = false;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-IN";
  recognition.onstart = () => onState("listening");
  recognition.onresult = (event) => {
    onState("transcribing");
    transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" ").trim();
    if (transcript) onTranscript(transcript);
  };
  recognition.onerror = () => {
    failed = true;
    onState("failed");
  };
  recognition.onend = () => {
    if (!failed) onState(transcript ? "transcript-ready" : "idle");
  };

  onState("requesting-permission");
  try {
    recognition.start();
  } catch {
    onState("failed");
  }
  return { stop: () => recognition.stop() };
}
