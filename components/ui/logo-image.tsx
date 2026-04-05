"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

import { cn } from "@/lib/utils";

export function LogoImage({
  domain,
  fallbackText,
  fallbackColor,
  size = 36,
  className,
  grayscale = false,
}: {
  domain: string;
  fallbackText: string;
  fallbackColor: string;
  size?: number;
  className?: string;
  grayscale?: boolean;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg text-xs font-bold text-white",
          className,
        )}
        style={{ width: size, height: size, background: fallbackColor }}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      alt={`${fallbackText} logo`}
      className={cn(
        "rounded-lg bg-zinc-900 p-1 object-contain",
        grayscale && "grayscale opacity-75",
        className,
      )}
      onError={() => setError(true)}
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      style={{ width: size, height: size }}
    />
  );
}
