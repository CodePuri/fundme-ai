"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from "@/components/ui/panel";
import { ProgramLogo } from "@/components/ui/program-logo";
import { StatusBadge, statusTone } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { formatTimestamp, wordCount } from "@/lib/utils";

const demoLog = [
  "Opening YC application portal",
  "Reading founder profile and startup context",
  "Selecting the strongest one-line company description",
  "Drafting Q1 in YC voice constraints",
  "Typing answer into the first form field",
  "Reading traction and recovered revenue proof",
  "Drafting Q2 from product and customer pain",
  "Typing the long-form product answer",
];

function downloadAnswers(answers: Array<{ question: string; answer: string }>) {
  const body = answers.map((item, index) => `${index + 1}. ${item.question}\n${item.answer}`).join("\n\n");
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "YC_W26_Flowstate_AI_Draft.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { state, cycleAnswerVariant, markReady, saveAnswer } = useDemo();
  const { slug } = use(params);
  const program = state.opportunities.find((item) => item.slug === slug);
  const [demoOpen, setDemoOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!demoOpen) {
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const nextElapsed = Math.min(Date.now() - startedAt, 12000);
      setElapsed(nextElapsed);
      if (nextElapsed >= 12000) {
        window.clearInterval(timer);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [demoOpen]);

  const visibleLogs = useMemo(() => {
    return demoLog.slice(0, Math.min(demoLog.length, Math.floor(elapsed / 1500)));
  }, [elapsed]);

  if (!program) {
    notFound();
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-3">
        <Link className="text-[13px] text-zinc-500 hover:text-white" href="/app/applications">
          ← Back
        </Link>
        <Breadcrumbs
          items={[
            { label: "Applications", href: "/app/applications" },
            { label: program.name, href: `/app/programs/${program.slug}` },
            { label: "Workspace" },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <ProgramLogo domain={program.domain} size={48} slug={program.slug} />
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[38px] leading-none tracking-[-0.04em] text-white">
              {program.name}
            </h1>
            <div className="mt-2 text-[14px] text-zinc-500">Application Workspace</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="border-amber-400/20 bg-amber-400/10 text-amber-300 hover:bg-amber-400/15"
            onClick={() => {
              setElapsed(0);
              setDemoOpen(true);
            }}
            variant="ghost"
          >
            Watch AI Fill This →
          </Button>
          <StatusBadge className="text-[11px]" tone={statusTone(program.status)}>
            {program.status}
          </StatusBadge>
          <Button variant="secondary">Save Draft</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="flex flex-col gap-5">
          {state.ycQuestions.map((question) => (
            <Panel key={question.id}>
              <PanelHeader>
                <div className="max-w-[720px]">
                  <PanelMeta>Question</PanelMeta>
                  <PanelTitle className="mt-2 text-[16px]">{question.question}</PanelTitle>
                </div>
                <StatusBadge className="text-[11px]" tone={question.ready ? "green" : "neutral"}>
                  {question.ready ? "Ready" : "Drafting"}
                </StatusBadge>
              </PanelHeader>

              <PanelBody>
                <Textarea
                  className="min-h-[160px]"
                  onChange={(event) => saveAnswer(question.id, event.target.value)}
                  value={question.answer}
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-[12px] text-zinc-500">
                    <span>{wordCount(question.answer)} words</span>
                    <span>{question.answer.length} chars</span>
                    <span>Last saved {formatTimestamp(question.lastSaved)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => cycleAnswerVariant(question.id)} variant="ghost">
                      Regenerate
                    </Button>
                    <Button onClick={() => saveAnswer(question.id, question.answer)} variant="secondary">
                      Save Draft
                    </Button>
                    <Button onClick={() => markReady(question.id)} variant="primary">
                      Mark as Ready
                    </Button>
                  </div>
                </div>
              </PanelBody>
            </Panel>
          ))}
        </div>

        <Panel className="h-fit xl:sticky xl:top-28">
          <PanelHeader className="block">
            <PanelTitle className="text-[12px] uppercase tracking-[0.14em]">Source Context</PanelTitle>
          </PanelHeader>
          <PanelBody className="flex flex-col gap-3">
            <div className="rounded-[10px] border border-zinc-800 bg-black p-4">
              <Badge size="sm">What YC actually looks for</Badge>
              <div className="mt-3 text-[13px] leading-6 text-zinc-400">
                YC tends to reward sharp founder insight, a painfully obvious first wedge, and a
                market story that can expand into a much larger company if the initial motion works.
              </div>
            </div>

            {state.ycQuestions.flatMap((question) =>
              question.sourceSnippets.map((snippet) => (
                <div
                  className="rounded-[10px] border border-zinc-800 bg-black p-4"
                  key={`${question.id}-${snippet}`}
                >
                  <Badge size="sm">{question.id.toUpperCase()}</Badge>
                  <div className="mt-3 text-[13px] leading-6 text-zinc-400">{snippet}</div>
                </div>
              )),
            )}
          </PanelBody>
        </Panel>
      </div>

      {demoOpen ? (
        <div className="fixed inset-0 z-50 bg-black/92 px-6 py-6 backdrop-blur-sm">
          <div className="grid h-full gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-[18px] border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div className="text-[13px] text-zinc-500">Mock browser · YC W26 application form</div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-400/80" />
                  <span className="size-2 rounded-full bg-amber-300/80" />
                  <span className="size-2 rounded-full bg-green-400/80" />
                </div>
              </div>

              <div className="mt-5 rounded-[14px] border border-zinc-800 bg-black p-5">
                {state.ycQuestions.map((question, index) => {
                  const started = Math.max(0, elapsed - index * 2200);
                  const visibleCharacters = Math.max(0, Math.floor(started / 18));
                  const typedValue = question.answer.slice(0, visibleCharacters);

                  return (
                    <div
                      className="mb-4 rounded-[10px] border border-zinc-800 bg-zinc-950 p-4 last:mb-0"
                      key={question.id}
                    >
                      <div className="text-[12px] uppercase tracking-[0.12em] text-zinc-500">
                        Field {index + 1}
                      </div>
                      <div className="mt-2 text-[13px] text-white">{question.question}</div>
                      <div className="mt-3 min-h-[78px] rounded-[10px] border border-zinc-800 bg-black px-4 py-3 text-[13px] leading-6 text-zinc-400">
                        {typedValue}
                        {started > 0 && typedValue.length < question.answer.length ? (
                          <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-white align-middle" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[18px] border border-zinc-800 bg-zinc-950 p-5">
              <div className="border-b border-zinc-800 pb-4">
                <div className="text-[13px] text-zinc-500">Live action log</div>
                <div className="mt-2 text-[20px] font-medium tracking-[-0.03em] text-white">
                  Agent execution trace
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {visibleLogs.map((item, index) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[10px] border border-zinc-800 bg-black px-4 py-4 text-[13px] text-zinc-300"
                    initial={{ opacity: 0, y: 10 }}
                    key={`${item}-${index}`}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {elapsed >= 12000 ? (
            <div className="fixed inset-x-6 bottom-6 flex items-center justify-between rounded-[16px] border border-zinc-800 bg-zinc-950 px-5 py-4">
              <Button
                onClick={() =>
                  downloadAnswers(
                    state.ycQuestions.map((item) => ({
                      question: item.question,
                      answer: item.answer,
                    })),
                  )
                }
                variant="secondary"
              >
                Download as PDF →
              </Button>
              <Button onClick={() => setDemoOpen(false)} variant="ghost">
                Close
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </PageShell>
  );
}
