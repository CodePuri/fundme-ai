"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatTimestamp, wordCount } from "@/lib/utils";

export default function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { state, cycleAnswerVariant, markReady, saveAnswer } = useDemo();
  const [loading, setLoading] = useState(true);
  const { slug } = use(params);

  const program = state.opportunities.find((item) => item.slug === slug);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  if (!program) {
    notFound();
  }

  return (
    <PageShell>
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-white/35">Application workspace</div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold">
          Tailored draft for {program.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/56">
          This is the intelligence payoff moment: generated answers, editability, source grounding,
          and ready-state tracking in one serious workspace.
        </p>
      </div>

      <div className="space-y-5">
        {state.ycQuestions.map((question, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[32px] p-6"
            initial={{ opacity: 0, y: 14 }}
            key={question.id}
            transition={{ delay: index * 0.06 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm text-white/45">Question {index + 1}</div>
                <div className="mt-2 text-xl font-semibold text-white">{question.question}</div>
              </div>
              <div className="text-right text-sm text-white/42">
                <div>{wordCount(question.answer)} words</div>
                <div className="mt-1">Last saved {formatTimestamp(question.lastSaved)}</div>
              </div>
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-40 w-full rounded-[28px]" />
              </div>
            ) : (
              <>
                <Textarea
                  className="mt-6 min-h-48"
                  onChange={(event) => saveAnswer(question.id, event.target.value)}
                  value={question.answer}
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  {question.sourceSnippets.map((snippet) => (
                    <div
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/55"
                      key={snippet}
                    >
                      {snippet}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => cycleAnswerVariant(question.id)}>
                    Regenerate
                  </Button>
                  <Button variant="secondary" onClick={() => saveAnswer(question.id, question.answer)}>
                    Save Draft
                  </Button>
                  <Button onClick={() => markReady(question.id)}>
                    {question.ready ? "Ready" : "Mark as Ready"}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}
