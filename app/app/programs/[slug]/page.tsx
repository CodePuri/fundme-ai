"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { state } = useDemo();
  const { slug } = use(params);
  const program = state.opportunities.find((item) => item.slug === slug);

  if (!program) {
    notFound();
  }

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">Program detail</div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold">
            {program.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/56">{program.overview}</p>
        </div>
        <Link href={`/app/workspace/${program.slug}`}>
          <Button>
            Generate Draft
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <div className="flex flex-wrap gap-3">
            <Badge>{program.type}</Badge>
            <Badge>{program.category}</Badge>
            <Badge>{program.fitLabel}</Badge>
          </div>
          <div className="mt-6 text-6xl font-semibold text-cyan-200">{program.fitScore}</div>
          <div className="mt-2 text-sm uppercase tracking-[0.22em] text-white/32">Fit score</div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-sm text-white/48">Why you match</div>
              <div className="mt-4 space-y-3">
                {program.signals.map((signal) => (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72" key={signal}>
                    {signal}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm text-white/48">Gaps to address</div>
              <div className="mt-4 space-y-3">
                {program.gaps.map((gap) => (
                  <div className="rounded-2xl border border-amber-300/16 bg-amber-300/[0.04] px-4 py-3 text-sm text-white/72" key={gap}>
                    {gap}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <div className="text-sm text-white/48">Requirements</div>
            <div className="mt-4 space-y-3">
              {program.requirements.map((requirement) => (
                <div className="flex items-start gap-3" key={requirement}>
                  <CheckCircle2 className="mt-0.5 size-4 text-cyan-200" />
                  <div className="text-sm leading-7 text-white/68">{requirement}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <div className="text-sm text-white/48">Application questions</div>
            <div className="mt-4 space-y-3">
              {state.ycQuestions.map((question) => (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72" key={question.id}>
                  {question.question}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
