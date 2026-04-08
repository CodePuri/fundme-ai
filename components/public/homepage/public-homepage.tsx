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
  proofInputs,
  proofQueue,
  proofTrackerSummary,
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
  { label: "Product proof", href: "#product-proof" },
  { label: "Matched programs", href: "#matched-programs" },
] as const;

const stepIcons = {
  upload: Upload,
  match: Target,
  draft: FilePenLine,
} as const;

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
            className="rounded-full border border-black/8 px-4 py-2 text-[14px] font-medium text-[#171513] transition-colors hover:bg-white"
            onClick={onOpenAuth}
            type="button"
          >
            Log in
          </button>
          <button
            className="rounded-full bg-[#171513] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#2a2622]"
            onClick={onOpenAuth}
            type="button"
          >
            Get Started
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
              className="mt-2 rounded-2xl bg-[#171513] px-4 py-3 text-left text-[14px] font-medium text-white"
              onClick={() => {
                setMenuOpen(false);
                onOpenAuth();
              }}
              type="button"
            >
              Get Started
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

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

function StatsStrip() {
  return (
    <section className="border-b border-[#e3d6c7] bg-[#f1e7db] px-4 py-14 sm:px-6 xl:px-8">
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

function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="scroll-mt-28 border-b border-[#e7ddd0] bg-[#f8f3ec] px-4 py-20 sm:px-6 xl:px-8" id="how-it-works">
      <SectionReveal className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-[700px] text-center">
          <div className="text-[12px] uppercase tracking-[0.22em] text-[#b15d37]">How it works</div>
          <h2 className="mt-4 text-[40px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171513] sm:text-[48px]">
            Three moves from scattered founder material to ready-to-send applications.
          </h2>
          <p className="mx-auto mt-5 max-w-[580px] text-[16px] leading-8 text-[#645d54]">
            The workflow stays simple: bring in what you already have, see the rooms worth moving on, and draft from
            context instead of starting over.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-3 lg:gap-0">
          {storySteps.map((step, index) => {
            const Icon = stepIcons[step.id];

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

function ProductProofSection() {
  return (
    <section className="scroll-mt-28 border-b border-[#e2d5c7] bg-[#efe3d6] px-4 py-20 sm:px-6 xl:px-8" id="product-proof">
      <SectionReveal className="mx-auto max-w-[1180px]">
        <div className="grid gap-12 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
          <div className="max-w-[470px]">
            <div className="text-[12px] uppercase tracking-[0.22em] text-[#b15d37]">Product proof</div>
            <h2 className="mt-4 text-[42px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171513] sm:text-[48px]">
              Your story stops living in five places.
            </h2>
            <p className="mt-5 text-[16px] leading-8 text-[#645d54]">
              Good founders do not lose momentum because the company is weak. They lose it because the application work
              is spread across decks, docs, notes, and deadlines that never become one system.
            </p>
            <p className="mt-5 text-[16px] leading-8 text-[#645d54]">
              Fundme brings that material into one operating layer, carries context forward, and keeps the matched
              queue clear enough to act on.
            </p>

            <div className="mt-8">
              <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Source material in play</div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {proofInputs.map((item) => (
                  <span className="rounded-full border border-black/8 bg-white/78 px-3 py-1.5 text-[13px] text-[#645d54]" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[34px] border border-black/8 bg-white shadow-[0_26px_70px_rgba(18,15,11,0.07)]">
            <div className="flex flex-col gap-3 border-b border-black/8 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Application operating layer</div>
                <div className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.04em] text-[#171513]">
                  One working surface for what is ready to move.
                </div>
              </div>
              <div className="rounded-full border border-black/8 bg-[#faf4ec] px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#8b8276]">
                One source of truth
              </div>
            </div>

            <div className="grid gap-0 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="px-6 py-6 sm:px-8">
                <div className="grid gap-0 border-b border-black/8 pb-6 sm:grid-cols-3">
                  {proofTrackerSummary.map((item, index) => (
                    <div className={cn(index < proofTrackerSummary.length - 1 && "sm:border-r sm:border-black/8 sm:pr-5", index > 0 && "sm:pl-5")} key={item.title}>
                      <div className="text-[19px] font-semibold tracking-[-0.04em] text-[#171513]">{item.title}</div>
                      <div className="mt-2 text-[12px] leading-5 text-[#8b8276]">{item.detail}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-5">
                  {proofHighlights.map((item) => (
                    <div className="flex items-start gap-3" key={item.title}>
                      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff5eb] text-[#b15d37]">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <div className="text-[17px] font-semibold tracking-[-0.03em] text-[#171513]">{item.title}</div>
                        <div className="mt-1 text-[14px] leading-6 text-[#645d54]">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-black/8 bg-[#faf5ee] px-6 py-6 sm:px-8 xl:border-l xl:border-t-0">
                <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Matched queue</div>
                <div className="mt-5 space-y-4">
                  {proofQueue.map((item) => (
                    <div className="rounded-[24px] border border-black/8 bg-white/82 px-4 py-4" key={item.name}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <ProgramMark program={item} size={38} />
                          <div className="min-w-0">
                            <div className="truncate text-[15px] font-semibold tracking-[-0.03em] text-[#171513]">{item.name}</div>
                            <div className="mt-1 text-[12px] text-[#8b8276]">{item.stage}</div>
                          </div>
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-[#8b8276]">{item.deadline}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}

function MatchedProgramsSection({ onOpenAuth }: { onOpenAuth: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="scroll-mt-28 border-b border-[#e7ddd0] bg-[#fbf7f1] px-4 py-20 sm:px-6 xl:px-8" id="matched-programs">
      <SectionReveal className="mx-auto max-w-[1180px]">
        <div className="grid gap-12 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
          <div className="max-w-[420px] xl:pt-3">
            <div className="text-[12px] uppercase tracking-[0.22em] text-[#b15d37]">Matched programs</div>
            <h2 className="mt-4 text-[42px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171513] sm:text-[48px]">
              A ranked shortlist instead of another directory wall.
            </h2>
            <p className="mt-5 text-[16px] leading-8 text-[#645d54]">
              Start where the story already lands. The list below is ordered so the strongest room moves first and the
              weaker detours stop stealing time.
            </p>
          </div>

          <div className="space-y-4">
            {matchedPrograms.map((program, index) => (
              <motion.article
                className={cn(
                  "rounded-[30px] border px-6 py-6 shadow-[0_18px_48px_rgba(18,15,11,0.04)] transition-colors sm:px-7",
                  index === 0 ? "border-[#efcdb9] bg-[#fff8f1]" : "border-black/8 bg-white",
                )}
                key={program.id}
                transition={{ duration: 0.2 }}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="pt-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8b8276]">
                      0{index + 1}
                    </div>
                    <ProgramMark className="shadow-[0_10px_24px_rgba(18,15,11,0.04)]" program={program} size={48} />
                    <div className="min-w-0">
                      <div className="text-[20px] font-semibold tracking-[-0.03em] text-[#171513]">{program.name}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#8b8276]">
                        <span>{program.deadline}</span>
                        <span className="text-[#d2c4b5]">•</span>
                        <span>{program.fitLabel}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-medium transition-colors",
                      index === 0
                        ? "bg-[#171513] text-white hover:bg-[#2a2622]"
                        : "border border-black/8 bg-[#faf4ec] text-[#171513] hover:bg-white",
                    )}
                    onClick={onOpenAuth}
                    type="button"
                  >
                    Review match
                    <ArrowRight className="size-4" />
                  </button>
                </div>

                <p className="mt-5 max-w-[640px] text-[15px] leading-8 text-[#645d54]">{program.why}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}

function FinalCtaSection({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <section className="border-b border-[#292420] bg-[#171513] px-4 py-20 text-white sm:px-6 xl:px-8">
      <SectionReveal className="mx-auto max-w-[820px] text-center">
        <div className="text-[12px] uppercase tracking-[0.22em] text-white/58">Get started</div>
        <h2 className="mt-4 text-[clamp(2.9rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
          One upload. One application base. Every next move in one place.
        </h2>
        <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-8 text-white/70">
          Bring in the material you already have. Fundme will structure the story, rank the shortlist, and help you
          move on the applications that actually deserve the time.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-medium text-[#171513] transition-colors hover:bg-[#f3ece4]"
            onClick={onOpenAuth}
            type="button"
          >
            Get Started
            <ArrowRight className="size-4" />
          </button>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-white/16 px-6 py-3.5 text-[15px] font-medium text-white/88 transition-colors hover:bg-white/6"
            href="#how-it-works"
          >
            See how it works
          </a>
        </div>
      </SectionReveal>
    </section>
  );
}

function HomepageFooter({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <footer className="bg-[#eee3d6] px-4 py-14 sm:px-6 xl:px-8">
      <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr]">
        <div>
          <BrandLockup />
          <p className="mt-5 max-w-[300px] text-[14px] leading-7 text-[#645d54]">
            Built for founders who want applications to feel like a system, not a side project.
          </p>
        </div>

        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Navigate</div>
          <div className="mt-5 flex flex-col gap-3 text-[14px] text-[#171513]">
            {navItems.map((item) => (
              <Link href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Programs</div>
          <div className="mt-5 flex flex-col gap-3 text-[14px] text-[#171513]">
            {matchedPrograms.map((program) => (
              <a href="#matched-programs" key={program.id}>
                {program.name}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Account</div>
          <div className="mt-5 flex flex-col gap-3">
            <button className="w-fit text-left text-[14px] text-[#171513]" onClick={onOpenAuth} type="button">
              Log in
            </button>
            <button className="w-fit text-left text-[14px] font-medium text-[#171513]" onClick={onOpenAuth} type="button">
              Get Started
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1180px] flex-col gap-2 border-t border-black/8 pt-6 text-[12px] text-[#8b8276] md:flex-row md:items-center md:justify-between">
        <div>© 2026 Fundme.ai</div>
        <div>Upload once. Match faster. Draft smarter.</div>
      </div>
    </footer>
  );
}

export function PublicHomepage() {
  const router = useRouter();
  const pathname = usePathname();

  function openAuth(destination = "/app/matches") {
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
            destination: "/app/matches",
          }}
        />
      </Suspense>
    </main>
  );
}
