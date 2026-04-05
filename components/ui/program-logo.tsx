"use client";

import { LogoImage } from "@/components/ui/logo-image";

const PROGRAM_LOGO_META: Record<
  string,
  { fallbackText: string; fallbackColor: string }
> = {
  "yc-w26": { fallbackText: "YC", fallbackColor: "#FF6600" },
  "antler-india": { fallbackText: "AN", fallbackColor: "#1E3A8A" },
  "google-for-startups": { fallbackText: "GS", fallbackColor: "#4285F4" },
  "techstars-mumbai": { fallbackText: "TE", fallbackColor: "#0070f3" },
  "nasscom-10k": { fallbackText: "NA", fallbackColor: "#6C3483" },
  "500-global": { fallbackText: "5G", fallbackColor: "#E74C3C" },
  surge: { fallbackText: "SU", fallbackColor: "#1DB954" },
  "aws-activate": { fallbackText: "AW", fallbackColor: "#FF9900" },
  "anthropic-startup-credits": { fallbackText: "An", fallbackColor: "#6366f1" },
  "microsoft-for-startups": { fallbackText: "MS", fallbackColor: "#0078D4" },
  "sequoia-arc": { fallbackText: "SA", fallbackColor: "#dc2626" },
  "entrepreneur-first-india": { fallbackText: "EF", fallbackColor: "#7c3aed" },
  "founder-institute": { fallbackText: "FI", fallbackColor: "#0f766e" },
  "nasscom-deeptech": { fallbackText: "ND", fallbackColor: "#6C3483" },
  "india-accelerator": { fallbackText: "IA", fallbackColor: "#2563eb" },
};

export function ProgramLogo({
  slug,
  domain,
  size = 36,
  grayscale = false,
}: {
  slug: string;
  domain: string;
  size?: number;
  grayscale?: boolean;
}) {
  const meta = PROGRAM_LOGO_META[slug] ?? {
    fallbackText: slug.slice(0, 2).toUpperCase(),
    fallbackColor: "#27272a",
  };

  return (
    <LogoImage
      domain={domain}
      fallbackColor={meta.fallbackColor}
      fallbackText={meta.fallbackText}
      grayscale={grayscale}
      size={size}
    />
  );
}
