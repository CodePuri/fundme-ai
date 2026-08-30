export const PREVIEW_OPPORTUNITY_COUNT = 42;

export const PREVIEW_MATCH_CATEGORIES = [
  { label: "Investors and VC firms", count: 12 },
  { label: "Accelerators", count: 9 },
  { label: "Incubators", count: 8 },
  { label: "Grants and government programs", count: 13 },
] as const;

export type PreviewMatch = {
  id: string;
  name: string;
  category: (typeof PREVIEW_MATCH_CATEGORIES)[number]["label"];
  previewSignal: "Illustrative category fixture";
  reason: string;
  stage: string;
  geography: string;
  value: string;
  deadline: string;
  sourceStatus: "Preview fixture · verification pending";
};

const MATCH_FIXTURES: PreviewMatch[] = [
  {
    id: "signal-seed-fund",
    name: "Signal Seed Fund",
    category: "Investors and VC firms",
    previewSignal: "Illustrative category fixture",
    reason: "Shows how an investor-category card can explain stage and evidence requirements. This is not a personalized recommendation.",
    stage: "Pre-seed to seed",
    geography: "India + global",
    value: "Illustrative $250k–$1m check",
    deadline: "Rolling",
    sourceStatus: "Preview fixture · verification pending",
  },
  {
    id: "launchpad-accelerator",
    name: "Launchpad Accelerator",
    category: "Accelerators",
    previewSignal: "Illustrative category fixture",
    reason: "Shows how an accelerator path could describe readiness and narrative support. Eligibility has not been checked.",
    stage: "Pre-seed",
    geography: "Remote",
    value: "Illustrative mentor-led cohort",
    deadline: "Preview date unavailable",
    sourceStatus: "Preview fixture · verification pending",
  },
  {
    id: "forge-venture-studio",
    name: "Forge Venture Incubator",
    category: "Incubators",
    previewSignal: "Illustrative category fixture",
    reason: "Shows how an incubator path could present early validation and narrative-building support. Eligibility has not been checked.",
    stage: "Idea to MVP",
    geography: "India",
    value: "Illustrative workspace + operator support",
    deadline: "Rolling",
    sourceStatus: "Preview fixture · verification pending",
  },
  {
    id: "founder-evidence-grant",
    name: "Founder Evidence Grant",
    category: "Grants and government programs",
    previewSignal: "Illustrative category fixture",
    reason: "Shows how a non-dilutive path could present eligibility and evidence requirements. No live program has been verified.",
    stage: "MVP to early revenue",
    geography: "India",
    value: "Illustrative non-dilutive support",
    deadline: "Preview date unavailable",
    sourceStatus: "Preview fixture · verification pending",
  },
];

export function getPreviewMatches(): PreviewMatch[] {
  return MATCH_FIXTURES;
}
