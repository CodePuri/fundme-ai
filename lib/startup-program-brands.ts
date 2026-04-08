import { type StartupProgram } from "@/lib/startup-programs";

export type StartupProgramBrand = {
  assetPath?: string;
  fallbackText: string;
  fallbackColor: string;
  background?: string;
  padding?: string;
};

const curatedBrands: Record<string, StartupProgramBrand> = {
  "y-combinator": {
    assetPath: "/startup-program-brands/y-combinator.svg",
    fallbackText: "YC",
    fallbackColor: "#FF7A00",
    background: "#FFF7ED",
    padding: "10px",
  },
  techstars: {
    assetPath: "/startup-program-brands/techstars.svg",
    fallbackText: "TS",
    fallbackColor: "#265DFF",
    background: "#F8FAFF",
    padding: "9px",
  },
  "500-global": {
    assetPath: "/startup-program-brands/500-global.svg",
    fallbackText: "500",
    fallbackColor: "#E84B3C",
    background: "#FFF7F5",
    padding: "9px",
  },
  "google-for-startups-accelerator": {
    assetPath: "/startup-program-brands/google-for-startups-accelerator.svg",
    fallbackText: "G",
    fallbackColor: "#4285F4",
    background: "#FFFFFF",
    padding: "8px",
  },
  masschallenge: {
    assetPath: "/startup-program-brands/masschallenge.svg",
    fallbackText: "MC",
    fallbackColor: "#111111",
    background: "#FFFFFF",
    padding: "8px",
  },
  sosv: {
    assetPath: "/startup-program-brands/sosv.svg",
    fallbackText: "SOSV",
    fallbackColor: "#111111",
    background: "#FFFFFF",
    padding: "8px",
  },
  "plug-and-play": {
    assetPath: "/startup-program-brands/plug-and-play.svg",
    fallbackText: "PnP",
    fallbackColor: "#E53935",
    background: "#FFFFFF",
    padding: "9px",
  },
  "alchemist-accelerator": {
    assetPath: "/startup-program-brands/alchemist-accelerator.svg",
    fallbackText: "A",
    fallbackColor: "#0F766E",
    background: "#F4FFFC",
    padding: "9px",
  },
  seedcamp: {
    assetPath: "/startup-program-brands/seedcamp.svg",
    fallbackText: "SC",
    fallbackColor: "#111111",
    background: "#FFFFFF",
    padding: "9px",
  },
  "entrepreneurs-first": {
    assetPath: "/startup-program-brands/entrepreneurs-first.svg",
    fallbackText: "EF",
    fallbackColor: "#111111",
    background: "#FFFFFF",
    padding: "10px",
  },
  surge: {
    assetPath: "/startup-program-brands/surge.svg",
    fallbackText: "SU",
    fallbackColor: "#16A34A",
    background: "#F5FFF7",
    padding: "9px",
  },
  "t-hub": {
    assetPath: "/startup-program-brands/t-hub.svg",
    fallbackText: "TH",
    fallbackColor: "#E11D48",
    background: "#FFF7FA",
    padding: "9px",
  },
};

const fallbackPalette = [
  "#D9485F",
  "#2563EB",
  "#0F766E",
  "#7C3AED",
  "#EA580C",
  "#0EA5E9",
  "#CA8A04",
  "#475569",
];

function buildFallbackText(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
}

function pickFallbackColor(slug: string) {
  let total = 0;

  for (const character of slug) {
    total += character.charCodeAt(0);
  }

  return fallbackPalette[total % fallbackPalette.length];
}

export function getStartupProgramBrand(program: Pick<StartupProgram, "slug" | "name">): StartupProgramBrand {
  const curated = curatedBrands[program.slug];

  if (curated) {
    return curated;
  }

  return {
    fallbackText: buildFallbackText(program.name),
    fallbackColor: pickFallbackColor(program.slug),
    background: "#F9F4EC",
    padding: "10px",
  };
}
