import Link from "next/link";
import { ArrowRight, FileSearch, FileText, LayoutDashboard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const valueCards = [
  {
    title: "Understand the startup fast",
    copy: "Turn messy decks, old answers, and founder notes into a clean operating profile.",
    icon: FileText,
  },
  {
    title: "Rank where to apply",
    copy: "See accelerator, incubator, fellowship, and grant-style opportunities ranked by fit.",
    icon: FileSearch,
  },
  {
    title: "Track one serious pipeline",
    copy: "Move from draft to submission to interview in one founder workbench.",
    icon: LayoutDashboard,
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 sm:px-10">
      <div className="grid-fade pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col">
        <header className="flex items-center justify-between py-4">
          <div className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
            Fundme.ai
          </div>
          <Badge>Demo workflow</Badge>
        </header>

        <section className="grid flex-1 items-center gap-16 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="mb-6">
              <Badge className="border-cyan-300/20 bg-cyan-300/8 text-cyan-100">
                Founder application operating system
              </Badge>
            </div>
            <div className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              Drop your startup materials. Find where to apply. Draft faster.
            </div>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/68">
              Fundme.ai turns messy startup context into a polished founder profile, ranked
              opportunities, tailored drafts, and one serious tracker for every application.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/login">
                <Button className="px-6">
                  Start
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <div className="text-sm text-white/45">
                Hardcoded premium demo. Built for believable screen recordings.
              </div>
            </div>
          </div>

          <div className="glass-panel relative overflow-hidden rounded-[40px] p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-300/12 to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between border-b border-white/8 pb-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/35">
                    Live workflow
                  </div>
                  <div className="mt-2 text-2xl font-semibold">Flowstate AI</div>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  96 Match Score
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div className="rounded-[28px] border border-white/8 bg-[#0b1018] p-5">
                  <div className="text-sm text-white/45">Extracted startup context</div>
                  <div className="mt-3 text-xl font-semibold">
                    Contract intelligence for digital agencies
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    Detects scope creep in real time and drafts change orders before agencies lose
                    revenue on silent expansion work.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                    <div className="text-sm text-white/45">Best path</div>
                    <div className="mt-3 text-lg font-semibold">Y Combinator W26</div>
                    <div className="mt-2 text-sm text-white/62">
                      Strong founder-market fit, urgent wedge, credible early pull.
                    </div>
                  </div>
                  <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                    <div className="text-sm text-white/45">Draft status</div>
                    <div className="mt-3 text-lg font-semibold">3 answers ready</div>
                    <div className="mt-2 text-sm text-white/62">
                      Gmail sync can update tracker to Submitted and Interview instantly.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-t border-white/8 py-8 md:grid-cols-3">
          {valueCards.map(({ title, copy, icon: Icon }) => (
            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6" key={title}>
              <Icon className="size-5 text-cyan-200" />
              <div className="mt-4 text-lg font-semibold text-white">{title}</div>
              <p className="mt-2 text-sm leading-7 text-white/56">{copy}</p>
            </div>
          ))}
        </section>

        <footer className="border-t border-white/8 py-5 text-sm text-white/35">
          Fundme.ai demo for premium founder workflow storytelling.
        </footer>
      </div>
    </main>
  );
}
