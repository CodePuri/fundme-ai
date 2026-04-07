"use client";

import Image from "next/image";

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
  const compact = iconClassName?.includes("size-9") || wordmarkClassName?.includes("text-[16px]");

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[14px] bg-white px-3 py-2 shadow-[0_1px_0_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)]",
        compact && "rounded-[12px] px-2.5 py-1.5",
        className,
      )}
    >
      <Image
        alt="Fundme"
        className={cn("h-auto w-[144px] shrink-0 object-contain", compact && "w-[116px]")}
        height={1024}
        priority
        src="/fundme-logo.png"
        width={1536}
      />
    </div>
  );
}
