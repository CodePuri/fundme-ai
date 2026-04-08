export type ProgramMarkKind = "antler" | "aws";

export type ProgramVisual = {
  id?: string;
  name: string;
  slug?: string;
  mark?: ProgramMarkKind;
};

export type EcosystemProgram = ProgramVisual & {
  label: string;
};

export const ecosystemPrograms: readonly EcosystemProgram[] = [
  {
    id: "yc",
    name: "Y Combinator",
    slug: "y-combinator",
    label: "Accelerator",
  },
  {
    id: "antler",
    name: "Antler",
    mark: "antler",
    label: "Investor-backed builder program",
  },
  {
    id: "google",
    name: "Google for Startups",
    slug: "google-for-startups-accelerator",
    label: "Platform support",
  },
  {
    id: "techstars",
    name: "Techstars",
    slug: "techstars",
    label: "Mentor-led accelerator",
  },
  {
    id: "aws",
    name: "AWS Activate",
    mark: "aws",
    label: "Credits and cloud support",
  },
  {
    id: "500",
    name: "500 Global",
    slug: "500-global",
    label: "Global operator network",
  },
] as const;

export const homepageStats = [
  {
    value: "1 base",
    label: "for your deck, notes, traction, and old answers after one upload.",
  },
  {
    value: "50+ programs",
    label: "screened by thesis, timing, and founder fit before you spend time drafting.",
  },
  {
    value: "1 tracker",
    label: "for deadlines, blockers, drafts, and what needs to move next.",
  },
  {
    value: "100+ hours",
    label: "reclaimed across a real application cycle by not rebuilding the same company story.",
  },
] as const;

export const storySteps = [
  {
    id: "upload",
    eyebrow: "01",
    title: "Bring the material",
    description: "Decks, notes, links, and old answers are pulled into one usable application base.",
  },
  {
    id: "match",
    eyebrow: "02",
    title: "See the shortlist",
    description: "Programs are ranked by timing, thesis, and founder fit before you start drafting.",
  },
  {
    id: "draft",
    eyebrow: "03",
    title: "Draft from context",
    description: "Each application inherits the right story, traction, and founder evidence for that room.",
  },
] as const;

export const proofHighlights = [
  {
    title: "Founder story structured",
    description: "The company narrative, traction, and founder context become one clean application base.",
  },
  {
    title: "Program fit attached",
    description: "Each shortlisted room comes with clear why-now logic instead of a guessed application choice.",
  },
  {
    title: "Draft context carried forward",
    description: "Answers inherit the right traction points, founder evidence, and open blockers as you move.",
  },
] as const;

export const proofInputs = [
  "Pitch deck.pdf",
  "Founder memo",
  "Product notes",
  "Traction updates",
] as const;

export const proofQueue = [
  {
    name: "Y Combinator",
    stage: "Draft ready",
    fit: "94",
    deadline: "Oct 2026",
    slug: "y-combinator",
  },
  {
    name: "Antler",
    stage: "Needs founder note",
    fit: "91",
    deadline: "Rolling",
    mark: "antler" as const,
  },
  {
    name: "Google for Startups",
    stage: "Narrative locked",
    fit: "87",
    deadline: "Dec 2026",
    slug: "google-for-startups-accelerator",
  },
] as const;

export const proofTrackerSummary = [
  {
    title: "3 drafts moving",
    detail: "Applications already structured for final review.",
  },
  {
    title: "2 deadlines surfaced",
    detail: "Priority rooms ranked before they slip this week.",
  },
  {
    title: "1 blocker left",
    detail: "Only one founder note is still holding back the queue.",
  },
] as const;

export const matchedPrograms = [
  {
    id: "yc",
    name: "Y Combinator",
    slug: "y-combinator",
    fitLabel: "Strong match",
    deadline: "Oct 2026",
    why: "Clear founder-market fit and a wedge that explains itself quickly in a partner room.",
  },
  {
    id: "antler",
    name: "Antler",
    mark: "antler" as const,
    fitLabel: "Strong match",
    deadline: "Rolling",
    why: "Early traction and operator context make the story strong before the application even gets long.",
  },
  {
    id: "google",
    name: "Google for Startups",
    slug: "google-for-startups-accelerator",
    fitLabel: "Good match",
    deadline: "Dec 2026",
    why: "Worth pursuing for technical support, AI leverage, and a program where the operating story is credible.",
  },
  {
    id: "techstars",
    name: "Techstars",
    slug: "techstars",
    fitLabel: "Good match",
    deadline: "Nov 2026",
    why: "A strong room if you want structured founder support and a sharper application narrative.",
  },
] as const;
