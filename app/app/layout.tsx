"use client";

import { useMemo } from "react";
import { Menu, Sparkles } from "lucide-react";

import { useDemo } from "@/components/app/demo-provider";
import { Sidebar } from "@/components/app/sidebar";
import { Badge } from "@/components/ui/badge";
import { formatTimestamp } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { state } = useDemo();

  const readyCount = useMemo(
    () => state.ycQuestions.filter((question) => question.ready).length,
    [state.ycQuestions],
  );

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="flex-1">
        <header className="sticky top-0 z-20 border-b border-white/8 bg-[#07090d]/85 px-6 py-4 backdrop-blur xl:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 lg:hidden">
                <Menu className="size-4" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-white/35">
                  Founder workflow
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  Flowstate AI application command center
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-cyan-300/20 bg-cyan-300/8 text-cyan-100">
                <Sparkles className="mr-2 size-3" />
                {readyCount} YC answers ready
              </Badge>
              <Badge>Last sync {formatTimestamp(state.lastSyncAt)}</Badge>
            </div>
          </div>
        </header>

        <main className="px-6 py-8 xl:px-10">{children}</main>
      </div>
    </div>
  );
}
