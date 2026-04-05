"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Clock,
  FileText,
  Menu,
  Sparkles,
  Star,
  Target,
  Upload,
  X,
} from "lucide-react";
import { motion, useInView } from "framer-motion";

import { useDemo } from "@/components/app/demo-provider";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { LogoImage } from "@/components/ui/logo-image";

const motionTransition = {
  type: "spring" as const,
  bounce: 0.3,
  duration: 1.5,
};

const howItWorks = [
  {
    step: "01",
    title: "Upload what you have",
    description:
      "A deck, a URL, rough notes, old application answers, even half-finished thinking. Start messy.",
    icon: Upload,
  },
  {
    step: "02",
    title: "See where you fit",
    description:
      "We rank the programs most worth your time based on your stage, sector, founder profile, traction, and gaps.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Draft faster",
    description:
      "Each application is tailored to what that specific program actually looks for, not generated from a generic template.",
    icon: FileText,
  },
];

const founderOutcomes = [
  {
    title: "Go from upload to draft fast",
    body: "Paste a URL or drop in your deck. We turn what you already have into tailored application answers in minutes.",
    icon: Clock,
  },
  {
    title: "Apply where the fit is real",
    body: "See a ranked list of programs based on your startup, founder background, traction, and what each program actually cares about.",
    icon: Target,
  },
  {
    title: "Track everything in one place",
    body: "Keep drafts, deadlines, statuses, and next steps in one workflow instead of scattered docs, tabs, and spreadsheets.",
    icon: CheckCircle,
  },
];

const curatedPrograms = [
  {
    name: "YC W26",
    type: "Accelerator",
    benefit: "Batch access + founder network",
    deadline: "May 12, 2026",
    domain: "ycombinator.com",
    fallbackText: "YC",
    fallbackColor: "#FF6600",
  },
  {
    name: "Antler India",
    type: "Accelerator",
    benefit: "Pre-seed capital + partner access",
    deadline: "Rolling",
    domain: "antler.co",
    fallbackText: "AN",
    fallbackColor: "#1E3A8A",
  },
  {
    name: "Google for Startups",
    type: "Program",
    benefit: "Mentorship + cloud support",
    deadline: "June 3, 2026",
    domain: "startup.google.com",
    fallbackText: "GS",
    fallbackColor: "#4285F4",
  },
  {
    name: "AWS Activate",
    type: "Credits",
    benefit: "AWS credits + startup tooling",
    deadline: "Rolling",
    domain: "aws.amazon.com",
    fallbackText: "AW",
    fallbackColor: "#FF9900",
  },
  {
    name: "Anthropic Credits",
    type: "Credits",
    benefit: "Claude credits up to $10K",
    deadline: "Rolling",
    domain: "anthropic.com",
    fallbackText: "An",
    fallbackColor: "#6366f1",
  },
  {
    name: "Microsoft Startups",
    type: "Credits",
    benefit: "Azure credits up to $150K",
    deadline: "Rolling",
    domain: "microsoft.com",
    fallbackText: "MS",
    fallbackColor: "#0078D4",
  },
];

function GoogleG() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path d="M21.805 10.023H12v3.955h5.607c-.242 1.271-.966 2.348-2.058 3.07v2.55h3.328c1.948-1.793 3.07-4.436 3.07-7.598 0-.664-.05-1.322-.142-1.977Z" fill="#4285F4" />
      <path d="M12 22c2.79 0 5.129-.924 6.838-2.5l-3.328-2.55c-.924.62-2.105.985-3.51.985-2.7 0-4.987-1.823-5.805-4.274H2.755v2.63A10.32 10.32 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.195 13.66A6.197 6.197 0 0 1 5.87 11.7c0-.68.117-1.34.325-1.96V7.11H2.755A10.32 10.32 0 0 0 1.68 11.7c0 1.65.395 3.214 1.075 4.59l3.44-2.63Z" fill="#FBBC05" />
      <path d="M12 5.464c1.517 0 2.88.522 3.95 1.548l2.96-2.96C17.124 2.387 14.785 1.4 12 1.4A10.32 10.32 0 0 0 2.755 7.11l3.44 2.63C7.013 7.287 9.3 5.464 12 5.464Z" fill="#EA4335" />
    </svg>
  );
}

function AnimatedGroup({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 18, filter: "blur(12px)" }}
      className={className}
      initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
      ref={ref}
      transition={{ ...motionTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

function HeroHeader({ onOpenAuth }: { onOpenAuth: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div
        className={`transition-all duration-200 ${
          scrolled
            ? "mx-auto mt-4 max-w-[1120px] rounded-2xl border border-zinc-800 bg-black/80 backdrop-blur-xl"
            : "border-b border-zinc-900 bg-black/92"
        }`}
      >
        <div className="page-frame flex items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
          <Link href="/">
            <BrandLockup />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {[
              { label: "How it works", href: "#how-it-works" },
              { label: "Programs", href: "#top-opportunities" },
              { label: "For founders", href: "#final-cta" },
            ].map((item) => (
              <a
                className="text-[14px] text-zinc-400 transition-colors duration-150 hover:text-white"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              className="rounded-full px-4 py-2 text-[14px] text-zinc-400 transition-colors duration-150 hover:text-white"
              onClick={onOpenAuth}
              type="button"
            >
              Sign In
            </button>
            <button
              className="rounded-full bg-white px-4 py-2 text-[14px] font-medium text-black transition-colors duration-150 hover:bg-zinc-100"
              onClick={onOpenAuth}
              type="button"
            >
              Get Started →
            </button>
          </div>

          <button
            aria-label="Toggle navigation"
            className="flex size-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-300 md:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>

        {menuOpen ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-zinc-900 px-4 py-4 md:hidden"
            initial={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex flex-col gap-2">
              {[
                { label: "How it works", href: "#how-it-works" },
                { label: "Programs", href: "#top-opportunities" },
                { label: "For founders", href: "#final-cta" },
              ].map((item) => (
                <a
                  className="rounded-xl px-3 py-2 text-[14px] text-zinc-300 transition-colors hover:bg-[#0a0a0a] hover:text-white"
                  href={item.href}
                  key={item.label}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button
                className="mt-2 rounded-xl border border-zinc-800 px-3 py-2 text-left text-[14px] text-zinc-300"
                onClick={onOpenAuth}
                type="button"
              >
                Sign In
              </button>
              <button
                className="rounded-xl bg-white px-3 py-2 text-left text-[14px] font-medium text-black"
                onClick={onOpenAuth}
                type="button"
              >
                Get Started →
              </button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </header>
  );
}

function FooterColumn({
  title,
  links,
  onOpenAuth,
}: {
  title: string;
  links: string[];
  onOpenAuth: () => void;
}) {
  return (
    <div>
      <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-zinc-600">{title}</div>
      <div className="mt-5 flex flex-col gap-3">
        {links.map((link) => (
          <button
            className="w-fit text-left text-[14px] text-zinc-400 transition-colors hover:text-white"
            key={link}
            onClick={onOpenAuth}
            type="button"
          >
            {link}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { signIn } = useDemo();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("Arjun Mehta");
  const [startupLine, setStartupLine] = useState("");

  async function completeAuth() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    signIn();
    setOpen(false);
    router.push("/onboarding");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <HeroHeader onOpenAuth={() => setOpen(true)} />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[540px] overflow-hidden [mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]">
            <div className="absolute left-1/2 top-[-120px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[90px]" />
          </div>
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-[1120px] flex-col items-center justify-center px-4 pt-28 text-center sm:px-6">
          <AnimatedGroup delay={0.04}>
            <div className="inline-flex items-center rounded-full border border-white/8 bg-zinc-900 px-4 py-2 text-[12px] text-zinc-300">
              Applications open for YC, Antler, Google for Startups India
            </div>
          </AnimatedGroup>

          <AnimatedGroup className="mt-8" delay={0.12}>
            <div className="instrument-serif text-[62px] leading-[0.9] tracking-[-0.06em] text-white sm:text-[104px]">
              Stop pitching blind.
            </div>
          </AnimatedGroup>

          <AnimatedGroup className="max-w-[980px]" delay={0.2}>
            <div className="instrument-serif text-[58px] leading-[0.9] tracking-[-0.06em] text-zinc-400 sm:text-[98px]">
              Start applying where you actually fit.
            </div>
          </AnimatedGroup>

          <AnimatedGroup className="mt-5 max-w-2xl" delay={0.28}>
            <p className="text-[18px] leading-8 text-zinc-400">
              Drop in your deck, URL, or notes. Fundme.ai matches you to the right programs,
              drafts tailored applications for each one, and keeps everything in one place.
            </p>
          </AnimatedGroup>

          <AnimatedGroup className="mt-8 w-full max-w-[860px]" delay={0.36}>
            <form
              className="liquid-glass mx-auto flex w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/95"
              onSubmit={(event) => {
                event.preventDefault();
                setOpen(true);
              }}
            >
              <motion.input
                className="h-16 flex-1 border-0 bg-transparent px-5 text-[15px] text-white outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-cyan-500/40"
                onChange={(event) => setStartupLine(event.target.value)}
                placeholder="What are you building?"
                transition={{ duration: 0.2, ease: "easeOut" }}
                value={startupLine}
                whileFocus={{ scale: 1.01 }}
              />
              <motion.button
                className="h-16 shrink-0 bg-white px-6 text-[15px] font-medium text-black transition-colors hover:bg-cyan-500"
                type="submit"
                whileHover={{ scale: 1.02 }}
              >
                Find My Matches →
              </motion.button>
            </form>
            <div className="mt-3 text-center text-sm text-zinc-500">
              Free to start · No card needed · Drafts in minutes
            </div>
          </AnimatedGroup>

          <AnimatedGroup className="mt-6" delay={0.44}>
            <div className="text-xs text-zinc-600">
              For founders applying to accelerators, fellowships, incubators, and startup programs.
            </div>
          </AnimatedGroup>
        </div>
      </section>

      <div className="page-frame px-4 pb-6 sm:px-6 xl:px-8">
        <AnimatedGroup className="mx-auto max-w-[1120px]" delay={0.08}>
          <section className="border-t border-zinc-900 py-24" id="how-it-works">
            <div className="mx-auto max-w-[1040px]">
              <div className="text-center">
                <div className="text-[12px] uppercase tracking-[0.2em] text-cyan-500">How it works</div>
                <h2 className="text-[42px] font-semibold leading-none tracking-[-0.05em] text-white">
                  From startup material to matched applications.
                </h2>
                <p className="mx-auto mt-4 max-w-[760px] text-[15px] leading-7 text-zinc-400">
                  No long intake form. No rewriting the same company over and over. Just upload what you already have.
                </p>
              </div>

              <div className="relative mt-14 grid gap-5 md:grid-cols-3">
                <div className="pointer-events-none absolute left-[17%] right-[17%] top-11 hidden border-t border-dashed border-zinc-800 md:block" />
                {howItWorks.map((item, index) => (
                  <AnimatedGroup className="relative" delay={index * 0.12} key={item.title}>
                    <div className="rounded-[24px] border border-zinc-900 bg-[#0a0a0a] p-6">
                      <div className="text-[14px] font-medium text-cyan-500">{item.step}</div>
                      <div className="mt-5 flex size-12 items-center justify-center rounded-2xl border border-zinc-800 bg-black text-zinc-300">
                        <item.icon className="size-5" />
                      </div>
                      <div className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-white">
                        {item.title}
                      </div>
                      <div className="mt-3 text-[14px] leading-7 text-zinc-400">
                        {item.description}
                      </div>
                    </div>
                  </AnimatedGroup>
                ))}
              </div>
            </div>
          </section>
        </AnimatedGroup>

        <AnimatedGroup className="mx-auto max-w-[1120px]" delay={0.1}>
          <section className="border-t border-zinc-900 py-24">
            <div className="mx-auto max-w-[1040px]">
              <div className="text-center">
                <h2 className="text-[42px] font-semibold leading-none tracking-[-0.05em] text-white">
                  What founders get.
                </h2>
                <p className="mx-auto mt-4 max-w-[620px] text-[15px] leading-7 text-zinc-400">
                  Less rewriting. Better fit. Faster applications.
                </p>
              </div>

              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {founderOutcomes.map((item, index) => (
                  <AnimatedGroup className="relative" delay={index * 0.12} key={item.title}>
                    <div className="rounded-xl border border-zinc-900 bg-[#0a0a0a] p-6">
                      <item.icon className="size-5 text-zinc-300" />
                      <div className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-white">
                        {item.title}
                      </div>
                      <div className="mt-3 text-sm leading-relaxed text-zinc-400">{item.body}</div>
                    </div>
                  </AnimatedGroup>
                ))}
              </div>
            </div>
          </section>
        </AnimatedGroup>

        <AnimatedGroup className="mx-auto max-w-[1120px]" delay={0.1}>
          <section className="border-t border-zinc-900 py-24" id="top-opportunities">
            <div className="mx-auto max-w-[1040px]">
              <div className="text-[12px] uppercase tracking-[0.2em] text-cyan-500">Curated selection</div>
              <h2 className="mt-4 text-[42px] font-semibold leading-none tracking-[-0.05em] text-white">
                Programs worth your time.
              </h2>
              <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-zinc-400">
                Ranked by fit, not buried in a directory.
              </p>

              <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {curatedPrograms.map((program, index) => (
                  <AnimatedGroup delay={index * 0.08} key={program.name}>
                    <div className="rounded-[24px] border border-zinc-900 bg-[#0a0a0a] p-5">
                      <div className="flex items-start gap-3">
                        <LogoImage
                          domain={program.domain}
                          fallbackColor={program.fallbackColor}
                          fallbackText={program.fallbackText}
                          size={36}
                        />
                        <div>
                          <div className="text-[18px] font-semibold tracking-[-0.03em] text-white">
                            {program.name}
                          </div>
                          <div className="mt-2 inline-flex rounded-full border border-zinc-800 bg-black px-3 py-1 text-[11px] text-zinc-400">
                            {program.type}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 text-[13px] text-zinc-400">
                        <div className="rounded-2xl border border-zinc-900 bg-black px-4 py-3">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-600">Benefit</div>
                          <div className="mt-2 text-zinc-300">{program.benefit}</div>
                        </div>
                        <div className="rounded-2xl border border-zinc-900 bg-black px-4 py-3">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-600">Deadline</div>
                          <div className="mt-2 text-zinc-300">{program.deadline}</div>
                        </div>
                      </div>

                      <button
                        className="mt-6 w-full rounded-[16px] border border-zinc-800 bg-black px-4 py-3 text-[14px] text-white transition-colors hover:border-zinc-700 hover:text-zinc-200"
                        onClick={() => setOpen(true)}
                        type="button"
                      >
                        View
                      </button>
                    </div>
                  </AnimatedGroup>
                ))}
              </div>
            </div>
          </section>
        </AnimatedGroup>

        <AnimatedGroup className="mx-auto max-w-[1120px]" delay={0.14}>
          <section className="border-t border-zinc-900 py-14">
            <div className="mx-auto grid max-w-[1040px] gap-6 md:grid-cols-3">
              {[
                { value: "1 upload", label: "to unlock your application base" },
                { value: "50+", label: "programs tracked and ranked" },
                { value: "1 place", label: "for every draft and deadline" },
              ].map((item, index) => (
                <div
                  className={`px-4 text-center ${index < 2 ? "md:border-r md:border-zinc-800" : ""}`}
                  key={item.label}
                >
                  <div className="text-[32px] font-semibold tracking-[-0.04em] text-white">{item.value}</div>
                  <div className="mt-2 text-[13px] text-zinc-500">{item.label}</div>
                </div>
              ))}
            </div>
          </section>
        </AnimatedGroup>

        <AnimatedGroup className="mx-auto max-w-[1120px]" delay={0.16}>
          <section className="border-t border-zinc-900 py-24 text-center" id="final-cta">
            <div className="mx-auto max-w-[760px]">
              <h2 className="instrument-serif text-[52px] italic leading-none tracking-[-0.05em] text-white">
                One startup. Many applications.
              </h2>
              <p className="mt-5 text-[18px] leading-8 text-zinc-400">
                Upload once. Match faster. Draft smarter.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  className="rounded-full bg-white px-5 py-3 text-[15px] font-medium text-black transition-colors hover:bg-zinc-100"
                  onClick={() => setOpen(true)}
                  type="button"
                >
                  Get Started Free →
                </button>
                <a
                  className="rounded-full border border-zinc-800 px-5 py-3 text-[15px] text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
                  href="#how-it-works"
                >
                  See how it works
                </a>
              </div>
            </div>
          </section>
        </AnimatedGroup>

        <footer className="mx-auto max-w-[1120px] border-t border-zinc-800 bg-black px-8 py-16">
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <BrandLockup />
              <p className="mt-5 max-w-[260px] text-[14px] leading-7 text-zinc-500">
                The application layer for ambitious founders.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <LogoImage domain="linkedin.com" fallbackColor="#0077B5" fallbackText="in" size={20} />
                <LogoImage domain="x.com" fallbackColor="#000000" fallbackText="X" size={20} />
              </div>
            </div>

            <FooterColumn
              links={["Matches", "Applications", "Tracker", "Explore", "Add New Idea"]}
              onOpenAuth={() => setOpen(true)}
              title="Product"
            />
            <FooterColumn
              links={["How it works", "Program Directory", "For YC applicants", "For fellowship founders"]}
              onOpenAuth={() => setOpen(true)}
              title="Resources"
            />
            <FooterColumn
              links={["About", "Privacy", "Terms", "Contact", "Support"]}
              onOpenAuth={() => setOpen(true)}
              title="Company"
            />
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-zinc-800 pt-6 text-xs text-zinc-500 md:flex-row">
            <div>© 2026 Fundme.ai</div>
            <div>Built for VibeCon 2026 · Bengaluru</div>
          </div>
        </footer>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 px-4 backdrop-blur-sm">
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="liquid-glass w-full max-w-[400px] rounded-xl p-6"
            initial={{ opacity: 0, scale: 0.96 }}
          >
            <BrandLockup iconClassName="size-9" wordmarkClassName="text-[16px]" />
            <div className="mt-5 text-[24px] font-semibold tracking-[-0.03em] text-white">
              Sign in to continue
            </div>
            <div className="mt-2 text-[14px] leading-7 text-zinc-400">
              Your material stays private and editable.
            </div>

            <Button className="mt-8 w-full justify-center" onClick={completeAuth} size="lg">
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Signing in...
                </>
              ) : (
                <>
                  <GoogleG />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="my-5 flex items-center gap-3 text-[12px] text-zinc-600">
              <div className="h-px flex-1 bg-zinc-800" />
              <span>or</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            {!emailOpen ? (
              <Button className="w-full" onClick={() => setEmailOpen(true)} variant="ghost">
                Continue with email →
              </Button>
            ) : (
              <div className="space-y-3">
                <input
                  className="app-input h-11 rounded-[8px] px-3.5 text-sm"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  value={email}
                />
                <input
                  className="app-input h-11 rounded-[8px] px-3.5 text-sm"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name"
                  value={name}
                />
                <Button className="w-full" onClick={completeAuth}>
                  {loading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Starting...
                    </>
                  ) : (
                    "Start for free →"
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      ) : null}
    </main>
  );
}
