"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { ONBOARDING_DRAFT_KEY } from "@/components/app/demo-provider";

export default function ThankYouPage() {
  const { user } = useUser();
  const [draftData, setDraftData] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (saved) {
        setDraftData(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const firstName = user?.firstName ?? user?.fullName?.split(" ")[0] ?? draftData?.name?.split(" ")[0] ?? null;
  const resolvedEmail = user?.emailAddresses?.[0]?.emailAddress ?? draftData?.email ?? "your submitted email";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6f1ea] px-4 py-8 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex w-full max-w-[560px] flex-col items-center rounded-[28px] border border-black/[0.06] bg-white/90 px-5 py-8 text-center shadow-[0_24px_80px_rgba(18,15,11,0.08)] sm:px-10 sm:py-10"
      >
        <div className="mb-7 sm:mb-8">
          <BrandLockup />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
          className="mb-5 flex size-16 items-center justify-center rounded-full border border-[#ff6b3d]/10 bg-[#fff5f0] sm:mb-6 sm:size-20"
        >
          <CheckCircle2 className="size-8 text-[#ff6b3d] sm:size-9" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff6b3d]/10 bg-[#fff5f0] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#ff6b3d] sm:mb-5 sm:text-[12px]"
        >
          <Sparkles className="size-3" /> You&apos;re on the list
        </motion.div>

        <h1
          className="text-[28px] font-semibold leading-[1.08] tracking-[-0.04em] text-black sm:text-[40px]"
        >
          {firstName ? `Thanks, ${firstName}. You’re on the list.` : "Thanks, you’re on the list."}
        </h1>

        <div
          className="mx-auto mt-5 flex max-w-[460px] flex-col gap-3 text-center text-[14px] leading-relaxed text-[#4a4540] sm:mt-6 sm:text-[16px]"
        >
          <p>
            We’ve received your founder profile and startup context.
          </p>
          <p>
            Team Fundme will review what you shared and use it to prepare your early funding assessment.
          </p>
          <p>
            Fundme is being built by Totem Interactive to help founders sharpen their deck, positioning, and funding path before they apply.
          </p>
        </div>

        <div
          className="mt-6 flex w-full flex-col items-center gap-1.5 border-t border-black/8 pt-6 sm:mt-8 sm:pt-7"
        >
          <p className="text-[13px] sm:text-[14px] font-medium text-black/80">
            Look out for an email from Team Fundme soon.
          </p>
          <p className="text-[13px] sm:text-[14px] font-semibold text-black mt-1">
            Team Fundme
          </p>
          <p className="text-[12px] font-medium text-black/50">
            A Totem Interactive product
          </p>
          {resolvedEmail && resolvedEmail !== "your submitted email" && (
            <p className="mt-2 max-w-[320px] break-all text-[12px] text-black/45">
              Updates routed to: <span className="font-medium text-black/60">{resolvedEmail}</span>
            </p>
          )}
        </div>

        <div
          className="mt-7 sm:mt-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black/[0.03] hover:bg-black/[0.06] transition-colors text-[13px] sm:text-[14px] font-semibold text-black"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
