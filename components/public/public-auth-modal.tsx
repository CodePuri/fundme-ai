"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function GoogleG({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <path
        d="M21.805 10.023H12v3.955h5.607c-.242 1.271-.966 2.348-2.058 3.07v2.55h3.328c1.948-1.793 3.07-4.436 3.07-7.598 0-.664-.05-1.322-.142-1.977Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.79 0 5.129-.924 6.838-2.5l-3.328-2.55c-.924.62-2.105.985-3.51.985-2.7 0-4.987-1.823-5.805-4.274H2.755v2.63A10.32 10.32 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.195 13.66A6.197 6.197 0 0 1 5.87 11.7c0-.68.117-1.34.325-1.96V7.11H2.755A10.32 10.32 0 0 0 1.68 11.7c0 1.65.395 3.214 1.075 4.59l3.44-2.63Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.464c1.517 0 2.88.522 3.95 1.548l2.96-2.96C17.124 2.387 14.785 1.4 12 1.4A10.32 10.32 0 0 0 2.755 7.11l3.44 2.63C7.013 7.287 9.3 5.464 12 5.464Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function PublicAuthModal({
  open,
  loading,
  onClose,
  onContinue,
}: {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onContinue: () => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = "public-auth-title";
  const descriptionId = "public-auth-description";

  const focusableSelectors = useMemo(
    () =>
      [
        "button:not([disabled])",
        "[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(","),
    [],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    primaryButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelectors);
      if (!focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusableSelectors, onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4 backdrop-blur-sm"
      role="dialog"
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[420px] rounded-[24px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] overscroll-contain"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        ref={dialogRef}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between gap-4">
          <BrandLockup size="sm" />
          <button
            aria-label="Close sign-in dialog"
            className="inline-flex size-9 items-center justify-center rounded-full border border-black/8 text-[#5f584f] transition-colors hover:bg-[#faf6f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b3d]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-[#111111]" id={titleId}>
            Sign In to Continue
          </h2>
          <p className="mt-2 text-[14px] leading-7 text-[#6d665e]" id={descriptionId}>
            Browse everything. Sign in only when you want to act on a program.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-[12px] font-medium uppercase tracking-[0.14em] text-[#8d8578]" htmlFor="auth-email">
              Work Email
            </label>
            <Input
              autoComplete="email"
              className="editorial-input h-11 rounded-[12px] border-black/8 bg-[#faf6f0] text-[#111111]"
              id="auth-email"
              inputMode="email"
              name="email"
              placeholder="founder@flowstate.ai…"
              spellCheck={false}
              type="email"
              value="arjun@flowstate.ai"
              readOnly
            />
          </div>

          <Button
            className="h-12 w-full rounded-[12px] border-[#111111] bg-[#111111] text-white hover:border-[#2f2a24] hover:bg-[#2f2a24] focus-visible:ring-[#111111]/20 focus-visible:ring-offset-white"
            onClick={onContinue}
            ref={primaryButtonRef}
            size="lg"
          >
            {loading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing In…
              </>
            ) : (
              <>
                <GoogleG className="size-5" />
                Continue with Google
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

