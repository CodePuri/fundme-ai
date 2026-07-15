"use client";

import { useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const PREVIEWS = [
  { id: "pitch", label: "One-line pitch", title: "A sharper investor-facing pitch", detail: "Customer, mechanism, outcome, and proof compressed into one defensible sentence." },
  { id: "profile", label: "Founder profile", title: "A credibility-first founder opening", detail: "Role, authority signal, and founder-market bridge rewritten around your submitted facts." },
  { id: "deck", label: "Deck story", title: "A repaired funding narrative", detail: "Section order, missing proof, and slide-level priorities mapped into a clean story arc." },
] as const;

export function LockedOptimization() {
  const [active, setActive] = useState<(typeof PREVIEWS)[number]["id"]>("pitch");
  const preview = PREVIEWS.find((item) => item.id === active) ?? PREVIEWS[0];
  return (
    <section className="overflow-hidden rounded-lg border border-[#ff6b3d]/35 bg-[#171513] text-white">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#ff9b7b]"><Sparkles aria-hidden="true" className="size-4" />OPTIMIZE MY FUNDING FIT</div>
          <h2 className="mt-2 text-2xl font-semibold">Turn the Grill into finished materials.</h2>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ff6b3d]/40 bg-[#ff6b3d]/10 px-3 py-1.5 text-xs font-bold text-[#ffb49d]"><LockKeyhole aria-hidden="true" className="size-3.5" />Coming in Early Access</span>
      </div>
      <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="border-b border-white/10 p-3 md:border-b-0 md:border-r">
          {PREVIEWS.map((item) => (
            <button className={cn("flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors", active === item.id ? "bg-white text-[#171513]" : "text-white/60 hover:bg-white/8 hover:text-white")} key={item.id} onClick={() => setActive(item.id)} type="button">
              {item.label}<ArrowRight aria-hidden="true" className="size-3.5" />
            </button>
          ))}
        </div>
        <div className="relative min-h-56 p-6 sm:p-8">
          <div className="max-w-xl select-none blur-[3px]" aria-hidden="true">
            <p className="text-xs font-bold text-white/45">DRAFT REWRITE</p>
            <h3 className="mt-3 text-2xl font-semibold">{preview.title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/65">{preview.detail}</p>
            <div className="mt-6 h-2 w-full rounded-full bg-white/10" />
            <div className="mt-3 h-2 w-4/5 rounded-full bg-white/10" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-[#171513]/30 p-6 text-center">
            <div><LockKeyhole aria-hidden="true" className="mx-auto size-6 text-[#ff9b7b]" /><p className="mt-3 text-sm font-bold">Preview locked</p><p className="mt-1 text-xs leading-5 text-white/55">No payment is collected in this demo.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
