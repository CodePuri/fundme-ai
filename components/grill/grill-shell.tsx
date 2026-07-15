import Link from "next/link";
import { ArrowLeft, Check, Search } from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { cn } from "@/lib/utils";

const STEPS = ["Founder", "Startup", "Evidence", "Review"] as const;

export function GrillShell({
  children,
  currentStep,
  interactionLocked = false,
  onStepSelect,
}: {
  children: React.ReactNode;
  currentStep: number;
  interactionLocked?: boolean;
  onStepSelect: (step: number) => void;
}) {
  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171513]" data-theme="public">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link aria-label="Fundme homepage" href="/" prefetch={false}>
              <BrandLockup />
            </Link>
            <span className="hidden border-l border-black/10 pl-3 text-xs font-semibold text-[#b44828] sm:inline">
              Grill Preview
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              className="inline-flex size-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#171513] transition-colors hover:bg-[#f6f1ea]"
              href="/search"
              prefetch={false}
              title="Explore funding programs"
            >
              <Search aria-hidden="true" className="size-4" />
              <span className="sr-only">Explore funding programs</span>
            </Link>
            <Link
              className="hidden items-center gap-2 text-sm font-semibold text-[#5e5750] hover:text-[#171513] sm:inline-flex"
              href="/"
              prefetch={false}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Homepage
            </Link>
          </nav>
        </div>
      </header>

      <div className="border-b border-black/10 bg-[#171513] text-white">
        <div className="mx-auto grid max-w-[1180px] grid-cols-4 px-2 sm:px-6">
          {STEPS.map((label, index) => {
            const complete = index < currentStep;
            const active = index === currentStep;
            return (
              <button
                className={cn(
                  "flex min-h-14 min-w-0 items-center justify-center gap-1 border-b-[3px] px-1 transition-colors sm:gap-2 sm:px-2",
                  active
                    ? "border-[#ff6b3d] text-white"
                    : complete
                      ? "border-[#37b26c] text-[#dff8e8]"
                      : "border-transparent text-white/50",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
                disabled={interactionLocked || index > currentStep}
                key={label}
                onClick={() => onStepSelect(index)}
                type="button"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border text-[9px] sm:size-5 sm:text-[10px]",
                    complete
                      ? "border-[#37b26c] bg-[#37b26c] text-[#102118]"
                      : active
                        ? "border-[#ff6b3d] text-[#ffb59e]"
                        : "border-white/25",
                  )}
                >
                  {complete ? <Check aria-hidden="true" className="size-3" /> : index + 1}
                </span>
                <span className="truncate text-[10px] font-semibold sm:text-sm">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {children}
    </main>
  );
}
