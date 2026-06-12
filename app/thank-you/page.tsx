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
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-[520px] w-full"
      >
        <div className="mb-8 sm:mb-10">
          <BrandLockup />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
          className="flex size-16 sm:size-20 items-center justify-center rounded-full bg-[#fff5f0] border border-[#ff6b3d]/10 mb-6 sm:mb-8"
        >
          <CheckCircle2 className="size-8 sm:size-9 text-[#ff6b3d]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[28px] sm:text-[42px] font-semibold tracking-[-0.04em] leading-[1.1] text-black"
        >
          {firstName ? `Thanks, ${firstName}. We've got it.` : "Thanks, we've got it."}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
          className="mt-4 sm:mt-6 flex flex-col gap-3 text-[14px] sm:text-[16px] text-black/60 leading-relaxed max-w-[460px] mx-auto text-center"
        >
          <p>
            We’ve received your founder profile and startup context.
          </p>
          <p>
            Team Fundme will review what you shared and use it to prepare your early funding assessment.
          </p>
          <p>
            Fundme AI helps founders sharpen their deck, positioning, and funding path before they apply.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-black/5 w-full flex flex-col items-center gap-1.5"
        >
          <p className="text-[13px] sm:text-[14px] font-medium text-black/80">
            Look out for an email from Fundme soon.
          </p>
          <p className="text-[13px] sm:text-[14px] font-semibold text-black mt-1">
            Team Fundme AI
          </p>
          <p className="text-[12px] font-medium text-black/40">
            A Totem Interactive product
          </p>
          {resolvedEmail && resolvedEmail !== "your submitted email" && (
            <p className="text-[12px] text-black/40 mt-2 break-all max-w-[300px]">
              Updates routed to: <span className="font-medium text-black/60">{resolvedEmail}</span>
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black/[0.03] hover:bg-black/[0.06] transition-colors text-[13px] sm:text-[14px] font-semibold text-black min-w-[160px]"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#171513] hover:bg-[#2a2622] transition-colors text-[13px] sm:text-[14px] font-medium text-white min-w-[160px]"
          >
            Explore programs
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
