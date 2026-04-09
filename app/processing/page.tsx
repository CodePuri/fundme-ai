"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";

import { TopNavbar } from "@/components/app/top-navbar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const steps = [
  "Reading your materials",
  "Understanding your story",
  "Building your founder profile",
  "Scoring 50+ opportunities",
];

export default function ProcessingPage() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed((current) => {
        const next = current + 100;
        if (next >= 5000) {
          window.clearInterval(timer);
          return 5000;
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.location.assign("/app/matches");
    }, 5500);

    return () => window.clearTimeout(timeout);
  }, []);

  const activeIndex = useMemo(() => Math.min(steps.length - 1, Math.floor(elapsed / 1200)), [elapsed]);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]" data-theme="app">
      <TopNavbar rightSlot={<div className="text-[13px] text-[var(--text-muted)]">Flowstate AI</div>} />

      <div className="fixed inset-x-0 top-0 z-20 h-0.5 bg-[var(--border)]">
        <motion.div animate={{ width: `${(elapsed / 5000) * 100}%` }} className="h-full bg-[var(--accent-amber)]" initial={{ width: 0 }} />
      </div>

      <div className="page-frame px-4 py-6 sm:px-6 xl:px-8">
        <Link className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]" href="/onboarding">
          ← Back
        </Link>
        <div className="mt-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Onboarding", href: "/onboarding" }, { label: "Processing" }]} />
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-74px)] items-center justify-center px-4">
        <div className="w-full max-w-[760px] text-center">
          <div className="text-[12px] text-[var(--text-muted)]">Flowstate AI</div>
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-[52px] font-semibold tracking-[-0.05em] sm:text-[62px]"
            initial={{ opacity: 0, y: 14 }}
          >
            Finding where you belong...
          </motion.h1>

          <div className="mx-auto mt-10 w-full max-w-[620px] rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 text-left shadow-sm sm:p-7">
            <div className="flex flex-col gap-3">
              {steps.map((step, index) => {
                const done = index < activeIndex || (elapsed >= 5000 && index === steps.length - 1);
                const active = index === activeIndex && elapsed < 5000;

                return (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--bg)] px-4 py-4"
                    initial={{ opacity: 0, y: 12 }}
                    key={step}
                    transition={{ delay: index * 1.2, duration: 0.28 }}
                  >
                    {done ? (
                      <div className="flex size-7 items-center justify-center rounded-full bg-[var(--text-primary)] text-[13px] font-semibold text-[var(--surface)]">
                        ✓
                      </div>
                    ) : active ? (
                      <div className="flex size-7 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--text-primary)]">
                        <LoaderCircle className="size-4 animate-spin" />
                      </div>
                    ) : (
                      <div className="flex size-7 items-center justify-center rounded-full border border-[var(--border)]">
                        <span className="size-2 animate-pulse rounded-full bg-[var(--text-muted)]" />
                      </div>
                    )}
                    <div className="text-[14px] text-[var(--text-primary)]">{step}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
