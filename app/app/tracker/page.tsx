"use client";

import { useMemo } from "react";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Button } from "@/components/ui/button";

const statuses = ["Drafting", "Ready", "Submitted", "Interview", "Accepted", "Rejected"] as const;

export default function TrackerPage() {
  const { state, updateOpportunityStatus } = useDemo();

  const counts = useMemo(() => {
    return statuses.reduce<Record<string, number>>(
      (accumulator, status) => ({
        ...accumulator,
        [status]: state.opportunities.filter((item) => item.status === status).length,
      }),
      { Total: state.opportunities.length },
    );
  }, [state.opportunities]);

  return (
    <PageShell>
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-white/35">Tracker</div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold">
          Application command center
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/56">
          Every program lives in one dashboard so the founder can move from drafting to submitted to
          interview without losing context.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <div className="glass-panel rounded-[28px] p-5">
          <div className="text-sm text-white/45">Total tracked</div>
          <div className="mt-3 text-4xl font-semibold text-white">{counts.Total}</div>
        </div>
        {statuses.map((status) => (
          <div className="glass-panel rounded-[28px] p-5" key={status}>
            <div className="text-sm text-white/45">{status}</div>
            <div className="mt-3 text-4xl font-semibold text-white">{counts[status]}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel overflow-hidden rounded-[32px]">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1fr] border-b border-white/8 px-6 py-4 text-sm text-white/40">
          <div>Program</div>
          <div>Fit</div>
          <div>Deadline</div>
          <div>Status</div>
        </div>

        {state.opportunities.map((item) => (
          <div
            className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1fr] items-center border-b border-white/6 px-6 py-4 last:border-b-0"
            key={item.slug}
          >
            <div>
              <div className="font-medium text-white">{item.name}</div>
              <div className="mt-1 text-sm text-white/45">{item.why}</div>
            </div>
            <div className="text-cyan-200">{item.fitScore}</div>
            <div className="text-white/55">{item.deadline}</div>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <Button
                  className="h-9 rounded-xl px-3"
                  key={status}
                  onClick={() => updateOpportunityStatus(item.slug, status)}
                  variant={item.status === status ? "primary" : "secondary"}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
