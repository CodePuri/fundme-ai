"use client";

import { cn } from "@/lib/utils";

export function BrandLockup({
  className,
  iconClassName,
  wordmarkClassName,
}: {
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-md border border-white/10 bg-zinc-950",
          iconClassName,
        )}
      >
        <span className="instrument-serif text-[22px] italic leading-none text-white">f</span>
      </div>
      <div className={cn("text-[15px] font-semibold tracking-[-0.02em] text-white", wordmarkClassName)}>
        Fundme.<span className="text-cyan-500">ai</span>
      </div>
    </div>
  );
}
