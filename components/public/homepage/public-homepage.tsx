"use client";

import { Suspense, type ReactNode, useState, useEffect, useRef } from "react";
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
import { motion, useReducedMotion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

import { PublicAuthController } from "@/components/public/public-auth-controller";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { buildAuthEntryHref } from "@/lib/auth-intent";
import { cn } from "@/lib/utils";
import {
  EASE_OUT,
  fadeRise,
  fadeRiseSmall,
  fadeRiseWithDelay,
  scaleIn,
  staggerContainer,
  hoverLift,
  hoverLiftSmall,
  tapCompress,
  useCountUp,
  useInViewOnce,
} from "@/lib/animations";

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

/* ─── Local variants ─────────────────────────────────────────── */

const heroStagger = staggerContainer(0.12, 0.15);

const cardStagger = staggerContainer(0.1, 0);

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

/* ─── Utility ────────────────────────────────────────────────── */

function SectionReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
      viewport={{ once: true, amount: 0.15 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── CountUp display ────────────────────────────────────────── */

function CountUpValue({ value, suffix = "", isVisible }: { value: number; suffix?: string; isVisible: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const count = useCountUp(value, isVisible, shouldReduceMotion ? 0 : 1200);

  return <>{shouldReduceMotion ? value : count}{suffix}</>;
}

/* ─── 1. Header ─────────────────────────────────────────────── */

function Header({ onOpenAuth }: { onOpenAuth: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <motion.header
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b bg-[#f6f1ea]/92 backdrop-blur-xl transition-[border-color,padding] duration-300",
        scrolled ? "border-[#d9cbbd] py-2.5 sm:py-2.5" : "border-[#e7ddd0] py-4",
      )}
      initial={shouldReduceMotion ? false : { opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 sm:px-6 xl:px-8">
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <BrandLockup />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              className="text-[14px] text-[#5f584f] transition-colors duration-200 hover:text-[#171513]"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <motion.button
            className="rounded-full bg-[#ff6b3d] px-5 py-2.5 text-[14px] font-medium text-white shadow-[0_10px_28px_rgba(255,107,61,0.22)] transition-colors hover:bg-[#f45d2e]"
            onClick={onOpenAuth}
            type="button"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : tapCompress}
          >
            Request Invite →
          </motion.button>
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
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-black/8 px-4 py-4 md:hidden"
          initial={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
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
        </motion.div>
      ) : null}
    </motion.header>
  );
}

/* ─── 2. Hero ────────────────────────────────────────────────── */

/* Floating card configuration — position grid for 6 accelerator markers */
const floatingCards: {
  id: string;
  label: string;
  shortMark: string;
  bg: string;
  textColor: string;
  x: string;
  y: string;
  rotate: number;
  delay: number;
  side: "left" | "right";
}[] = [
  /* ── Left column ── */
  { id: "yc", label: "Y Combinator", shortMark: "YC", bg: "#ff6600", textColor: "#fff", x: "4%", y: "14%", rotate: -6, delay: 0, side: "left" },
  { id: "antler", label: "Antler", shortMark: "A", bg: "#ff6c59", textColor: "#fff", x: "2%", y: "44%", rotate: 4, delay: 0.18, side: "left" },
  { id: "gfs", label: "Google for Startups", shortMark: "GfS", bg: "#4285f4", textColor: "#fff", x: "6%", y: "74%", rotate: -3, delay: 0.32, side: "left" },
  /* ── Right column ── */
  { id: "techstars", label: "Techstars", shortMark: "TS", bg: "#00a4e4", textColor: "#fff", x: "4%", y: "16%", rotate: 5, delay: 0.1, side: "right" },
  { id: "aws", label: "AWS Activate", shortMark: "aws", bg: "#232f3e", textColor: "#fff", x: "2%", y: "46%", rotate: -4, delay: 0.24, side: "right" },
  { id: "500", label: "500 Global", shortMark: "500", bg: "#e8483f", textColor: "#fff", x: "5%", y: "76%", rotate: 3, delay: 0.36, side: "right" },
];

const trustLogos = [
  { name: "Y Combinator", short: "YC" },
  { name: "Antler", short: "Antler" },
  { name: "Google for Startups", short: "GfS" },
  { name: "Techstars", short: "Techstars" },
  { name: "500 Global", short: "500" },
];

function FloatingCard({
  card,
  shouldReduceMotion,
}: {
  card: (typeof floatingCards)[number];
  shouldReduceMotion: boolean | null;
}) {
  const posStyle: React.CSSProperties =
    card.side === "left"
      ? { left: card.x, top: card.y }
      : { right: card.x, top: card.y };

  return (
    <motion.div
      className="group absolute z-10 hidden xl:flex"
      style={posStyle}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.88, y: 18 }}
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : {
              opacity: 1,
              scale: 1,
              y: [0, -6, 0],
              rotate: [card.rotate, card.rotate + 1.2, card.rotate - 0.8, card.rotate],
            }
      }
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              opacity: { duration: 0.8, delay: 0.5 + card.delay, ease: EASE_OUT },
              scale: { duration: 0.8, delay: 0.5 + card.delay, ease: EASE_OUT },
              y: { duration: 5 + card.delay * 2, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut", delay: 0.5 + card.delay },
              rotate: { duration: 7 + card.delay * 3, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut", delay: 0.5 + card.delay },
            }
      }
      whileHover={shouldReduceMotion ? undefined : { y: -10, scale: 1.05, transition: { duration: 0.25, ease: EASE_OUT } }}
    >
      <div
        className="flex items-center gap-3 rounded-[18px] border border-black/[0.06] bg-white/[0.92] px-4 py-3 shadow-[0_8px_30px_rgba(18,15,11,0.07)] backdrop-blur-sm transition-shadow duration-300 group-hover:shadow-[0_14px_40px_rgba(18,15,11,0.1)]"
        style={{ transform: `rotate(${card.rotate}deg)` }}
      >
        {/* Mark */}
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-[12px] border border-black/[0.06]"
          style={{ background: card.bg, color: card.textColor }}
        >
          <span className="text-[12px] font-bold leading-none tracking-[-0.04em]" style={card.shortMark === "aws" ? { textTransform: "uppercase" as const, fontSize: 10 } : undefined}>
            {card.shortMark}
          </span>
        </div>
        {/* Label */}
        <div className="min-w-0 pr-1">
          <div className="text-[13px] font-semibold leading-tight tracking-[-0.02em] text-[#171513]">{card.label}</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-[#8b8276]">Program</div>
        </div>
      </div>
    </motion.div>
  );
}

/* The breakpoint where floating cards appear — also used for subtle mid-screen cards */
function FloatingCardMid({
  card,
  shouldReduceMotion,
}: {
  card: (typeof floatingCards)[number];
  shouldReduceMotion: boolean | null;
}) {
  const posStyle: React.CSSProperties =
    card.side === "left"
      ? { left: card.x, top: card.y }
      : { right: card.x, top: card.y };

  return (
    <motion.div
      className="group absolute z-10 hidden lg:flex xl:hidden"
      style={posStyle}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.88 }}
      animate={
        shouldReduceMotion
          ? { opacity: 0.7 }
          : {
              opacity: 0.7,
              scale: 1,
              y: [0, -4, 0],
            }
      }
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              opacity: { duration: 0.8, delay: 0.6 + card.delay },
              scale: { duration: 0.8, delay: 0.6 + card.delay },
              y: { duration: 6, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut", delay: 0.6 + card.delay },
            }
      }
    >
      <div
        className="flex size-10 items-center justify-center rounded-[12px] border border-black/[0.06] bg-white/[0.88] shadow-[0_6px_20px_rgba(18,15,11,0.06)] backdrop-blur-sm"
      >
        <div
          className="flex size-8 items-center justify-center rounded-[8px]"
          style={{ background: card.bg, color: card.textColor }}
        >
          <span className="text-[10px] font-bold leading-none" style={card.shortMark === "aws" ? { textTransform: "uppercase" as const, fontSize: 8 } : undefined}>
            {card.shortMark}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function HomepageHero({ onOpenAuth }: { onOpenAuth: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-32 sm:pt-36 lg:pt-40">
      {/* Background layers */}
      <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,107,61,0.11),transparent_68%)]" />
      <div className="absolute left-1/2 top-[100px] h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.85),rgba(255,255,255,0))] blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,rgba(255,255,255,0.45),transparent_18%,transparent_100%)]" />

      <div className="relative mx-auto max-w-[1340px] px-4 pb-20 sm:px-6 xl:px-10">
        {/* ── Floating accelerator cards — desktop ── */}
        {floatingCards.map((card) => (
          <FloatingCard key={card.id} card={card} shouldReduceMotion={shouldReduceMotion} />
        ))}
        {/* ── Floating marks — tablet (icons only) ── */}
        {floatingCards.map((card) => (
          <FloatingCardMid key={`mid-${card.id}`} card={card} shouldReduceMotion={shouldReduceMotion} />
        ))}

        {/* ── Central content stack ── */}
        <motion.div
          animate="visible"
          className="relative z-20 flex min-h-[600px] flex-col items-center justify-center sm:min-h-[660px] lg:min-h-[680px]"
          initial={shouldReduceMotion ? false : "hidden"}
          variants={heroStagger}
        >
          <div className="flex max-w-[780px] flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2.5 rounded-full border border-[#e7ddd0] bg-white/92 px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#8b8276] shadow-[0_8px_24px_rgba(18,15,11,0.04)] backdrop-blur"
              variants={fadeRise}
            >
              <motion.span
                animate={shouldReduceMotion ? undefined : { scale: [1, 1.35, 1] }}
                className="inline-block size-[7px] rounded-full bg-[#ff6b3d]"
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3.5 }}
              />
              Backed by real startup programs
            </motion.div>

            {/* Headline — premium editorial mixed serif */}
            <motion.h1
              className="mt-10 sm:mt-12"
              variants={fadeRise}
            >
              <span
                className="block text-[clamp(2.6rem,5.8vw,4.4rem)] font-bold leading-[0.92] tracking-[-0.04em] text-[#171513]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Stop pitching blind.
              </span>
              <motion.span
                className="mt-2 block text-[clamp(2.5rem,5.6vw,4.2rem)] leading-[0.96] tracking-[-0.03em] text-[#171513] sm:mt-3"
                style={{ fontFamily: "var(--font-instrument)", fontStyle: "italic", fontWeight: 400 }}
                variants={fadeRiseWithDelay(0.08)}
              >
                Start applying where you fit.
              </motion.span>
            </motion.h1>

            {/* Supporting copy */}
            <motion.p
              className="mx-auto mt-7 max-w-[500px] text-[16px] leading-[1.9] text-[#6f685f] sm:mt-8 sm:text-[17px]"
              variants={fadeRise}
            >
              Upload your deck and traction once. See the programs that actually
              fit. Draft the right angle for each one. Track every deadline in one place.
            </motion.p>

            {/* CTA row — lighter, refined */}
            <motion.div className="mt-9 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4" variants={fadeRise}>
              <motion.button
                className="inline-flex items-center gap-2 rounded-full bg-[#171513] px-7 py-3 text-[14.5px] font-medium text-white shadow-[0_12px_32px_rgba(18,15,11,0.12)] transition-colors hover:bg-[#2a2622]"
                onClick={onOpenAuth}
                type="button"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.03, y: -1 }}
                whileTap={shouldReduceMotion ? undefined : tapCompress}
              >
                Get started free
                <ArrowRight className="size-3.5" />
              </motion.button>
              <motion.a
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-[14px] font-medium text-[#645d54] transition-colors hover:text-[#171513]"
                href="#how-it-works"
                whileHover={shouldReduceMotion ? undefined : { x: 2 }}
              >
                See how it works
                <ArrowRight className="size-3.5" />
              </motion.a>
            </motion.div>

            {/* Trust row */}
            <motion.div
              className="mt-12 flex flex-col items-center gap-3 sm:mt-14"
              variants={fadeRiseWithDelay(0.35)}
            >
              <span className="text-[10.5px] uppercase tracking-[0.22em] text-[#a59d93]">
                Programs already in the room
              </span>
              <div className="flex items-center gap-5 sm:gap-6">
                {trustLogos.map((logo) => (
                  <span
                    key={logo.short}
                    className="text-[12px] font-semibold tracking-[-0.01em] text-[#b5ad9f] transition-colors duration-200 hover:text-[#8b8276] sm:text-[13px]"
                  >
                    {logo.name}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── 3. Marquee logo rail ──────────────────────────────────── */

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
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative border-y border-[#e3d6c7] bg-[#eee3d6] py-6">
      <SectionReveal className="mx-auto max-w-[1240px] px-4 sm:px-6 xl:px-8">
        <div className="text-center text-[11px] uppercase tracking-[0.22em] text-[#8b8276]">Programs already in the room</div>
      </SectionReveal>

      <motion.div
        className="logo-rail-viewport relative mt-5"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 }}
        viewport={{ once: true }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#eee3d6] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#eee3d6] to-transparent sm:w-24" />

        <div className={cn("logo-rail-strip px-4 sm:px-6 xl:px-8", shouldReduceMotion && "animation-play-state-paused")}>
          {ecosystemPrograms.map((program) => (
            <LogoRailCard key={program.id} {...program} />
          ))}
        </div>

        <div
          aria-hidden="true"
          className={cn("logo-rail-strip logo-rail-strip--duplicate px-4 sm:px-6 xl:px-8", shouldReduceMotion && "animation-play-state-paused")}
        >
          {ecosystemPrograms.map((program) => (
            <LogoRailCard key={`${program.id}-duplicate`} {...program} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ─── 4. Stats strip ────────────────────────────────────────── */

/** Extracts leading number and remaining suffix from a stat value like "100+ hrs" */
function parseStatValue(raw: string): { num: number; suffix: string } {
  const match = raw.match(/^(\d+)/);
  if (!match) return { num: 0, suffix: raw };
  const num = parseInt(match[1], 10);
  const suffix = raw.slice(match[0].length);
  return { num, suffix };
}

function StatsStrip() {
  const shouldReduceMotion = useReducedMotion();
  const [ref, isInView] = useInViewOnce<HTMLDivElement>(0.4);

  return (
    <section className="border-b border-[#d9cebf] bg-[#f1e8dc] px-4 py-14 sm:px-6 xl:px-8">
      <motion.div
        className="mx-auto max-w-[1180px]"
        initial={shouldReduceMotion ? false : "hidden"}
        ref={ref}
        variants={cardStagger}
        viewport={{ once: true, amount: 0.3 }}
        whileInView={shouldReduceMotion ? undefined : "visible"}
      >
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
          {homepageStats.map((stat, index) => {
            const { num, suffix } = parseStatValue(stat.value);

            return (
              <motion.div
                className={cn(
                  "px-0 py-2 xl:px-8",
                  index < homepageStats.length - 1 && "xl:border-r xl:border-black/8",
                )}
                key={stat.value}
                variants={fadeRise}
              >
                <div className="text-[34px] font-semibold leading-[0.92] tracking-[-0.05em] text-[#171513]">
                  <CountUpValue isVisible={isInView} suffix={suffix} value={num} />
                </div>
                <div className="mt-3 max-w-[250px] text-[14px] leading-6 text-[#6f6559]">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

/* ─── 5. How it works ────────────────────────────────────────── */

function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="scroll-mt-28 border-b border-[#e7ddd0] bg-[#f8f3ec] px-4 py-20 sm:px-6 xl:px-8" id="how-it-works">
      <SectionReveal className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-[700px] text-center">
          <motion.div
            className="text-[12px] uppercase tracking-[0.22em] text-[#b15d37]"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
          >
            How it works
          </motion.div>
          <h2 className="mt-4 text-[40px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171513] sm:text-[48px]">
            From scattered pitch decks to matched applications.
          </h2>
          <p className="mx-auto mt-5 max-w-[580px] text-[16px] leading-8 text-[#645d54]">
            Upload once. See where you fit. Draft in your value. This is the system founders wish existed before they started rebuilding the same company story in every new form.
          </p>
        </div>

        <motion.div
          className="mt-16 grid gap-10 lg:grid-cols-3 lg:gap-0"
          initial={shouldReduceMotion ? false : "hidden"}
          variants={staggerContainer(0.15, 0.2)}
          viewport={{ once: true, amount: 0.2 }}
          whileInView={shouldReduceMotion ? undefined : "visible"}
        >
          {storySteps.map((step, index) => {
            const Icon = stepIcons[step.id as keyof typeof stepIcons];

            return (
              <motion.div
                className={cn(
                  "relative pt-8 lg:px-10",
                  index < storySteps.length - 1 && "lg:border-r lg:border-black/8",
                )}
                key={step.id}
                variants={fadeRise}
                whileHover={shouldReduceMotion ? undefined : hoverLiftSmall}
              >
                {/* Decorative top line — reveals via scaleX */}
                <motion.div
                  className="absolute left-0 top-0 h-px w-16 origin-left bg-[#d9cbbd]"
                  initial={shouldReduceMotion ? false : { scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.3 + index * 0.12 }}
                  viewport={{ once: true }}
                  whileInView={shouldReduceMotion ? undefined : { scaleX: 1, opacity: 1 }}
                />
                <motion.div
                  className="text-[12px] font-medium tracking-[0.18em] text-[#b15d37]"
                  variants={fadeRiseSmall}
                >
                  {step.eyebrow}
                </motion.div>
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
        </motion.div>
      </SectionReveal>
    </section>
  );
}

/* ─── 6. Product proof — one dominant visual ─────────────────── */

function ProductProofSection() {
  const shouldReduceMotion = useReducedMotion();

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
        <motion.div
          className="mb-8 flex flex-wrap items-center justify-center gap-2"
          initial={shouldReduceMotion ? false : "hidden"}
          variants={staggerContainer(0.06, 0)}
          viewport={{ once: true }}
          whileInView={shouldReduceMotion ? undefined : "visible"}
        >
          {["Startup Context", "AI contract intelligence", "Pre-seed", "Agency workflow pain", "87 signups", "3 pilots"].map((tag, i) => (
            <motion.span
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px]",
                i === 0
                  ? "border border-[#d4c4b3] bg-white/60 text-[12px] font-medium uppercase tracking-[0.12em] text-[#8b8276] px-3.5"
                  : "border border-black/6 bg-white/80 text-[#645d54]",
              )}
              key={tag}
              variants={scaleIn}
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>

        {/* Main proof surface — single strong entrance */}
        <motion.div
          className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_30px_80px_rgba(18,15,11,0.09)]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 32, scale: 0.97 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          viewport={{ once: true, amount: 0.15 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        >
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
                <motion.div
                  className="mt-4 space-y-4"
                  initial={shouldReduceMotion ? false : "hidden"}
                  variants={staggerContainer(0.08, 0.3)}
                  viewport={{ once: true }}
                  whileInView={shouldReduceMotion ? undefined : "visible"}
                >
                  {proofHighlights.map((item) => (
                    <motion.div className="flex items-start gap-3" key={item.title} variants={fadeRiseSmall}>
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
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Right: Why + CTA */}
            <div className="border-t border-black/8 bg-[#faf5ee] px-6 py-6 sm:px-8 xl:border-l xl:border-t-0">
              <div className="text-[12px] uppercase tracking-[0.18em] text-[#8b8276]">Why this is worth your time</div>
              <motion.div
                className="mt-5 space-y-4"
                initial={shouldReduceMotion ? false : "hidden"}
                variants={staggerContainer(0.08, 0.4)}
                viewport={{ once: true }}
                whileInView={shouldReduceMotion ? undefined : "visible"}
              >
                {proofWhyItems.map((item) => (
                  <motion.div
                    className="rounded-[16px] border border-black/6 bg-white/70 px-4 py-3.5 text-[14px] leading-6 text-[#4a4540]"
                    key={item}
                    variants={fadeRiseSmall}
                  >
                    {item}
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="mt-6 rounded-[16px] border border-[#ff6b3d]/20 bg-[#ff6b3d]/8 px-5 py-4"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.6 }}
                viewport={{ once: true }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              >
                <div className="text-[14px] font-semibold text-[#171513]">Find My Matches</div>
                <div className="mt-1.5 text-[13px] leading-5 text-[#645d54]">Bring your startup materials. See which programs actually fit.</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}

/* ─── 7. Matched programs — featured lead + ranked shortlist ── */

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
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          viewport={{ once: true, amount: 0.3 }}
          whileHover={shouldReduceMotion ? undefined : hoverLiftSmall}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
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

            <motion.button
              className="inline-flex items-center gap-2 rounded-full bg-[#171513] px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#2a2622]"
              onClick={onOpenAuth}
              type="button"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? undefined : tapCompress}
            >
              Review & Apply →
            </motion.button>
          </div>

          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-[0.14em] text-[#8b8276]">Why it is worth your time</div>
            <p className="mt-2 max-w-[700px] text-[15px] leading-7 text-[#645d54]">{featured.why}</p>
          </div>
        </motion.article>

        {/* Ranked shortlist */}
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial={shouldReduceMotion ? false : "hidden"}
          variants={staggerContainer(0.1, 0.15)}
          viewport={{ once: true, amount: 0.2 }}
          whileInView={shouldReduceMotion ? undefined : "visible"}
        >
          {shortlist.map((program) => (
            <motion.article
              className="rounded-[22px] border border-black/8 bg-white px-5 py-5 shadow-[0_12px_36px_rgba(18,15,11,0.03)] transition-colors"
              key={program.id}
              variants={fadeRise}
              whileHover={shouldReduceMotion ? undefined : hoverLiftSmall}
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

              <motion.button
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#b15d37] transition-colors hover:text-[#963b1a]"
                onClick={onOpenAuth}
                type="button"
                whileHover={shouldReduceMotion ? undefined : { x: 3 }}
              >
                Review & Apply <ArrowRight className="size-3.5" />
              </motion.button>
            </motion.article>
          ))}
        </motion.div>
      </SectionReveal>
    </section>
  );
}

/* ─── 8. Cinematic Footer ──────────────────────────────────────────── */

const footerLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Programs", href: "/explore" },
  { label: "Pricing", href: "#product-proof" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
];

function CinematicFooter({ onOpenAuth }: { onOpenAuth: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer
      className="relative h-[650px] sm:h-[600px] lg:h-[700px]"
      style={{ clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)" }}
    >
      <div className="fixed bottom-0 left-0 w-full h-[650px] sm:h-[600px] lg:h-[700px] bg-[#171513] text-[#f6f1ea] flex flex-col justify-between overflow-hidden pt-8">
        
        {/* Subtle Background Word */}
        <div className="pointer-events-none absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 text-[22vw] font-bold leading-none tracking-[-0.04em] text-[#24211e] select-none">
          FUNDME
        </div>

        {/* Top Marquee Band */}
        <div className="relative z-10 overflow-hidden py-3">
          <div className="logo-rail-strip gap-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-10">
                <span className="text-[12px] uppercase tracking-[0.2em] text-[#8e8477]">Founder application workflow</span>
                <span className="text-[#453e36]">•</span>
                <span className="text-[12px] uppercase tracking-[0.2em] text-[#8e8477]">Matched to real programs</span>
                <span className="text-[#453e36]">•</span>
                <span className="text-[12px] uppercase tracking-[0.2em] text-[#8e8477]">Tailored drafts</span>
                <span className="text-[#453e36]">•</span>
                <span className="text-[12px] uppercase tracking-[0.2em] text-[#8e8477]">Deadlines tracked</span>
                <span className="text-[#453e36]">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 xl:px-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-[clamp(3.2rem,6.5vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.04em] text-white">
              One startup.
              <br />
              <span className="font-[family-name:var(--font-instrument)] italic font-light text-[#dfd6cb]">Many applications.</span>
            </h2>
            <p className="mt-6 max-w-[480px] text-[17px] leading-8 text-[#a59d93]">
              Upload once. Match faster. Draft smarter.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <motion.button
                className="inline-flex items-center gap-2 rounded-full bg-[#ff6b3d] px-7 py-4 text-[15px] font-medium text-white shadow-[0_12px_32px_rgba(255,107,61,0.24)] transition-colors hover:bg-[#f45d2e]"
                onClick={onOpenAuth}
                type="button"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.03, y: -2 }}
                whileTap={shouldReduceMotion ? undefined : tapCompress}
              >
                Get Started
                <ArrowRight className="size-4" />
              </motion.button>
              <motion.a
                className="inline-flex items-center gap-2 rounded-full border border-[#3b352e] bg-[#211f1c] px-6 py-4 text-[15px] font-medium text-[#dfd6cb] transition-colors hover:bg-[#2c2825]"
                href="#how-it-works"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : tapCompress}
              >
                See how it works
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 px-6 py-8 sm:flex-row xl:px-12 border-t border-[#292420]">
          <div className="flex items-center gap-2">
             <div className="flex size-8 items-center justify-center rounded-lg bg-[#ff6b3d] text-white">
                <Target className="size-5" />
             </div>
             <span className="text-[20px] font-bold tracking-[-0.04em] text-white">Fundme.ai</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-[#a59d93]">
            {footerLinks.map((link) => (
              <a key={link.label} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
          </div>

          <div className="text-[12px] text-[#5e564d] sm:text-right">
            © {new Date().getFullYear()} Fundme.ai. <br className="sm:hidden" /> Built for founders.
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Assembled Homepage ────────────────────────────────────── */

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
    <main className="min-h-screen bg-[#171513] text-[#171513]" data-theme="public">
      <div className="relative z-10 rounded-b-[40px] bg-[#f6f1ea] shadow-[0_40px_80px_rgba(0,0,0,0.4)] pb-8">
        <Header onOpenAuth={() => openAuth()} />
        <HomepageHero onOpenAuth={() => openAuth()} />
        <LogoRailSection />
        <StatsStrip />
        <HowItWorksSection />
        <ProductProofSection />
        <MatchedProgramsSection onOpenAuth={() => openAuth()} />
      </div>

      <CinematicFooter onOpenAuth={() => openAuth()} />

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
