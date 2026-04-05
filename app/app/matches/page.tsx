"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function FitBar({ score }: { score: number }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
      <motion.div
        animate={{ width: `${score}%` }}
        className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
        initial={{ width: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </div>
  );
}

export default function MatchesPage() {
  const { state } = useDemo();
  const matches = [...state.opportunities].sort((a, b) => b.fitScore - a.fitScore);

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">Ranked matches</div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold">
            Where Flowstate AI should apply next
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/56">
            Opportunities are ranked for speed, fit, and founder narrative strength. The YC path is
            intentionally the hero route in this demo.
          </p>
        </div>
        <Link href="/app/programs/yc-w26">
          <Button>Open Y Combinator</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {matches.map((item, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[28px] p-6"
            initial={{ opacity: 0, y: 16 }}
            key={item.slug}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-2xl font-semibold text-white">{item.name}</div>
                  <Badge>{item.type}</Badge>
                  <Badge>{item.category}</Badge>
                  <Badge>{item.status}</Badge>
                </div>
                <div className="mt-3 max-w-2xl text-sm leading-7 text-white/58">{item.why}</div>
              </div>
              <div className="min-w-36 text-right">
                <div className="text-sm text-white/40">{item.fitLabel}</div>
                <div className="mt-2 text-4xl font-semibold text-cyan-200">{item.fitScore}</div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/32">Fit score</div>
              </div>
            </div>
            <FitBar score={item.fitScore} />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm text-white/48">
              <div>Deadline {item.deadline}</div>
              <Link href={`/app/programs/${item.slug}`}>
                <Button variant="secondary">View program</Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}
