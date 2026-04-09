"use client";

import { use, useEffect, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { StartupProgramLogo } from "@/components/startup-programs/startup-program-logo";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { ProgramLogo } from "@/components/ui/program-logo";
import { StatusBadge, fitTone, statusTone } from "@/components/ui/status-badge";
import { createApplicationQuestions } from "@/lib/demo-data";
import { buildOpportunityFromStartupProgram, buildStartupProgramWorkspaceContext } from "@/lib/startup-program-workflow";
import { getStartupProgramByWorkflowSlug } from "@/lib/startup-programs";

function scoreColor(score: number) {
  if (score >= 80) {
    return "text-green-700";
  }
  if (score >= 65) {
    return "text-amber-700";
  }
  return "text-[var(--text-faint)]";
}

export default function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { addTrackerProgram, state } = useDemo();
  const { slug } = use(params);
  const trackedProgram =
    state.opportunities.find((item) => item.slug === slug) ??
    state.manualTrackerPrograms.find((item) => item.slug === slug) ??
    null;
  const startupProgram = getStartupProgramByWorkflowSlug(slug);
  const program = trackedProgram ?? (startupProgram ? buildOpportunityFromStartupProgram(startupProgram) : null);

  useEffect(() => {
    if (!startupProgram) {
      return;
    }

    addTrackerProgram(buildOpportunityFromStartupProgram(startupProgram));
  }, [addTrackerProgram, startupProgram]);

  const startupProgramContext = useMemo(() => {
    if (!startupProgram) {
      return null;
    }

    return buildStartupProgramWorkspaceContext(
      startupProgram,
      state.startupProfile,
      state.founderProfile,
    );
  }, [startupProgram, state.founderProfile, state.startupProfile]);
  const questions = useMemo(() => {
    if (!program) {
      return [];
    }

    return (
      state.applicationSessions[program.slug]?.questions ?? createApplicationQuestions()
    );
  }, [program, state.applicationSessions]);
  const previewQuestionCount = questions.length || program?.questionCount || 0;
  const previewQuestionsCompleted =
    questions.length > 0
      ? questions.filter((question) => question.ready).length
      : program?.questionsCompleted ?? 0;

  if (!program) {
    notFound();
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-3">
        <Link className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]" href="/explore">
          ← Back
        </Link>
        <Breadcrumbs
          items={[
            { label: "Explore", href: "/explore" },
            { label: program.name },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StartupProgramLogo name={startupProgram?.name ?? program.name} size={48} slug={startupProgram?.slug ?? program.slug} />
            <div>
              <h1 className="display-face text-[42px] leading-none tracking-[-0.04em] text-[var(--text-primary)]">{program.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge size="sm">{program.type}</Badge>
                <Badge size="sm">{program.location}</Badge>
                <StatusBadge className="text-[11px]" tone={statusTone(program.status)}>
                  {program.status}
                </StatusBadge>
              </div>
            </div>
          </div>
        
        <div className="text-right">
          <div className={`text-[64px] font-semibold tracking-[-0.06em] ${scoreColor(program.fitScore)}`}>
            {program.fitScore}
          </div>
          <StatusBadge className="text-[11px]" tone={fitTone(program.fitLabel)}>
            {program.fitLabel}
          </StatusBadge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <Panel>
            <PanelHeader className="block">
              <PanelTitle>Why you match</PanelTitle>
            </PanelHeader>
              <PanelBody className="flex flex-col gap-3">
              {program.signals.map((signal) => (
                <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-4 text-[14px] text-[var(--text-muted)]" key={signal}>
                  {signal}
                </div>
              ))}
            </PanelBody>
          </Panel>

          <Panel tone="amber">
            <PanelHeader className="block">
              <PanelTitle className="text-amber-300">Gaps to address in application</PanelTitle>
            </PanelHeader>
            <ul className="mt-4 flex list-disc flex-col gap-3 pl-5 text-[14px] leading-7 text-amber-200">
              {program.gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader className="block">
              <PanelTitle>
                Application Preview ({previewQuestionsCompleted}/{previewQuestionCount} questions)
              </PanelTitle>
            </PanelHeader>
            <PanelBody className="flex flex-col gap-3">
              {questions.map((question) => (
                <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-elevated)] p-4" key={question.id}>
                  <div className="text-[13px] text-[var(--text-primary)]">{question.question}</div>
                  <div className="mt-3 h-10 rounded-[6px] bg-[var(--surface)]/80" />
                </div>
              ))}
            </PanelBody>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {startupProgram ? (
              <a
                className="inline-flex h-11 w-full items-center justify-center rounded-[4px] border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-5 text-sm font-medium text-[var(--button-primary-text)] transition-colors hover:border-[var(--button-primary-border-hover)] hover:bg-[var(--button-primary-bg-hover)]"
                href={startupProgram.apply_url || startupProgram.website_url}
                rel="noreferrer"
                target="_blank"
              >
                Apply
              </a>
            ) : null}

            <Link href={`/app/workspace/${program.slug}`}>
              <Button className="w-full" size="lg">
                Draft Application
              </Button>
            </Link>
            
            {program.slug === "yc-w26" && (
              <Link href={`/app/workspace/${program.slug}`}>
                <Button className="w-full text-[var(--accent-amber)] hover:text-amber-500" variant="secondary" size="lg">
                   <div className="flex items-center justify-center gap-2">
                     <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                     Watch AI fill this for you
                   </div>
                </Button>
              </Link>
            )}
          </div>

          <Panel>
            <PanelHeader className="block">
              <PanelTitle>Program overview</PanelTitle>
            </PanelHeader>
            <PanelDescription className="mt-4">{program.overview}</PanelDescription>
          </Panel>

          <Panel>
            <PanelHeader className="block">
              <PanelTitle>Requirements</PanelTitle>
            </PanelHeader>
            <PanelBody className="flex flex-col gap-3">
              {(startupProgramContext?.requirements ?? program.requirements).map((item) => (
                <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-4 text-[14px] text-[var(--text-muted)]" key={item}>
                  {item}
                </div>
              ))}
            </PanelBody>
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}
