"use client";

/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/utils";
import { getStartupProgramBrand } from "@/lib/startup-program-brands";

export function StartupProgramLogo({
  slug,
  name,
  size = 44,
  className,
}: {
  slug: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const brand = getStartupProgramBrand({ slug, name });

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[12px] border border-black/8 shadow-[0_6px_20px_rgba(17,17,17,0.05)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: brand.background ?? "#FFFFFF",
      }}
    >
      {brand.assetPath ? (
        <img
          alt={`${name} logo`}
          className="h-full w-full object-contain"
          src={brand.assetPath}
          style={{ padding: brand.padding ?? "10px" }}
        />
      ) : (
        <span
          className="text-[11px] font-semibold uppercase tracking-[-0.01em]"
          style={{ color: brand.fallbackColor }}
        >
          {brand.fallbackText}
        </span>
      )}
    </div>
  );
}
