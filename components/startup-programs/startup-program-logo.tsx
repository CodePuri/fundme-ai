"use client";

import Image from "next/image";

import { getStartupProgramBrand } from "@/lib/startup-program-brands";
import { cn } from "@/lib/utils";

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
        <Image
          alt={`${name} logo`}
          className="h-full w-full object-contain"
          height={size}
          src={brand.assetPath}
          style={{ padding: brand.padding ?? "10px" }}
          unoptimized
          width={size}
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
