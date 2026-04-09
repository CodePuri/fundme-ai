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
    value: "1 upload",
    label: "to build your application base — deck, notes, traction, and old answers extracted in one pass.",
  },
  {
    value: "50 applications",
    label: "draftable from one startup story instead of rebuilding context from scratch every time.",
  },
  {
    value: "1 place",
    label: "to manage deadlines, drafts, and statuses instead of juggling tabs, docs, and spreadsheets.",
  },
  {
    value: "100+ hrs",
    label: "saved by not rewriting applications from scratch across an entire application cycle.",
  },
] as const;

export const storySteps = [
  {
    id: "upload",
    eyebrow: "01",
    title: "Upload what you have",
    description: "Deck, notes, URL, or just describe it. No form, no intake call.",
  },
  {
    id: "match",
    eyebrow: "02",
    title: "See where you fit",
    description: "Scored against real programs so you know where the narrative lands fastest.",
  },
  {
    id: "draft",
    eyebrow: "03",
    title: "Draft faster",
    description: "Each program cares about something different. Fundme adapts the story for you.",
  },
] as const;

export const proofStages = [
  {
    label: "Founder inputs",
    items: ["Pitch deck.pdf", "Founder memo", "Traction notes", "Old YC answers"],
  },
  {
    label: "Structured base",
    items: ["Company narrative locked", "Traction quantified", "Founder story extracted", "Gaps identified"],
  },
  {
    label: "Output layer",
    items: ["Matched queue ranked", "Draft answers generated", "Deadlines surfaced", "Status tracked"],
  },
] as const;

export const proofHighlights = [
  {
    title: "Profile extracted",
    status: "Ready to use",
    description:
      "Pitch deck, notes, product URL, traction notes, and founder context are pulled into one structured application base.",
  },
  {
    title: "Best-fit programs shortlisted",
    status: "Match you here",
    description:
      "Programs are screened by timing, thesis, wedge, traction, and whether the room is worth asking on right now.",
  },
  {
    title: "Drafts generated",
    status: "Draft ready",
    description:
      "Each application gets a unique version of the same story instead of a recycled answer pasted across forms.",
  },
  {
    title: "Deadlines synced",
    status: "Always current",
    description:
      "Deadlines, drafts, missing inputs, and next actions live in one operating layer instead of scattered tabs and docs.",
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
    title: "1",
    subtitle: "Application base",
    detail: "built once from your deck, traction, and founder context.",
  },
  {
    title: "50",
    subtitle: "Applications in reach",
    detail: "screened for thesis and timing before you spend time drafting.",
  },
  {
    title: "4",
    subtitle: "Deadlines to watch",
    detail: "surfaced with priority ranking so the right rooms move first.",
  },
  {
    title: "1",
    subtitle: "Place to manage it",
    detail: "instead of scattered sheets, docs, and browser tabs.",
  },
] as const;

export const proofWhyItems = [
  "It takes your uploaded decks and notes and turns them into a reusable startup application base.",
  "It finds every program you actually fit instead of making you search directories.",
  "Each application letter drafts from your real context instead of a blank page.",
] as const;

export const matchedPrograms = [
  {
    id: "yc",
    name: "Y Combinator",
    slug: "y-combinator",
    fitLabel: "Strong match",
    fitScore: 91,
    deadline: "Oct 2026",
    why: "Clear founder-market fit and a wedge that explains itself quickly. Strong enough traction to move fast in a partner room where speed and conviction are the real currency.",
    type: "Accelerator",
    checkSize: "$500K",
  },
  {
    id: "antler",
    name: "Antler",
    mark: "antler" as const,
    fitLabel: "Strong match",
    fitScore: 85,
    deadline: "Rolling",
    why: "Strong for a founder with early conviction and a service-informed traction story that lands before the application even gets long.",
    type: "Accelerator",
    checkSize: "$250K",
  },
  {
    id: "google",
    name: "Google for Startups",
    slug: "google-for-startups-accelerator",
    fitLabel: "Good match",
    fitScore: 78,
    deadline: "Dec 2026",
    why: "Worth your time for cloud support, operator help, and AI landing leverage. The story already lands without heavy adaptation.",
    type: "Program",
    checkSize: "Credits",
  },
  {
    id: "techstars",
    name: "Techstars",
    slug: "techstars",
    fitLabel: "Good match",
    fitScore: 72,
    deadline: "Nov 2026",
    why: "Strong if you want structure, sharper storytelling, founder support, and sharper application narrative work.",
    type: "Accelerator",
    checkSize: "$120K",
  },
] as const;
