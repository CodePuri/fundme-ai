"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Link2, Sparkles, LoaderCircle } from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";

export default function AssessmentPage() {
  const router = useRouter();
  const { state, setWebsiteUrl, setStartupName, setLinkedInUrl } = useAssessment();

  const [website, setWebsite] = useState(state.websiteUrl);
  const [startup, setStartup] = useState(state.startupName);
  const [linkedin, setLinkedin] = useState(state.linkedInUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleStartAnalysis() {
    setError(null);
    if (!website.trim()) {
      setError("Please enter your website URL to begin the analysis.");
      return;
    }

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[^\s]*)?$/i;
    const cleanUrl = website.trim();
    if (!urlPattern.test(cleanUrl)) {
      setError("Please enter a valid website URL (e.g., https://yourstartup.com)");
      return;
    }

    setIsSubmitting(true);
    setWebsiteUrl(cleanUrl);
    if (startup.trim()) setStartupName(startup.trim());
    if (linkedin.trim()) setLinkedInUrl(linkedin.trim());

    // Small delay to let localStorage sync
    setTimeout(() => {
      router.push("/assessment/questions");
    }, 200);
  }

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171513]" data-theme="public">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e7ddd0] bg-[#f6f1ea]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 sm:px-6 xl:px-8 py-3">
          <Link href="/">
            <BrandLockup />
          </Link>
          <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#8b8276]">
            Assessment
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="w-full max-w-[520px]"
        >
          {/* Badge */}
          <div className="mb-8 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white/92 px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#8b8276]">
              <Sparkles className="size-3 text-[#ff6b3d]" />
              Free funding readiness scan
            </div>
          </div>

          <h1 className="text-[32px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#171513] sm:text-[38px]">
            Analyze your funding fit
          </h1>
          <p className="mt-4 text-[16px] leading-[1.7] text-[#6f685f]">
            Drop your website. We will scan your positioning, founder signals, and application readiness against real accelerator and grant criteria.
          </p>

          {/* Form */}
          <div className="mt-10 space-y-5">
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-[0.12em] text-[#6f685f] mb-2.5">
                Website URL <span className="text-[#ff6b3d]">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8b8276]" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourstartup.com"
                  className="h-12 w-full rounded-[12px] border border-black/[0.08] bg-white/[0.88] pl-11 pr-4 text-[15px] text-[#171513] placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6b3d]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-[0.12em] text-[#6f685f] mb-2.5">
                Startup Name
              </label>
              <input
                type="text"
                value={startup}
                onChange={(e) => setStartup(e.target.value)}
                placeholder="e.g., Flowstate AI"
                className="h-12 w-full rounded-[12px] border border-black/[0.08] bg-white/[0.88] px-4 text-[15px] text-[#171513] placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6b3d]/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-[0.12em] text-[#6f685f] mb-2.5">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8b8276]" />
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/yourname"
                  className="h-12 w-full rounded-[12px] border border-black/[0.08] bg-white/[0.88] pl-11 pr-4 text-[15px] text-[#171513] placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6b3d]/10 transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[13px] text-[#ff6b3d] font-medium"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              onClick={handleStartAnalysis}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#ff6b3d] px-8 text-[15px] font-medium text-white shadow-[0_12px_32px_rgba(255,107,61,0.24)] transition-colors hover:bg-[#f45d2e] disabled:opacity-60 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Preparing your scan...
                </>
              ) : (
                <>
                  Analyze my funding fit
                  <ArrowRight className="size-4" />
                </>
              )}
            </motion.button>

            <p className="text-center text-[12px] text-[#8b8276]">
              Takes about 2 minutes. No credit card required.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
