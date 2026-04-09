"use client";

import Link from "next/link";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StartupProgramLogo } from "@/components/startup-programs/startup-program-logo";

const applicationSlugs = ["yc-w26", "antler-india", "aws-activate"];

export default function ApplicationsPage() {
  const { state } = useDemo();
  const applications = [
    ...state.opportunities.filter((item) => item.tracked || applicationSlugs.includes(item.slug)),
    ...state.manualTrackerPrograms,
  ];

  return (
    <PageShell>
      <div>
        <div className="eyebrow">In Progress</div>
        <h1 className="mt-3 text-[38px] font-semibold leading-none tracking-[-0.04em] text-[var(--text-primary)]">
          In Progress
        </h1>
        <p className="mt-4 text-[14px] text-[var(--text-muted)]">Your drafts live here. Edit them, finish them, and move them forward.</p>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface)]">
        <div className="grid grid-cols-[1.2fr_0.8fr_1fr_1.2fr_120px] border-b border-[var(--border)] px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
          <div>Program</div>
          <div>Last edited</div>
          <div>Progress</div>
          <div>Status</div>
          <div />
        </div>

        {applications.map((program) => {
          const progress = Math.round((program.questionsCompleted / program.questionCount) * 100);
          const relative =
            program.slug === "yc-w26"
              ? "Last edited 2h ago"
              : program.slug === "antler-india"
                ? "Last edited 1d ago"
                : "Last edited 3d ago";

          return (
            <div
              className="grid grid-cols-[1.2fr_0.8fr_1fr_1.2fr_120px] items-center border-b border-[var(--border)] px-4 py-4 text-[14px] text-[var(--text-muted)] last:border-b-0"
              key={program.slug}
            >
              <div className="flex items-center gap-3">
                <StartupProgramLogo name={program.name} size={36} slug={program.slug} />
                <div>
                <div className="text-[var(--text-primary)]">{program.name}</div>
                <div className="mt-2">
                  <Badge size="sm">{program.type}</Badge>
                </div>
                </div>
              </div>
              <div>{relative}</div>
              <div>
                {program.slug === "antler-india"
                  ? "0 of 12 questions answered"
                  : `${program.questionsCompleted} of ${program.questionCount} questions answered`}
              </div>
              <div className="pr-4">
                <Progress value={program.slug === "antler-india" ? 0 : progress} />
                <div className="mt-2 flex items-center gap-2 text-[12px]">
                  {program.slug === "antler-india" ? (
                    <span className="text-[var(--text-faint)]">Not started</span>
                  ) : null}
                  {program.slug === "aws-activate" ? (
                    <Badge size="sm" tone="green">
                      Complete
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex justify-end">
                <Link href={`/app/workspace/${program.slug}`}>
                  <Button variant="ghost">Continue →</Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
