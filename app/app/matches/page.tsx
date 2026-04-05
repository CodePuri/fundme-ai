"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { ProgramLogo } from "@/components/ui/program-logo";
import { StatusBadge, statusTone } from "@/components/ui/status-badge";

function scoreColor(score: number) {
  if (score >= 80) return "#22c55e";
  if (score >= 65) return "#f59e0b";
  return "#71717a";
}

function AnimatedScore({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(score * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [score]);

  return <>{display}</>;
}

function ScoreBlock({ score, signals }: { score: number; signals: string[] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative text-right"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="text-[52px] font-semibold tracking-[-0.04em]" style={{ color: scoreColor(score) }}>
        <AnimatedScore score={score} />
      </div>
      {hovered ? (
        <div className="absolute right-0 top-full z-10 mt-2 w-[260px] rounded-[12px] border border-zinc-800 bg-zinc-950 p-4 text-left shadow-2xl">
          <div className="text-[12px] font-medium text-white">Why this score</div>
          <ul className="mt-3 list-disc pl-4 text-[12px] leading-6 text-zinc-400">
            {signals.slice(0, 3).map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function MatchesPage() {
  const { state } = useDemo();
  const [hero, ...rest] = [...state.opportunities].sort((a, b) => b.fitScore - a.fitScore);

  return (
    <PageShell>
      <div>
        <div className="eyebrow">Your Matches</div>
        <h1 className="mt-3 text-[38px] font-semibold leading-none tracking-[-0.04em] text-white">
          Your Matches
        </h1>
        <div className="playfair-display mt-3 text-[36px] leading-none tracking-[-0.04em] text-zinc-300">
          Ranked by narrative strength and fit.
        </div>
      </div>

      <Panel className="rounded-[18px] bg-[#0c0c0d] p-6">
        <PanelHeader>
          <div className="max-w-[780px]">
            <div className="flex items-center gap-3">
              <ProgramLogo domain={hero.domain} size={48} slug={hero.slug} />
              <div>
                <div className="display-face text-[42px] leading-none tracking-[-0.04em] text-white">
                  {hero.name}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge size="sm">{hero.type}</Badge>
                  <StatusBadge className="text-[11px]" tone="green">
                    Strong Match
                  </StatusBadge>
                  <StatusBadge className="text-[11px]" tone={statusTone(hero.status)}>
                    {hero.status}
                  </StatusBadge>
                </div>
              </div>
            </div>
            <PanelDescription className="mt-6 max-w-[700px]">{hero.why}</PanelDescription>
          </div>
          <ScoreBlock score={hero.fitScore} signals={hero.signals} />
        </PanelHeader>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        {rest.map((item) => (
          <Panel key={item.slug}>
            <PanelHeader>
              <div className="flex items-start gap-3">
                <ProgramLogo domain={item.domain} size={36} slug={item.slug} />
                <div>
                  <PanelTitle className="text-[24px]">{item.name}</PanelTitle>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge size="sm">{item.type}</Badge>
                    <StatusBadge className="text-[11px]" tone={statusTone(item.status)}>
                      {item.status}
                    </StatusBadge>
                  </div>
                </div>
              </div>
              <ScoreBlock score={item.fitScore} signals={item.signals} />
            </PanelHeader>
            <PanelBody>
              <PanelDescription>{item.why}</PanelDescription>
              <div className="mt-5 flex items-center justify-between gap-4 text-[13px] text-zinc-500">
                <span>{item.deadline}</span>
                <Link href={`/app/programs/${item.slug}`}>
                  <Button variant="ghost">View</Button>
                </Link>
              </div>
            </PanelBody>
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
