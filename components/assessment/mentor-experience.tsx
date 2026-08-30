"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, FileText, Mic, Paperclip, Send, Square, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAssessment } from "@/components/assessment/assessment-provider";
import { isBrowserSpeechSupported, startBrowserSpeech } from "@/components/assessment/browser-speech-adapter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { nextMentorQuestion } from "@/lib/assessment/questions";
import type { AnswerSource, VoiceState } from "@/lib/assessment/types";

const VOICE_LABELS: Partial<Record<VoiceState, string>> = {
  "requesting-permission": "Requesting microphone permission…",
  listening: "Listening…",
  transcribing: "Transcribing…",
  "transcript-ready": "Transcript ready — review before sending.",
  failed: "Voice was unavailable. Your typed draft is unchanged.",
  unavailable: "Voice input is not supported in this browser.",
};

export function MentorExperience() {
  const router = useRouter();
  const { session, submitAnswer, skipQuestion, beginAssessment, attachFile } = useAssessment();
  const question = nextMentorQuestion(session);
  const [draft, setDraft] = useState("");
  const [source, setSource] = useState<AnswerSource>("typed");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const voiceBaseDraftRef = useRef("");
  const fileRef = useRef<HTMLInputElement>(null);
  const resolvedCount = Object.keys(session.answers).length + session.skippedQuestionIds.length;
  const evidenceCount = useMemo(() => session.artifacts.length + Object.keys(session.answers).length + 3, [session]);

  function send() {
    if (submitAnswer(draft, source)) {
      setDraft("");
      setSource("typed");
      setVoiceState("idle");
    }
  }

  function toggleVoice() {
    if (voiceState === "listening" || voiceState === "transcribing") {
      stopRef.current?.();
      return;
    }
    voiceBaseDraftRef.current = draft.trim();
    const control = startBrowserSpeech({
      onState: setVoiceState,
      onTranscript: (transcript) => {
        setDraft([voiceBaseDraftRef.current, transcript].filter(Boolean).join(" "));
        setSource("voice");
      },
    });
    stopRef.current = control?.stop ?? null;
  }

  function finish() {
    beginAssessment();
    router.push("/assessment/result");
  }

  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Deterministic mentor</p><h1 className="instrument-serif mt-2 text-4xl sm:text-5xl">Pressure-test the missing evidence.</h1></div>
        <p className="text-sm font-medium text-[#8b8276]">{resolvedCount}/5 questions resolved</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="flex min-h-[620px] flex-col rounded-[32px] border border-[var(--border)] bg-white shadow-[0_24px_70px_rgba(17,17,17,0.06)]">
          <div className="flex items-center gap-4 border-b border-[var(--border)] p-5 sm:p-6">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#171513] text-white"><span className="instrument-serif text-2xl italic">F</span></div>
            <div><h2 className="font-semibold">FundMe mentor</h2><p className="text-xs text-[#8b8276]">Rule-based Preview · no live AI</p></div>
          </div>

          <div aria-live="polite" className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
            <div className="max-w-[86%] rounded-[22px] rounded-tl-md bg-[#f6f1ea] p-4 text-sm leading-6">I’ll ask up to five focused questions. Specific numbers and dates improve evidence coverage; skipping creates a visible gap, never a fabricated answer.</div>
            {session.conversation.map((event) => <div className={`max-w-[86%] rounded-[22px] p-4 text-sm leading-6 ${event.role === "founder" ? "ml-auto rounded-tr-md bg-[#171513] text-white" : event.role === "system" ? "mx-auto bg-amber-50 text-amber-900" : "rounded-tl-md bg-[#f6f1ea]"}`} key={event.id}>{event.content}</div>)}
            {question ? <div className="max-w-[86%] rounded-[22px] rounded-tl-md border border-[#ff6b3d]/20 bg-[#fff7f2] p-4"><p className="text-sm font-semibold leading-6">{question.prompt}</p><p className="mt-2 text-xs leading-5 text-[#8b8276]">Why it matters: {question.whyItMatters}</p></div> : <div className="rounded-[22px] bg-[#eef7ee] p-5 text-sm leading-6 text-[#315b35]">The evidence round is complete. Generate the deterministic assessment when you’re ready.</div>}
          </div>

          <div className="border-t border-[var(--border)] p-4 sm:p-5">
            {question ? <>
              <Textarea aria-label="Answer the mentor" className="min-h-24 resize-none" placeholder={question.placeholder} value={draft} onChange={(event) => { setDraft(event.target.value); setSource("typed"); }} />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button aria-label={voiceState === "listening" ? "Stop voice input" : "Start voice input"} onClick={toggleVoice} variant="secondary">
                  {voiceState === "listening" ? <Square className="size-4" /> : <Mic className="size-4" />}<span className="hidden sm:inline">Voice</span>
                </Button>
                <input ref={fileRef} className="sr-only" type="file" accept=".pdf,.doc,.docx,.txt" onChange={(event) => { const file = event.target.files?.[0]; if (file) setAttachmentError(attachFile(file, "notes")); event.target.value = ""; }} />
                <Button onClick={() => fileRef.current?.click()} variant="secondary"><Paperclip className="size-4" /><span className="hidden sm:inline">Attach</span></Button>
                <Button onClick={skipQuestion} variant="ghost">Skip</Button>
                <Button className="ml-auto" disabled={draft.trim().length < 2} onClick={send}>Send <Send className="size-4" /></Button>
              </div>
              {(VOICE_LABELS[voiceState] || attachmentError) && <p className="mt-3 text-xs text-[#8b8276]" role="status">{attachmentError ?? VOICE_LABELS[voiceState]}{!isBrowserSpeechSupported() && voiceState === "idle" ? " Voice input is unavailable." : ""}</p>}
            </> : <Button className="w-full" onClick={finish} size="lg">Generate assessment <ArrowRight className="size-4" /></Button>}
          </div>
        </section>

        <aside className="space-y-4">
          <details className="rounded-[24px] border border-[var(--border)] bg-white p-5 lg:open" open>
            <summary className="cursor-pointer font-semibold lg:cursor-default">Evidence context</summary>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl bg-[#f6f1ea] p-3"><UserRound className="size-4 text-[#ff6b3d]" /><div><p className="font-medium">{session.input.founderName}</p><p className="text-xs text-[#8b8276]">{session.input.founderRole}</p></div></div>
              <div className="rounded-xl bg-[#f6f1ea] p-3"><p className="font-medium">{session.input.startupName || session.input.websiteUrl}</p><p className="mt-1 text-xs leading-5 text-[#8b8276]">{session.input.description}</p></div>
              <div className="flex items-center justify-between text-xs"><span>Evidence items</span><strong>{evidenceCount}</strong></div>
              <div className="flex items-center justify-between text-xs"><span>Attachments</span><strong>{session.artifacts.length}</strong></div>
            </div>
          </details>
          <details className="rounded-[24px] border border-[var(--border)] bg-white p-5">
            <summary className="cursor-pointer font-semibold">Attachment boundary</summary>
            <p className="mt-3 text-xs leading-5 text-[#8b8276]"><FileText className="mr-1 inline size-3.5" />Files remain represented by name, type, and size only. Their contents are not parsed in this Preview.</p>
          </details>
        </aside>
      </div>
    </div>
  );
}
