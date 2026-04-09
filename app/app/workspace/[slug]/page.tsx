"use client";

import { use, useEffect, useMemo } from "react";
import { notFound } from "next/navigation";

import { ApplicationWorkspaceView } from "@/components/application/application-workspace-view";
import { useDemo } from "@/components/app/demo-provider";
import { StartupProgramLogo } from "@/components/startup-programs/startup-program-logo";
import { createApplicationQuestions } from "@/lib/demo-data";
import { buildOpportunityFromStartupProgram, buildStartupProgramWorkspaceContext } from "@/lib/startup-program-workflow";
import { getStartupProgramByWorkflowSlug } from "@/lib/startup-programs";

export default function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const {
    state,
    addTrackerProgram,
    cycleAnswerVariant,
    ensureApplicationSession,
    markReady,
    saveAnswer,
  } = useDemo();
  const { slug } = use(params);
  const trackedProgram =
    state.opportunities.find((item) => item.slug === slug) ??
    state.manualTrackerPrograms.find((item) => item.slug === slug) ??
    null;
  const startupProgram = getStartupProgramByWorkflowSlug(slug);
  const program = trackedProgram ?? (startupProgram ? buildOpportunityFromStartupProgram(startupProgram) : null);

  useEffect(() => {
    if (!program) {
      return;
    }

    ensureApplicationSession(program.slug);
    if (startupProgram) {
      addTrackerProgram(buildOpportunityFromStartupProgram(startupProgram));
    }
  }, [addTrackerProgram, ensureApplicationSession, program, startupProgram]);

  const questions = useMemo(() => {
    if (!program) {
      return [];
    }

    return (
      state.applicationSessions[program.slug]?.questions ?? createApplicationQuestions()
    );
  }, [program, state.applicationSessions]);

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

  if (!program) {
    notFound();
  }

  const displayProgramName = program.name === "YC W26" ? "Y Combinator" : program.name;

  return (
    <ApplicationWorkspaceView
      backHref="/app/applications"
      backLabel="← Back"
      breadcrumbs={[
        { label: "Applications", href: "/app/applications" },
        { label: displayProgramName, href: `/app/programs/${program.slug}` },
        { label: "Workspace" },
      ]}
      contextCards={
        startupProgramContext?.contextCards ?? [
          {
            label: "What this program values",
            text: program.overview,
          },
          {
            label: "Why this is a fit",
            text: program.why,
          },
        ]
      }
      externalApplyHref={startupProgram?.apply_url || startupProgram?.website_url}
      fitSummary={startupProgramContext?.fitSummary ?? program.why}
      gaps={startupProgramContext?.gaps ?? program.gaps}
      logo={
        <StartupProgramLogo name={startupProgram?.name ?? displayProgramName} size={44} slug={startupProgram?.slug ?? program.slug} />
      }
      onCycleAnswer={(questionId) => cycleAnswerVariant(program.slug, questionId)}
      onMarkReady={(questionId) => markReady(program.slug, questionId)}
      onSaveAnswer={(questionId, answer) => saveAnswer(program.slug, questionId, answer)}
      programName={displayProgramName}
      programSubtitle={
        startupProgramContext
          ? `${startupProgramContext.subtitle} · Draft application`
          : "Application Workspace"
      }
      questions={questions}
      requirements={startupProgramContext?.requirements ?? program.requirements}
      status={program.status}
    />
  );
}
