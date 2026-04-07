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
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        alt="Fundme"
        className={cn("h-auto w-[150px] shrink-0 object-contain", iconClassName, wordmarkClassName)}
        height={1024}
        priority
        src="/fundme-logo.png"
        width={1536}
      />
    </div>
  );
}
