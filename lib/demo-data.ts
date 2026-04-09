export type MatchLabel = "Strong Match" | "Good Match" | "Possible Match";
export type ProgramStatus =
  | "Drafting"
  | "Ready"
  | "Submitted"
  | "Interview Scheduled"
  | "Accepted"
  | "Rejected";

export type Opportunity = {
  slug: string;
  name: string;
  shortName: string;
  domain: string;
  type: string;
  category: string;
  location: string;
  deadline: string;
  description: string;
  fitScore: number;
  fitLabel: MatchLabel;
  why: string;
  overview: string;
  requirements: string[];
  gaps: string[];
  signals: string[];
  status: ProgramStatus;
  intelligence: string | null;
  lastUpdated: string;
  lastEdited: string;
  questionCount: number;
  questionsCompleted: number;
  tracked: boolean;
};

export type StartupProfile = {
  companyName: string;
  tagline: string;
  stage: string;
  sector: string;
  location: string;
  teamSize: string;
  traction: string;
  problem: string;
  solution: string;
  businessModel: string;
  competitiveEdge: string;
  fundraisingAsk: string;
  useOfFunds: string;
  uploadedAssets: string[];
  missingInfo: string[];
};

export type FounderProfile = {
  name: string;
  role: string;
  location: string;
  linkedIn: string;
  background: string;
  domainExpertise: string;
  previousStartupInfo: string;
  skills: string[];
  credibility: string;
  missingInfo: string[];
};

export type ApplicationQuestion = {
  id: string;
  question: string;
  answer: string;
  variants: string[];
  ready: boolean;
  lastSaved: string;
  sourceSnippets: string[];
};

export type ApplicationSession = {
  programSlug: string;
  questions: ApplicationQuestion[];
  lastOpenedAt: string;
};

export type GmailEmail = {
  id: string;
  subject: string;
  from: string;
  preview: string;
  programSlug: string;
  suggestedStatus: ProgramStatus;
  receivedAt: string;
};

export const defaultStartupProfile: StartupProfile = {
  companyName: "Totem Interactive",
  tagline: "Software development company building products across AI, apps, platforms.",
  stage: "Seed",
  sector: "AI & Digital Solutions",
  location: "Mumbai, India",
  teamSize: "12",
  traction: "Building products across AI, SaaS, and digital ecosystem. Makers of Velocity.",
  problem:
    "Product development and AI integration are highly fragmented, leading to slow execution for founders and enterprises.",
  solution:
    "Totem Interactive builds rapid digital solutions and AI workflows to accelerate product scaling and business execution.",
  businessModel: "B2B SaaS / Services.",
  competitiveEdge:
    "We have deep execution experience blending AI with traditional software pipelines.",
  fundraisingAsk: "$1M seed",
  useOfFunds: "Product Expansion (60%), Go-To-Market (40%)",
  uploadedAssets: ["totem_interactive_deck.pdf", "velocity_memo.docx"],
  missingInfo: ["Prior funding history", "Cofounder details"],
};

export const defaultFounderProfile: FounderProfile = {
  name: "Aakash Puri",
  role: "CEO & Founder",
  location: "Mumbai, India",
  linkedIn: "https://www.linkedin.com/in/aakash-puri-a44aa594/",
  background:
    "I have extensive experience running technical teams and building software products across multiple domains including AI and platforms.",
  domainExpertise:
    "Software Development, AI Workflows, Product Strategy, and Operations.",
  previousStartupInfo:
    "Makers of Velocity, an AI prompt-improvement product.",
  skills: [
    "Product Management",
    "Digital Strategy",
    "Enterprise Solutions",
    "AI Integration",
    "Team Leadership",
  ],
  credibility:
    "Founded Totem Interactive in 2022 and shipped multiple complex digital products.",
  missingInfo: ["Co-founder details"],
};

export const defaultOpportunities: Opportunity[] = [
  {
    slug: "yc-w26",
    shortName: "YC",
    name: "YC W26",
    domain: "ycombinator.com",
    type: "Accelerator",
    category: "Batch",
    location: "San Francisco / Remote",
    deadline: "May 12, 2026",
    description: "The most competitive startup accelerator for founders with sharp conviction and early momentum.",
    fitScore: 91,
    fitLabel: "Strong Match",
    why: "The wedge is sharp, the founder-market fit is obvious, and the traction is strong enough to feel believable fast.",
    overview:
      "YC rewards clarity, urgency, and founders who can compress a hard problem into an inevitable first product wedge.",
    requirements: [
      "Clear problem urgency",
      "Strong founder insight",
      "Large market with expansion path",
      "Convincing speed of execution",
    ],
    gaps: [
      "Clarify defensibility beyond AI automation",
      "Tighten the solo-founder execution story",
      "Add website and incorporation details",
    ],
    signals: [
      "Strong founder-market fit from lived agency pain",
      "Recurring SaaS model with fast ROI story",
      "Traction is early but concrete",
    ],
    status: "Submitted",
    intelligence: "Application received",
    lastUpdated: "2026-04-05T13:08:00.000Z",
    lastEdited: "2026-04-05T11:20:00.000Z",
    questionCount: 18,
    questionsCompleted: 3,
    tracked: true,
  },
  {
    slug: "antler-india",
    shortName: "A",
    name: "Antler India",
    domain: "antler.co",
    type: "Accelerator",
    category: "Pre-seed",
    location: "Bengaluru",
    deadline: "Rolling",
    description: "Early-stage conviction program backing founders before the company is fully formed.",
    fitScore: 85,
    fitLabel: "Strong Match",
    why: "The founder profile, pre-seed timing, and local market context all fit Antler's early-conviction pattern.",
    overview:
      "Antler works best when founder quality is obvious and the startup has a tight wedge into a large market.",
    requirements: [
      "Ambitious founder profile",
      "Large market insight",
      "Sharp early wedge",
      "Credible ability to recruit and execute",
    ],
    gaps: ["Explain the first technical hiring plan", "Show how pilots convert into repeatable SaaS revenue"],
    signals: [
      "Local founder with direct customer access",
      "Painful workflow problem with measurable ROI",
      "Pre-seed stage fits the program well",
    ],
    status: "Interview Scheduled",
    intelligence: "Interview invite received",
    lastUpdated: "2026-04-05T12:34:00.000Z",
    lastEdited: "2026-04-04T18:10:00.000Z",
    questionCount: 12,
    questionsCompleted: 0,
    tracked: true,
  },
  {
    slug: "google-for-startups",
    shortName: "G",
    name: "Google for Startups",
    domain: "startup.google.com",
    type: "Program",
    category: "Credits + Mentorship",
    location: "India",
    deadline: "June 3, 2026",
    description: "Operator support, product guidance, and cloud advantages for promising early startups.",
    fitScore: 78,
    fitLabel: "Good Match",
    why: "A credible AI workflow product with infrastructure needs and a strong case for operator-focused product mentorship.",
    overview:
      "Google for Startups is strongest for technical products with real build requirements and a believable growth path.",
    requirements: ["Technical ambition", "Clear product direction", "A compelling early growth story"],
    gaps: ["Make the AI workflow and product architecture more explicit"],
    signals: ["AI-native product", "Operational SaaS model", "Early user demand"],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-04T15:20:00.000Z",
    lastEdited: "2026-04-03T12:10:00.000Z",
    questionCount: 18,
    questionsCompleted: 0,
    tracked: true,
  },
  {
    slug: "techstars-mumbai",
    shortName: "T",
    name: "Techstars Mumbai",
    domain: "techstars.com",
    type: "Accelerator",
    category: "Mentor-led",
    location: "Mumbai",
    deadline: "July 18, 2026",
    description: "Mentor-heavy accelerator for startups that benefit from sharp feedback and founder storytelling.",
    fitScore: 72,
    fitLabel: "Good Match",
    why: "Good local fit and useful mentor density while the narrative and distribution model sharpen.",
    overview:
      "Techstars Mumbai is strongest when the team benefits from mentor leverage and founder storytelling discipline.",
    requirements: ["Coachability", "Founder momentum", "A path to repeatable distribution"],
    gaps: ["Clarify first repeatable acquisition channel"],
    signals: ["Mumbai base", "Founder-led GTM is plausible"],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-04T14:10:00.000Z",
    lastEdited: "2026-04-03T16:00:00.000Z",
    questionCount: 18,
    questionsCompleted: 0,
    tracked: true,
  },
  {
    slug: "nasscom-10k",
    shortName: "N",
    name: "NASSCOM 10K",
    domain: "nasscom.in",
    type: "Program",
    category: "Ecosystem",
    location: "India",
    deadline: "Rolling",
    description: "Indian startup ecosystem support with founder programming, visibility, and network access.",
    fitScore: 68,
    fitLabel: "Good Match",
    why: "A solid ecosystem program for an India-based SaaS company building a painful workflow tool for agencies.",
    overview:
      "NASSCOM 10K helps with ecosystem credibility, access, and support for Indian software startups.",
    requirements: ["Indian startup profile", "Product clarity", "Commitment to scale"],
    gaps: ["Formalize company registration details"],
    signals: ["India HQ", "Software product", "Enterprise workflow category"],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-03T11:30:00.000Z",
    lastEdited: "2026-04-02T14:00:00.000Z",
    questionCount: 18,
    questionsCompleted: 0,
    tracked: true,
  },
  {
    slug: "500-global",
    shortName: "5",
    name: "500 Global",
    domain: "500.co",
    type: "Accelerator",
    category: "Global",
    location: "Remote",
    deadline: "August 1, 2026",
    description: "Global accelerator platform for startups with repeatable growth potential and investor readiness.",
    fitScore: 65,
    fitLabel: "Good Match",
    why: "The story works if it expands from agencies into a larger revenue-protection workflow category.",
    overview:
      "500 Global becomes stronger once the market narrative broadens and fundraising readiness improves.",
    requirements: ["Scalable market narrative", "Early proof points", "Fundraising readiness"],
    gaps: ["Broaden market sizing beyond agency operations"],
    signals: ["Recurring SaaS model", "Cross-border software potential"],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-03T09:48:00.000Z",
    lastEdited: "2026-04-02T11:40:00.000Z",
    questionCount: 18,
    questionsCompleted: 0,
    tracked: true,
  },
  {
    slug: "surge",
    shortName: "S",
    name: "Surge by Sequoia",
    domain: "surgeahead.com",
    type: "Accelerator",
    category: "India + SEA",
    location: "Bengaluru / Remote",
    deadline: "September 10, 2026",
    description: "Sequoia-backed founder support for breakout startups across India and Southeast Asia.",
    fitScore: 60,
    fitLabel: "Possible Match",
    why: "Interesting upside, but the current story is still sharper for YC and Antler than for a broader venture-scale pitch.",
    overview:
      "Surge is compelling when the category ambition and venture-scale story are both already very crisp.",
    requirements: ["High-growth potential", "Venture-scale framing", "Founder ambition"],
    gaps: ["Needs a broader category story and sharper venture framing"],
    signals: ["India founder", "Clear pain point", "Good operator credibility"],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-02T17:40:00.000Z",
    lastEdited: "2026-04-01T17:20:00.000Z",
    questionCount: 18,
    questionsCompleted: 0,
    tracked: true,
  },
  {
    slug: "aws-activate",
    shortName: "A",
    name: "AWS Activate",
    domain: "aws.amazon.com",
    type: "Credits",
    category: "Infrastructure",
    location: "Global",
    deadline: "Rolling",
    description: "Non-dilutive cloud credits and startup tooling support for technical teams building fast.",
    fitScore: 55,
    fitLabel: "Possible Match",
    why: "Useful support for cloud spend and a clean non-dilutive win, even if it is not the hero part of the story.",
    overview:
      "AWS Activate is a practical support program for startups with a credible cloud-heavy product roadmap.",
    requirements: ["Company details", "Product use case", "Cloud need"],
    gaps: ["Add incorporation details to complete the application"],
    signals: ["AI workload", "Infra credits are useful immediately"],
    status: "Ready",
    intelligence: "Draft complete",
    lastUpdated: "2026-04-04T08:54:00.000Z",
    lastEdited: "2026-04-05T07:50:00.000Z",
    questionCount: 18,
    questionsCompleted: 18,
    tracked: true,
  },
  {
    slug: "anthropic-startup-credits",
    shortName: "An",
    name: "Anthropic Startup Credits",
    domain: "anthropic.com",
    type: "Credits",
    category: "AI Infrastructure",
    location: "Global",
    deadline: "Rolling",
    description: "Free Claude API credits up to $10K for early-stage AI startups shipping real product.",
    fitScore: 52,
    fitLabel: "Possible Match",
    why: "Useful API support for an AI workflow company, though it is more of a practical win than a flagship signal.",
    overview: "Anthropic credits help early AI startups lower model costs while they validate usage and product shape.",
    requirements: ["Working AI product", "Clear use of model credits", "Early-stage company profile"],
    gaps: ["Show how Flowstate uses LLMs in the product loop without sounding generic"],
    signals: [
      "Flowstate is AI-native and benefits from usage credits",
      "Credits reduce infrastructure pressure during pilots",
      "The product narrative is stronger than the infra narrative",
    ],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-02T10:30:00.000Z",
    lastEdited: "2026-04-01T12:10:00.000Z",
    questionCount: 0,
    questionsCompleted: 0,
    tracked: false,
  },
  {
    slug: "microsoft-for-startups",
    shortName: "M",
    name: "Microsoft for Startups",
    domain: "microsoft.com",
    type: "Credits",
    category: "Platform",
    location: "Global",
    deadline: "Rolling",
    description: "Azure credits up to $150K plus GitHub and LinkedIn access for startup teams.",
    fitScore: 50,
    fitLabel: "Possible Match",
    why: "Helpful non-dilutive support if Flowstate broadens its technical stack and wants platform perks beyond cloud spend.",
    overview: "Microsoft for Startups is strongest for technical teams who can benefit from Azure, GitHub, and partner access.",
    requirements: ["Startup profile", "Technical product", "Credible use of platform benefits"],
    gaps: ["Make the infrastructure plan more specific"],
    signals: [
      "The company can use cloud and tooling credits immediately",
      "Platform support is valuable at pre-seed stage",
      "Program fit is practical rather than narrative-defining",
    ],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-01T15:00:00.000Z",
    lastEdited: "2026-03-31T10:40:00.000Z",
    questionCount: 0,
    questionsCompleted: 0,
    tracked: false,
  },
  {
    slug: "sequoia-arc",
    shortName: "SA",
    name: "Sequoia Arc",
    domain: "sequoiacap.com",
    type: "Fellowship",
    category: "Founder Support",
    location: "Global",
    deadline: "Rolling",
    description: "Sequoia's early-stage scout and support program for pre-seed founders.",
    fitScore: 48,
    fitLabel: "Possible Match",
    why: "Interesting if the story sharpens into a broader category-defining wedge, but it is not yet the strongest room today.",
    overview: "Arc favors ambitious pre-seed founders with sharp category thinking and room to compound quickly.",
    requirements: ["Ambitious category thesis", "Founder conviction", "Pre-seed readiness"],
    gaps: ["Make the long-term category ambition more expansive"],
    signals: [
      "Founder insight is real and hard-won",
      "The current wedge is strong but still niche",
      "Needs a bigger market framing to stand out here",
    ],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-03-31T16:45:00.000Z",
    lastEdited: "2026-03-30T14:20:00.000Z",
    questionCount: 0,
    questionsCompleted: 0,
    tracked: false,
  },
  {
    slug: "entrepreneur-first-india",
    shortName: "EF",
    name: "Entrepreneur First India",
    domain: "joinef.com",
    type: "Accelerator",
    category: "Pre-team",
    location: "Bengaluru",
    deadline: "Rolling",
    description: "Pre-team pre-idea program that funds founders while they find a cofounder.",
    fitScore: 45,
    fitLabel: "Possible Match",
    why: "Less aligned because Flowstate already has a concrete company and product wedge, but still relevant around solo-founder support.",
    overview: "Entrepreneur First is best for exceptional individuals before the startup is fully formed.",
    requirements: ["Exceptional founder profile", "Early-stage openness", "Cofounder search context"],
    gaps: ["The company is already more formed than the ideal EF stage"],
    signals: [
      "Solo-founder story is relevant here",
      "Program stage is earlier than Flowstate's current position",
      "Useful only if the cofounder gap becomes a priority",
    ],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-03-30T10:20:00.000Z",
    lastEdited: "2026-03-29T11:10:00.000Z",
    questionCount: 0,
    questionsCompleted: 0,
    tracked: false,
  },
];

const ycQuestionTemplate: ApplicationQuestion[] = [
  {
    id: "q1",
    question: "What does your company do in one sentence?",
    answer: "Totem Interactive builds AI products, platforms, and digital solutions for enterprises.",
    variants: [
      "We accelerate business execution by building intelligent software and AI workflows.",
      "Thinkalocity.ai acts as an AI workflow layer for smarter founder and business execution.",
    ],
    ready: false,
    lastSaved: "2026-04-05T12:12:00.000Z",
    sourceSnippets: [
      "totem_deck.pdf, slide 3: 'Building products across AI, platforms, and digital.'",
    ],
  },
  {
    id: "q2",
    question: "What is your company going to make?",
    answer:
      "We build products across AI, apps, platforms, games, AR/VR, and digital solutions. Our core focus is launching products like Velocity, an AI prompt-improvement tool, and Thinkalocity, an AI workflow layer.",
    variants: [
      "We are building an AI workflow ecosystem that helps founders and businesses execute smarter through tools like Thinkalocity and Velocity.",
    ],
    ready: true,
    lastSaved: "2026-04-05T12:16:00.000Z",
    sourceSnippets: [
      "startup_memo.docx: 'Makers of Velocity, an AI prompt-improvement product.'",
    ],
  },
  {
    id: "q3",
    question: "Who are your competitors and what do you understand that they do not?",
    answer:
      "Most development agencies lack deep, proprietary product layers (like Thinkalocity). We don't just build software; we build AI-native execution workflows.",
    variants: [
      "Traditional agencies are purely service-oriented. We exist at the intersection of product incubation and service execution.",
    ],
    ready: false,
    lastSaved: "2026-04-05T12:21:00.000Z",
    sourceSnippets: [
      "Founder notes: 'We ship actual AI products instead of just selling hours.'",
    ],
  },
  {
    id: "q4",
    question: "Why are you the right person to build this?",
    answer:
      "I have been successfully operating Totem Interactive since 2022, securing strong talent in Mumbai, and shipping distinct AI products.",
    variants: [
      "With a strong background in software development and launching products like Velocity, I have the execution speed to build and scale Thinkalocity.",
    ],
    ready: false,
    lastSaved: "2026-04-05T12:24:00.000Z",
    sourceSnippets: [
      "Founder Profile: 'Successfully shipped AI workflow products.'",
    ],
  },
  {
    id: "q5",
    question: "How do you make money?",
    answer:
      "We generate revenue through high-end digital solutions, combined with potential SaaS subscriptions for our proprietary AI products.",
    variants: [
      "A blended model of recurring SaaS revenue from tools like Thinkalocity, backed by robust enterprise execution contracts.",
    ],
    ready: false,
    lastSaved: "2026-04-05T12:27:00.000Z",
    sourceSnippets: [
      "startup_memo.docx: 'Blended B2B service and SaaS.'",
    ],
  },
];

export function createApplicationQuestions(): ApplicationQuestion[] {
  return ycQuestionTemplate.map((question) => ({
    ...question,
    variants: [...question.variants],
    sourceSnippets: [...question.sourceSnippets],
  }));
}

export const ycQuestions: ApplicationQuestion[] = createApplicationQuestions();

export const gmailEmails: GmailEmail[] = [
  {
    id: "yc-received",
    subject: "Y Combinator application received",
    from: "apply@ycombinator.com",
    preview: "We've received your W26 application and will review it shortly.",
    programSlug: "yc-w26",
    suggestedStatus: "Submitted",
    receivedAt: "2026-04-05T13:08:00.000Z",
  },
  {
    id: "antler-invite",
    subject: "Antler India interview invite",
    from: "india@antler.co",
    preview: "We'd love to schedule a partner interview next week.",
    programSlug: "antler-india",
    suggestedStatus: "Interview Scheduled",
    receivedAt: "2026-04-05T12:34:00.000Z",
  },
];
