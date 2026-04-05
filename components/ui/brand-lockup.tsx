"use client";

import { cn } from "@/lib/utils";

function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#050505" height="24" rx="4" width="24" />
      <path d="M3 3H10.5L3 10.5V3Z" fill="#fff" />
      <path d="M11.25 3H18.75L11.25 10.5V3Z" fill="#fff" />
      <path d="M3 11.25H10.5L3 18.75V11.25Z" fill="#fff" />
      <path d="M11.25 11.25H18.75L11.25 18.75V11.25Z" fill="#fff" />
      <path d="M3 19.5H10.5L3 27V19.5Z" fill="#fff" transform="translate(0 -3)" />
      <path d="M19.5 3V19.5H3L19.5 3Z" fill="none" stroke="#050505" strokeWidth="1.6" />
    </svg>
  );
}

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
      <BrandMark className={cn("size-8 shrink-0", iconClassName)} />
      <div className={cn("text-[15px] font-semibold tracking-[-0.02em] text-white", wordmarkClassName)}>
        Fundme.<span className="text-cyan-500">ai</span>
      </div>
    </div>
  );
}
