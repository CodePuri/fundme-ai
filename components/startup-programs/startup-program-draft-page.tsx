"use client";

import { useEffect, useMemo } from "react";
import { notFound } from "next/navigation";

import { ApplicationWorkspaceView } from "@/components/application/application-workspace-view";
import { useDemo } from "@/components/app/demo-provider";
import { StartupProgramLogo } from "@/components/startup-programs/startup-program-logo";
import { createApplicationQuestions } from "@/lib/demo-data";
import { buildOpportunityFromStartupProgram, buildStartupProgramWorkspaceContext } from "@/lib/startup-program-workflow";
import { getStartupProgramBySlug } from "@/lib/startup-programs";

export function StartupProgramDraftPage({ slug }: { slug: string }) {
  const { state, addTrackerProgram, cycleAnswerVariant, ensureApplicationSession, markReady, saveAnswer } =
    useDemo();
  const program = getStartupProgramBySlug(slug);

  useEffect(() => {
    if (!program) {
      return;
    }

    ensureApplicationSession(program.workflow_slug);
    addTrackerProgram(buildOpportunityFromStartupProgram(program));
  }, [addTrackerProgram, ensureApplicationSession, program]);

  const trackedProgram = useMemo(() => {
    if (!program) {
      return null;
    }

    return (
      state.opportunities.find((item) => item.slug === program.workflow_slug) ??
      state.manualTrackerPrograms.find((item) => item.slug === program.workflow_slug) ??
      buildOpportunityFromStartupProgram(program)
    );
  }, [program, state.manualTrackerPrograms, state.opportunities]);

  const workspaceContext = useMemo(() => {
    if (!program) {
      return null;
    }

    return buildStartupProgramWorkspaceContext(
      program,
      state.startupProfile,
      state.founderProfile,
    );
  }, [program, state.founderProfile, state.startupProfile]);

  const questions = useMemo(() => {
    if (!program) {
      return [];
    }

    return state.applicationSessions[program.workflow_slug]?.questions ?? createApplicationQuestions();
  }, [program, state.applicationSessions]);

  if (!program || !trackedProgram || !workspaceContext) {
    notFound();
  }

  return (
    <ApplicationWorkspaceView
      backHref="/search"
      backLabel="← Back to startup programs"
      breadcrumbs={[
        { label: "Startup Programs", href: "/search" },
        { label: program.name },
        { label: "Draft application" },
      ]}
      contextCards={workspaceContext.contextCards}
      externalApplyHref={program.apply_url || program.website_url}
      fitSummary={workspaceContext.fitSummary}
      gaps={workspaceContext.gaps}
      logo={<StartupProgramLogo name={program.name} size={52} slug={program.slug} />}
      onCycleAnswer={(questionId) => cycleAnswerVariant(program.workflow_slug, questionId)}
      onMarkReady={(questionId) => markReady(program.workflow_slug, questionId)}
      onSaveAnswer={(questionId, answer) => saveAnswer(program.workflow_slug, questionId, answer)}
      programName={program.name}
      programSubtitle={`${workspaceContext.subtitle} · Draft application`}
      questions={questions}
      requirements={workspaceContext.requirements}
      status={trackedProgram.status}
    />
  );
}
