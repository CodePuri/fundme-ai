"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { PageShell } from "@/components/app/page-shell";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from "@/components/ui/panel";
import { StatusBadge, statusTone } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { type ApplicationQuestion, type ProgramStatus } from "@/lib/demo-data";
import { formatTimestamp, wordCount } from "@/lib/utils";

const DEFAULT_LOGS = [
  "Opening the program application portal",
  "Reading founder profile and startup context",
  "Selecting the strongest one-line company description",
  "Drafting the first answer in program-specific voice constraints",
  "Typing answer into the first form field",
  "Reading traction and recovered revenue proof",
  "Drafting the long-form product answer",
  "Typing the final pass into the application form",
];

function buildDemoLog(programName: string) {
  return [
    `Opening ${programName} application portal`,
    ...DEFAULT_LOGS.slice(1),
  ];
}

function sanitizeDownloadFileName(programName: string) {
  return `${programName.replace(/[^a-z0-9]+/gi, "_")}_Flowstate_AI_Draft.txt`;
}

function downloadAnswers(fileName: string, answers: Array<{ question: string; answer: string }>) {
  const body = answers.map((item, index) => `${index + 1}. ${item.question}\n${item.answer}`).join("\n\n");
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type WorkspaceBreadcrumb = {
  label: string;
  href?: string;
};

type WorkspaceContextCard = {
  label: string;
  text: string;
};

type ApplicationWorkspaceViewProps = {
  backHref: string;
  backLabel: string;
  breadcrumbs: WorkspaceBreadcrumb[];
  programName: string;
  programSubtitle: string;
  status: ProgramStatus;
  logo: ReactNode;
  questions: ApplicationQuestion[];
  fitSummary: string;
  requirements: string[];
  gaps: string[];
  contextCards: WorkspaceContextCard[];
  onCycleAnswer: (questionId: string) => void;
  onSaveAnswer: (questionId: string, answer: string) => void;
  onMarkReady: (questionId: string) => void;
  externalApplyHref?: string;
};

export function ApplicationWorkspaceView({
  backHref,
  backLabel,
  breadcrumbs,
  programName,
  programSubtitle,
  status,
  logo,
  questions,
  fitSummary,
  requirements,
  gaps,
  contextCards,
  onCycleAnswer,
  onSaveAnswer,
  onMarkReady,
  externalApplyHref,
}: ApplicationWorkspaceViewProps) {
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

  const demoLog = useMemo(() => buildDemoLog(programName), [programName]);

  const visibleLogs = useMemo(
    () => demoLog.slice(0, Math.min(demoLog.length, Math.floor(elapsed / 1500))),
    [demoLog, elapsed],
  );

  return (
    <PageShell>
      <div className="flex flex-col gap-3">
        <Link className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]" href={backHref}>
          {backLabel}
        </Link>
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {logo}
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[38px] leading-none tracking-[-0.04em] text-[var(--text-primary)]">
              {programName}
            </h1>
            <div className="mt-2 text-[14px] text-[var(--text-muted)]">{programSubtitle}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {externalApplyHref ? (
            <a
              className="inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text-primary)] transition-colors duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-ring-offset)]"
              href={externalApplyHref}
              rel="noreferrer"
              target="_blank"
            >
              Open application
            </a>
          ) : null}
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
          <StatusBadge className="text-[11px]" tone={statusTone(status)}>
            {status}
          </StatusBadge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="flex flex-col gap-5">
          {questions.map((question) => (
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
                  onChange={(event) => onSaveAnswer(question.id, event.target.value)}
                  value={question.answer}
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--text-faint)]">
                    <span>{wordCount(question.answer)} words</span>
                    <span>{question.answer.length} chars</span>
                    <span>Last saved {formatTimestamp(question.lastSaved)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => onCycleAnswer(question.id)} variant="ghost">
                      Regenerate
                    </Button>
                    <Button onClick={() => onSaveAnswer(question.id, question.answer)} variant="secondary">
                      Save Draft
                    </Button>
                    <Button onClick={() => onMarkReady(question.id)} variant="primary">
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
            <PanelTitle className="text-[12px] uppercase tracking-[0.14em]">Application Context</PanelTitle>
          </PanelHeader>
          <PanelBody className="flex flex-col gap-3">
            <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
              <Badge size="sm">Why this program</Badge>
              <div className="mt-3 text-[13px] leading-6 text-[var(--text-muted)]">{fitSummary}</div>
            </div>

            <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
              <Badge size="sm">Requirements</Badge>
              <ul className="mt-3 list-disc pl-4 text-[13px] leading-6 text-[var(--text-muted)]">
                {requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
              <Badge size="sm">Gaps to address</Badge>
              <ul className="mt-3 list-disc pl-4 text-[13px] leading-6 text-[var(--text-muted)]">
                {gaps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {contextCards.map((card) => (
              <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-elevated)] p-4" key={card.label}>
                <Badge size="sm">{card.label}</Badge>
                <div className="mt-3 text-[13px] leading-6 text-[var(--text-muted)]">{card.text}</div>
              </div>
            ))}

            {questions.flatMap((question) =>
              question.sourceSnippets.map((snippet) => (
                <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-elevated)] p-4" key={`${question.id}-${snippet}`}>
                  <Badge size="sm">{question.id.toUpperCase()}</Badge>
                  <div className="mt-3 text-[13px] leading-6 text-[var(--text-muted)]">{snippet}</div>
                </div>
              )),
            )}
          </PanelBody>
        </Panel>
      </div>

      {demoOpen ? (
        <div className="fixed inset-0 z-50 bg-[rgba(17,17,17,0.18)] px-6 py-6 backdrop-blur-sm">
          <div className="grid h-full gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg)] p-5 shadow-[0_24px_80px_rgba(17,17,17,0.12)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <div className="text-[13px] text-[var(--text-faint)]">Mock browser · {programName} application form</div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-400/80" />
                  <span className="size-2 rounded-full bg-amber-300/80" />
                  <span className="size-2 rounded-full bg-green-400/80" />
                </div>
              </div>

              <div className="mt-5 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5">
                {questions.map((question, index) => {
                  const started = Math.max(0, elapsed - index * 2200);
                  const visibleCharacters = Math.max(0, Math.floor(started / 18));
                  const typedValue = question.answer.slice(0, visibleCharacters);

                  return (
                    <div
                      className="mb-4 rounded-[10px] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 last:mb-0"
                      key={question.id}
                    >
                      <div className="text-[12px] uppercase tracking-[0.12em] text-[var(--text-faint)]">
                        Field {index + 1}
                      </div>
                      <div className="mt-2 text-[13px] text-[var(--text-primary)]">{question.question}</div>
                      <div className="mt-3 min-h-[78px] rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[13px] leading-6 text-[var(--text-muted)]">
                        {typedValue}
                        {started > 0 && typedValue.length < question.answer.length ? (
                          <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-[var(--text-primary)] align-middle" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg)] p-5 shadow-[0_24px_80px_rgba(17,17,17,0.12)]">
              <div className="border-b border-[var(--border)] pb-4">
                <div className="text-[13px] text-[var(--text-faint)]">Live action log</div>
                <div className="mt-2 text-[20px] font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                  Agent execution trace
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {visibleLogs.map((item, index) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-[13px] text-[var(--text-primary)]"
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
            <div className="fixed inset-x-6 bottom-6 flex items-center justify-between rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[0_18px_40px_rgba(17,17,17,0.08)]">
              <Button
                onClick={() =>
                  downloadAnswers(
                    sanitizeDownloadFileName(programName),
                    questions.map((item) => ({
                      question: item.question,
                      answer: item.answer,
                    })),
                  )
                }
                variant="secondary"
              >
                Download answers →
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
