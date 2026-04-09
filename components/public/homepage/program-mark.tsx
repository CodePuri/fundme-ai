"use client";

import Image from "next/image";

import { getStartupProgramBrand } from "@/lib/startup-program-brands";
import { cn } from "@/lib/utils";

import type { ProgramVisual } from "./homepage-data";

export function ProgramMark({
  program,
  size = 44,
  className,
}: {
  program: ProgramVisual;
  size?: number;
  className?: string;
}) {
  const borderRadius = Math.max(14, Math.round(size * 0.34));

  if (program.mark === "antler") {
    return (
      <div
        className={cn("flex shrink-0 items-center justify-center border border-black/8 bg-[#ff6c59] text-white", className)}
        style={{ width: size, height: size, borderRadius }}
      >
        <span style={{ fontSize: Math.max(18, Math.round(size * 0.45)), fontWeight: 700, letterSpacing: "-0.08em" }}>A</span>
      </div>
    );
  }

  if (program.mark === "aws") {
    return (
      <div
        className={cn("flex shrink-0 flex-col items-center justify-center border border-black/8 bg-[#232f3e] text-white", className)}
        style={{ width: size, height: size, borderRadius }}
      >
        <span style={{ fontSize: Math.max(9, Math.round(size * 0.2)), fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase" }}>
          aws
        </span>
        <span
          className="mt-1 rounded-full bg-[#ff9900]"
          style={{ width: Math.round(size * 0.42), height: Math.max(2, Math.round(size * 0.06)) }}
        />
      </div>
    );
  }

  const brand = getStartupProgramBrand({
    name: program.name,
    slug: program.slug ?? program.id ?? program.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  });

  if (brand.assetPath) {
    return (
      <div
        className={cn("relative shrink-0 overflow-hidden border border-black/8 bg-white", className)}
        style={{ width: size, height: size, borderRadius }}
      >
        <div className="absolute inset-0" style={{ background: brand.background ?? "#ffffff" }} />
        <Image
          alt={`${program.name} logo`}
          className="relative z-10 h-full w-full object-contain"
          height={size}
          src={brand.assetPath}
          style={{ padding: brand.padding ?? "9px" }}
          unoptimized
          width={size}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center border border-black/8 bg-white font-semibold text-white", className)}
      style={{ width: size, height: size, borderRadius, background: brand.fallbackColor }}
    >
      <span style={{ fontSize: Math.max(11, Math.round(size * 0.28)), letterSpacing: "-0.04em" }}>{brand.fallbackText}</span>
    </div>
  );
}
