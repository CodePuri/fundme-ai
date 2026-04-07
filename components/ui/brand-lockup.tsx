"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandLockup({
  className,
  size = "md",
  surface = "plain",
  iconClassName,
  wordmarkClassName,
}: {
  className?: string;
  size?: "sm" | "md";
  surface?: "plain" | "plate";
  iconClassName?: string;
  wordmarkClassName?: string;
}) {
  const resolvedSize = size === "sm" || iconClassName?.includes("size-9") || wordmarkClassName?.includes("text-[16px]") ? "sm" : "md";

  return (
    <div
      className={cn(
        "inline-flex items-center",
        surface === "plate" && "rounded-[14px] bg-white px-3 py-2 shadow-[0_1px_0_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)]",
        surface === "plate" && resolvedSize === "sm" && "rounded-[12px] px-2.5 py-1.5",
        className,
      )}
    >
      <Image
        alt="Fundme"
        className={cn("h-auto shrink-0 object-contain", resolvedSize === "md" ? "w-[144px]" : "w-[116px]")}
        height={1024}
        priority
        src="/fundme-logo.png"
        width={1536}
      />
    </div>
  );
}
