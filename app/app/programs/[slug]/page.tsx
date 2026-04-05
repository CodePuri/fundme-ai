"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { ProgramLogo } from "@/components/ui/program-logo";
import { StatusBadge, fitTone, statusTone } from "@/components/ui/status-badge";

function scoreColor(score: number) {
  if (score >= 80) {
    return "text-green-300";
  }
  if (score >= 65) {
    return "text-amber-300";
  }
  return "text-zinc-400";
}

export default function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { state } = useDemo();
  const { slug } = use(params);
  const program = state.opportunities.find((item) => item.slug === slug);

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
        <div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ProgramLogo domain={program.domain} size={48} slug={program.slug} />
            <div>
              <h1 className="text-[38px] font-semibold tracking-[-0.05em]">{program.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge size="sm">{program.type}</Badge>
                <Badge size="sm">{program.location}</Badge>
                <StatusBadge className="text-[11px]" tone={statusTone(program.status)}>
                  {program.status}
                </StatusBadge>
              </div>
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
                <div className="rounded-[10px] border border-[var(--border)] bg-black px-4 py-4 text-[14px] text-[var(--text-muted)]" key={signal}>
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
                Application Preview ({program.questionsCompleted}/{program.questionCount} questions)
              </PanelTitle>
            </PanelHeader>
            <PanelBody className="flex flex-col gap-3">
              {state.ycQuestions.map((question) => (
                <div className="rounded-[10px] border border-[var(--border)] bg-black p-4" key={question.id}>
                  <div className="text-[13px] text-[var(--text-primary)]">{question.question}</div>
                  <div className="mt-3 h-10 rounded-[6px] bg-[var(--surface)]" />
                </div>
              ))}
            </PanelBody>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
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
              {program.requirements.map((item) => (
                <div className="rounded-[10px] border border-[var(--border)] bg-black px-4 py-4 text-[14px] text-[var(--text-muted)]" key={item}>
                  {item}
                </div>
              ))}
            </PanelBody>
          </Panel>

          <Link href={`/app/workspace/${program.slug}`}>
            <Button className="w-full" size="lg">
              Continue to workspace
            </Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
