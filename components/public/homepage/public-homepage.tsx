"use client";

import { Suspense, type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  FilePenLine,
  Menu,
  Target,
  Upload,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { PublicAuthController } from "@/components/public/public-auth-controller";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { buildAuthEntryHref } from "@/lib/auth-intent";
import { cn } from "@/lib/utils";

import {
  ecosystemPrograms,
  homepageStats,
  matchedPrograms,
  proofHighlights,
  proofStages,
  proofTrackerSummary,
  proofWhyItems,
  storySteps,
} from "./homepage-data";
import { ProgramMark } from "./program-mark";

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: EASE },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const navItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Programs", href: "#matched-programs" },
  { label: "For Founders", href: "#product-proof" },
  { label: "Explore", href: "/explore" },
] as const;

const stepIcons = {
  upload: Upload,
  match: Target,
  draft: FilePenLine,
} as const;

/* ─── Utility ───────────────────────────────────────────────────── */

function SectionReveal({ children, className }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      transition={{ duration: 0.7, ease: EASE }}
      viewport={{ once: true, amount: 0.2 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── 1. Header ─────────────────────────────────────────────────── */

function Header({ onOpenAuth }: { onOpenAuth: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e7ddd0] bg-[#f6f1ea]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 py-4 sm:px-6 xl:px-8">
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <BrandLockup />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link className="text-[14px] text-[#5f584f] transition-colors hover:text-[#171513]" href={item.href} key={item.label}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            className="rounded-full bg-[#ff6b3d] px-5 py-2.5 text-[14px] font-medium text-white shadow-[0_10px_28px_rgba(255,107,61,0.22)] transition-colors hover:bg-[#f45d2e]"
            onClick={onOpenAuth}
            type="button"
          >
            Request Invite →
          </button>
        </div>

        <button
          aria-label="Toggle navigation"
          className="flex size-10 items-center justify-center rounded-full border border-black/8 text-[#171513] md:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-black/8 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                className="rounded-2xl px-3 py-2 text-[14px] text-[#171513] transition-colors hover:bg-white"
                href={item.href}
                key={item.label}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              className="mt-2 rounded-2xl bg-[#ff6b3d] px-4 py-3 text-left text-[14px] font-medium text-white"
              onClick={() => {
                setMenuOpen(false);
                onOpenAuth();
              }}
              type="button"
            >
              Request Invite
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/* ─── 2. Hero ────────────────────────────────────────────────────── */

function HomepageHero({ onOpenAuth }: { onOpenAuth: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,rgba(255,107,61,0.14),transparent_68%)]" />
      <div className="absolute left-1/2 top-[120px] h-[460px] w-[880px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),rgba(255,255,255,0))] blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent_22%,transparent_100%)]" />

      <div className="relative mx-auto max-w-[1240px] px-4 pb-16 sm:px-6 xl:px-8">
        <motion.div
          animate="visible"
          className="relative flex min-h-[560px] items-center justify-center sm:min-h-[620px]"
          initial={shouldReduceMotion ? false : "hidden"}
          variants={stagger}
        >
          <div className="relative z-20 flex max-w-[940px] flex-col items-center text-center">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white/92 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8b8276] shadow-[0_10px_26px_rgba(18,15,11,0.05)] backdrop-blur"
              variants={fadeUp}
            >
              <span className="inline-block size-2 rounded-full bg-[#ff6b3d]" />
              Matched against real startup programs
            </motion.div>

            <motion.h1
              className="mt-8 max-w-[980px] text-[clamp(3.15rem,5.4vw,4rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-[#171513] [text-wrap:balance]"
              variants={fadeUp}
            >
              <span className="block">Stop pitching blind.</span>
              <span className="mt-2 block lg:whitespace-nowrap">Start applying where you actually fit.</span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-6 max-w-[560px] text-[17px] leading-[1.85] text-[#645d54] sm:text-[18px]"
              variants={fadeUp}
            >
              Fundme turns your deck, notes, and traction into an application base, shows the programs that actually
              fit, drafts the right angle for each one, and keeps every deadline in one place.
            </motion.p>

            <motion.div className="mt-10 flex flex-col items-center gap-3 sm:flex-row" variants={fadeUp}>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-[#171513] px-6 py-3.5 text-[15px] font-medium text-white shadow-[0_18px_40px_rgba(18,15,11,0.14)] transition-colors hover:bg-[#2a2622]"
                onClick={onOpenAuth}
                type="button"
              >
                Get Started
                <ArrowRight className="size-4" />
              </button>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-6 py-3.5 text-[15px] font-medium text-[#171513] transition-colors hover:bg-white"
                href="#how-it-works"
              >
                See how it works
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── 3. Marquee logo rail ──────────────────────────────────────── */

function LogoRailCard({
  name,
  label,
  mark,
  slug,
  id,
}: (typeof ecosystemPrograms)[number]) {
  return (
    <div className="flex min-w-[220px] items-center gap-4 rounded-[26px] border border-black/8 bg-white/90 px-5 py-4 shadow-[0_10px_28px_rgba(18,15,11,0.05)] backdrop-blur-sm">
      <ProgramMark
        className="shadow-[0_10px_24px_rgba(18,15,11,0.06)]"
        program={{ id, mark, name, slug }}
        size={40}
      />
      <div className="min-w-0">
        <div className="text-[14px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#171513]">{name}</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#8b8276]">{label}</div>
      </div>
    </div>
  );
}

function LogoRailSection() {
  return (
    <section className="relative border-y border-[#e3d6c7] bg-[#eee3d6] py-6">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 xl:px-8">
        <div className="text-center text-[11px] uppercase tracking-[0.22em] text-[#8b8276]">Programs already in the room</div>
      </div>

      <div className="logo-rail-viewport relative mt-5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#eee3d6] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#eee3d6] to-transparent sm:w-24" />

        <div className="logo-rail-strip px-4 sm:px-6 xl:px-8">
          {ecosystemPrograms.map((program) => (
            <LogoRailCard key={program.id} {...program} />
          ))}
        </div>

        <div aria-hidden="true" className="logo-rail-strip logo-rail-strip--duplicate px-4 sm:px-6 xl:px-8">
          {ecosystemPrograms.map((program) => (
            <LogoRailCard key={`${program.id}-duplicate`} {...program} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. Stats strip ──────────────────────────────────────────── */

function StatsStrip() {
  return (
    <section className="border-b border-[#d9cebf] bg-[#f1e8dc] px-4 py-14 sm:px-6 xl:px-8">
      <SectionReveal className="mx-auto max-w-[1180px]">
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
          {homepageStats.map((stat, index) => (
            <div
              className={cn(
                "px-0 py-2 xl:px-8",
                index < homepageStats.length - 1 && "xl:border-r xl:border-black/8",
              )}
              key={stat.value}
            >
              <div className="text-[34px] font-semibold leading-[0.92] tracking-[-0.05em] text-[#171513]">{stat.value}</div>
              <div className="mt-3 max-w-[250px] text-[14px] leading-6 text-[#6f6559]">{stat.label}</div>
            </div>
          ))}
        </div>
      </SectionReveal>
    </section>
  );
}

/* ─── 5. How it works ─────────────────────────────────────────── */

function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="scroll-mt-28 border-b border-[#e7ddd0] bg-[#f8f3ec] px-4 py-20 sm:px-6 xl:px-8" id="how-it-works">
      <SectionReveal className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-[700px] text-center">
          <div className="text-[12px] uppercase tracking-[0.22em] text-[#b15d37]">How it works</div>
          <h2 className="mt-4 text-[40px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171513] sm:text-[48px]">
            From scattered pitch decks to matched applications.
          </h2>
          <p className="mx-auto mt-5 max-w-[580px] text-[16px] leading-8 text-[#645d54]">
            Upload once. See where you fit. Draft in your value. This is the system founders wish existed before they started rebuilding the same company story in every new form.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-3 lg:gap-0">
          {storySteps.map((step, index) => {
            const Icon = stepIcons[step.id as keyof typeof stepIcons];

            return (
              <motion.div
                className={cn(
                  "relative pt-8 lg:px-10",
                  index < storySteps.length - 1 && "lg:border-r lg:border-black/8",
                )}
                key={step.id}
                transition={{ duration: 0.18 }}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
              >
                <div className="absolute left-0 top-0 h-px w-16 bg-[#d9cbbd]" />
                <div className="text-[12px] font-medium tracking-[0.18em] text-[#b15d37]">{step.eyebrow}</div>
                <div className="mt-7 flex size-11 items-center justify-center rounded-2xl border border-black/8 bg-white/84 shadow-[0_10px_24px_rgba(18,15,11,0.04)]">
                  <Icon className="size-5 text-[#171513]" />
                </div>
                <h3 className="mt-6 max-w-[250px] text-[30px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#171513]">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-[300px] text-[15px] leading-7 text-[#645d54]">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </SectionReveal>
    </section>
  );
}

/* ─── 6. Product proof — one dominant visual ────────────────────── */

function ProductProofSection() {
  return (
    <section className="scroll-mt-28 border-b border-[#d4c4b3] bg-[#eae0d2] px-4 py-20 sm:px-6 xl:px-8" id="product-proof">
      <SectionReveal className="mx-auto max-w-[1180px]">
        <div className="mx-auto mb-12 max-w-[640px] text-center">
          <div className="text-[12px] uppercase tracking-[0.22em] text-[#b15d37]">Why this matters</div>
          <h2 className="mt-4 text-[42px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171513] sm:text-[48px]">
            Your time is worth more than application admin.
          </h2>
          <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-8 text-[#645d54]">
            Your best work is building, selling, and shipping. Not rewriting the same startup story across decks, docs, drafts, and deadlines.
          </p>
          <p className="mx-auto mt-3 max-w-[560px] text-[16px] leading-8 text-[#645d54]">
            Let Fundme take one startup narrative and turn it into matched applications, shortlists, deadlines, and follow-ups while you keep building the actual company.
          </p>
        </div>

        {/* Startup context pills */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-[#d4c4b3] bg-white/60 px-3.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.12em] text-[#8b8276]">Startup Context</span>
          <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 text-[13px] text-[#645d54]">AI contract intelligence</span>
          <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 text-[13px] text-[#645d54]">Pre-seed</span>
          <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 text-[13px] text-[#645d54]">Agency workflow pain</span>
          <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 text-[13px] text-[#645d54]">87 signups</span>
          <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 text-[13px] text-[#645d54]">3 pilots</span>
        </div>

        {/* Main proof surface */}
        <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_30px_80px_rgba(18,15,11,0.09)]">
          {/* Top bar */}
          <div className="flex flex-col gap-3 border-b border-black/8 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Application operating layer</div>
              <div className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.04em] text-[#171513] sm:text-[26px]">
                Everything in one place
              </div>
            </div>
            <div className="rounded-full border border-black/8 bg-[#faf4ec] px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#8b8276]">
              One working surface
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[1.08fr_0.92fr]">
            {/* Left: summary + proof highlights */}
            <div className="px-6 py-6 sm:px-8">
              {/* KPI row */}
              <div className="grid gap-0 border-b border-black/8 pb-6 sm:grid-cols-4">
                {proofTrackerSummary.map((item, index) => (
                  <div className={cn(index < proofTrackerSummary.length - 1 && "sm:border-r sm:border-black/8 sm:pr-5", index > 0 && "sm:pl-5")} key={item.subtitle}>
                    <div className="text-[24px] font-semibold tracking-[-0.04em] text-[#171513]">{item.title}</div>
                    <div className="mt-1.5 text-[13px] font-medium text-[#4a4540]">{item.subtitle}</div>
                    <div className="mt-1 text-[12px] leading-5 text-[#8b8276]">{item.detail}</div>
                  </div>
                ))}
              </div>

              {/* What is ready to move */}
              <div className="mt-6">
                <div className="text-[13px] font-medium text-[#171513]">What is ready to move</div>
                <div className="mt-4 space-y-4">
                  {proofHighlights.map((item) => (
                    <div className="flex items-start gap-3" key={item.title}>
                      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff5eb] text-[#b15d37]">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[15px] font-semibold tracking-[-0.03em] text-[#171513]">{item.title}</div>
                          <span className="rounded-full bg-[#f0e6d9] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#8b8276]">{item.status}</span>
                        </div>
                        <div className="mt-1 text-[14px] leading-6 text-[#645d54]">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Why + CTA */}
            <div className="border-t border-black/8 bg-[#faf5ee] px-6 py-6 sm:px-8 xl:border-l xl:border-t-0">
              <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Why this is worth your time</div>
              <div className="mt-5 space-y-4">
                {proofWhyItems.map((item) => (
                  <div className="rounded-[16px] border border-black/6 bg-white/70 px-4 py-3.5 text-[14px] leading-6 text-[#4a4540]" key={item}>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[16px] border border-[#ff6b3d]/20 bg-[#ff6b3d]/8 px-5 py-4">
                <div className="text-[14px] font-semibold text-[#171513]">Find My Matches</div>
                <div className="mt-1.5 text-[13px] leading-5 text-[#645d54]">Bring your startup materials. See which programs actually fit.</div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}

/* ─── 7. Matched programs — featured lead + ranked shortlist ──── */

function MatchedProgramsSection({ onOpenAuth }: { onOpenAuth: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [featured, ...shortlist] = matchedPrograms;

  return (
    <section className="scroll-mt-28 border-b border-[#e7ddd0] bg-[#fbf7f1] px-4 py-20 sm:px-6 xl:px-8" id="matched-programs">
      <SectionReveal className="mx-auto max-w-[1180px]">
        <div className="mx-auto mb-12 max-w-[640px] text-center">
          <div className="text-[12px] uppercase tracking-[0.22em] text-[#b15d37]">Matched programs</div>
          <h2 className="mt-4 text-[42px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171513] sm:text-[48px]">
            The rooms worth your time.
          </h2>
          <p className="mt-5 text-[16px] leading-8 text-[#645d54]">
            A shortlist, not a directory. These are the rooms where the narrative is already strong enough to move fast.
          </p>
        </div>

        {/* Featured lead */}
        <motion.article
          className="mb-6 rounded-[28px] border border-[#efcdb9] bg-[#fff8f1] px-7 py-7 shadow-[0_20px_50px_rgba(18,15,11,0.06)]"
          transition={{ duration: 0.2 }}
          whileHover={shouldReduceMotion ? undefined : { y: -3 }}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <ProgramMark className="shadow-[0_10px_24px_rgba(18,15,11,0.04)]" program={featured} size={52} />
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="text-[24px] font-semibold tracking-[-0.03em] text-[#171513]">{featured.name}</div>
                  <span className="rounded-full bg-[#22c55e]/12 px-2.5 py-0.5 text-[11px] font-medium text-[#16a34a]">
                    {featured.fitScore}% fit
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[#8b8276]">
                  <span className="rounded-full border border-black/6 bg-white/70 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.14em]">{featured.type}</span>
                  <span>{featured.deadline}</span>
                  <span className="text-[#d2c4b5]">•</span>
                  <span>{featured.checkSize}</span>
                </div>
              </div>
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-full bg-[#171513] px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#2a2622]"
              onClick={onOpenAuth}
              type="button"
            >
              Review & Apply →
            </button>
          </div>

          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-[0.14em] text-[#8b8276]">Why it is worth your time</div>
            <p className="mt-2 max-w-[700px] text-[15px] leading-7 text-[#645d54]">{featured.why}</p>
          </div>
        </motion.article>

        {/* Ranked shortlist */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortlist.map((program, index) => (
            <motion.article
              className="rounded-[22px] border border-black/8 bg-white px-5 py-5 shadow-[0_12px_36px_rgba(18,15,11,0.03)] transition-colors"
              key={program.id}
              transition={{ duration: 0.2 }}
              whileHover={shouldReduceMotion ? undefined : { y: -3 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ProgramMark className="shadow-[0_8px_18px_rgba(18,15,11,0.04)]" program={program} size={40} />
                  <div>
                    <div className="text-[17px] font-semibold tracking-[-0.03em] text-[#171513]">{program.name}</div>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#8b8276]">
                      <span>{program.type}</span>
                      <span className="text-[#d2c4b5]">•</span>
                      <span>{program.deadline}</span>
                    </div>
                  </div>
                </div>
                <span className={cn(
                  "mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  program.fitScore >= 80 ? "bg-[#22c55e]/12 text-[#16a34a]" : "bg-[#f59e0b]/12 text-[#b45309]",
                )}>
                  {program.fitScore}%
                </span>
              </div>

              <p className="mt-4 text-[14px] leading-6 text-[#645d54]">{program.why}</p>

              <button
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#b15d37] transition-colors hover:text-[#963b1a]"
                onClick={onOpenAuth}
                type="button"
              >
                Review & Apply <ArrowRight className="size-3.5" />
              </button>
            </motion.article>
          ))}
        </div>
      </SectionReveal>
    </section>
  );
}

/* ─── 8. Final CTA ──────────────────────────────────────────────── */

function FinalCtaSection({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <section className="border-b border-[#292420] bg-[#171513] px-4 py-20 text-white sm:px-6 xl:px-8">
      <SectionReveal className="mx-auto max-w-[720px] text-center">
        <h2 className="text-[clamp(2.4rem,5.4vw,3.6rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
          One startup. Many applications.
        </h2>
        <p className="mx-auto mt-5 max-w-[480px] text-[17px] leading-8 text-white/70">
          Upload once. Match faster. Draft smarter.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-[#ff6b3d] px-6 py-3.5 text-[15px] font-medium text-white shadow-[0_14px_36px_rgba(255,107,61,0.28)] transition-colors hover:bg-[#f45d2e]"
            onClick={onOpenAuth}
            type="button"
          >
            Request Invite →
          </button>
        </div>
        <p className="mt-4 text-[13px] text-white/40">No credit card required · Free to start</p>
      </SectionReveal>
    </section>
  );
}

/* ─── 9. Footer ──────────────────────────────────────────────────── */

function HomepageFooter({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <footer className="bg-[#eee3d6] px-4 py-14 sm:px-6 xl:px-8">
      <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr]">
        <div>
          <BrandLockup />
          <p className="mt-5 max-w-[300px] text-[14px] leading-7 text-[#645d54]">
            Built for founders who are serious but too busy to perform serial bureaucracy.
          </p>
        </div>

        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Product</div>
          <div className="mt-5 flex flex-col gap-3 text-[14px] text-[#171513]">
            <Link href="#how-it-works">How It Works</Link>
            <Link href="/explore">Programs</Link>
            <Link href="#product-proof">Pricing</Link>
          </div>
        </div>

        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Programs</div>
          <div className="mt-5 flex flex-col gap-3 text-[14px] text-[#171513]">
            {matchedPrograms.slice(0, 4).map((program) => (
              <a href="#matched-programs" key={program.id}>
                {program.name}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Company</div>
          <div className="mt-5 flex flex-col gap-3 text-[14px] text-[#171513]">
            <a href="#product-proof">About</a>
            <a href="#product-proof">Blog</a>
            <button className="w-fit text-left" onClick={onOpenAuth} type="button">Contact</button>
            <button className="w-fit text-left" onClick={onOpenAuth} type="button">Privacy</button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1180px] flex-col gap-2 border-t border-black/8 pt-6 text-[12px] text-[#8b8276] md:flex-row md:items-center md:justify-between">
        <div>© 2026 Fundme.ai. Built for founders, not for application.</div>
        <div>Upload once. Match faster. Draft smarter.</div>
      </div>
    </footer>
  );
}

/* ─── Assembled Homepage ────────────────────────────────────────── */

export function PublicHomepage() {
  const router = useRouter();
  const pathname = usePathname();

  function openAuth(destination = "/onboarding") {
    const liveParams =
      typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
    const href = buildAuthEntryHref({
      entryPath: pathname,
      entryParams: liveParams,
      intent: {
        action: "default",
        destination,
      },
    });

    router.push(href, { scroll: false });
  }

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171513]" data-theme="public">
      <Header onOpenAuth={() => openAuth()} />
      <HomepageHero onOpenAuth={() => openAuth()} />
      <LogoRailSection />
      <StatsStrip />
      <HowItWorksSection />
      <ProductProofSection />
      <MatchedProgramsSection onOpenAuth={() => openAuth()} />
      <FinalCtaSection onOpenAuth={() => openAuth()} />
      <HomepageFooter onOpenAuth={() => openAuth()} />

      <Suspense fallback={null}>
        <PublicAuthController
          fallbackIntent={{
            action: "default",
            destination: "/onboarding",
          }}
        />
      </Suspense>
    </main>
  );
}
