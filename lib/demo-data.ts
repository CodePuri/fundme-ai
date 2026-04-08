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
  companyName: "Flowstate AI",
  tagline: "Real-time contract intelligence for agencies.",
  stage: "Pre-seed",
  sector: "B2B SaaS / LegalTech",
  location: "Mumbai, India",
  teamSize: "2",
  traction: "87 signups, 3 pilots, and $2,400/month in recovered revenue in early accounts.",
  problem:
    "Agencies lose revenue from untracked scope creep because client requests shift in calls, email, and chat long before contracts are updated.",
  solution:
    "Flowstate AI detects scope creep in real time, quantifies commercial impact, and auto-generates change orders before free work ships.",
  businessModel: "SaaS at $299/month per agency.",
  competitiveEdge:
    "We sit at the moment scope expands, between the conversation and the contract, instead of helping teams react after the damage is done.",
  fundraisingAsk: "$500K pre-seed",
  useOfFunds: "Product (60%), Sales (25%), Ops (15%)",
  uploadedAssets: ["Flowstate_deck.pdf", "startup_memo.docx"],
  missingInfo: ["Website URL", "Incorporation details", "Prior funding history", "Cofounder details"],
};

export const defaultFounderProfile: FounderProfile = {
  name: "Arjun Mehta",
  role: "Founder & CEO",
  location: "Mumbai, India",
  linkedIn: "linkedin.com/in/arjunmehta",
  background:
    "I ran a 12-person agency for 5 years and repeatedly watched profitable projects lose margin because scope changes were agreed to informally and documented too late.",
  domainExpertise:
    "Agency operations, contractual drift, change-order recovery, and selling workflow software to service businesses.",
  previousStartupInfo:
    "Built and operated an agency before Flowstate AI. This is my first venture-backed software company.",
  skills: [
    "Product Management",
    "Go-to-market",
    "Enterprise Sales",
    "UX Thinking",
    "Agency Ops",
  ],
  credibility:
    "I lived the exact problem for years, lost real money to it, and already have design partners validating the urgency of the workflow.",
  missingInfo: ["LinkedIn verification", "Co-founder details"],
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
    answer: "AI detects scope creep, drafts change orders.",
    variants: [
      "AI catches scope creep and auto-drafts change orders.",
      "We detect scope drift and create change-order paperwork instantly.",
    ],
    ready: false,
    lastSaved: "2026-04-05T12:12:00.000Z",
    sourceSnippets: [
      "Flowstate_deck.pdf, slide 3: 'Detect scope creep in real time.'",
      "startup_memo.docx: 'Draft change orders in under 60 seconds.'",
    ],
  },
  {
    id: "q2",
    question: "What is your company going to make?",
    answer:
      "Flowstate AI monitors client conversations in real time. When a request exceeds original scope, Flowstate flags it, quantifies impact, and generates a change order in under 60 seconds. Built for agencies losing $3,200/month to scope creep.",
    variants: [
      "Flowstate AI watches agency-client communication and catches scope changes the moment they appear. It measures revenue impact and drafts the exact change-order paperwork before teams give work away for free.",
      "We are building a real-time detection layer for agency scope drift. When a request expands beyond contract terms, Flowstate flags it and auto-generates the commercial response.",
    ],
    ready: true,
    lastSaved: "2026-04-05T12:16:00.000Z",
    sourceSnippets: [
      "Flowstate_deck.pdf, slide 4: 'Quantify impact and generate a change order in under 60 seconds.'",
      "startup_memo.docx: 'Agencies lose thousands per month to hidden scope changes.'",
    ],
  },
  {
    id: "q3",
    question: "Who are your competitors and what do you understand that they do not?",
    answer:
      "DocuSign and PandaDoc handle signing, not detection. Asana tracks tasks, not contractual drift. The real problem is the moment a client says 'can you just also...' and the agency says yes without knowing the cost. No one owns the detection layer.",
    variants: [
      "Existing tools either manage signatures or track project execution. They do not catch the exact moment scope expands inside messy communication. That unowned detection layer is where margin disappears.",
      "Competitors help document or manage work after the fact. We focus on the missing moment before the revenue is lost: when the client casually expands the ask and nobody updates the contract.",
    ],
    ready: false,
    lastSaved: "2026-04-05T12:21:00.000Z",
    sourceSnippets: [
      "Founder notes: 'The problem isn't signatures. It's the moment nobody flags drift.'",
      "Flowstate_deck.pdf, slide 6: 'No one owns detection before the contract is updated.'",
    ],
  },
  {
    id: "q4",
    question: "Why are you the right person to build this?",
    answer:
      "I ran a 12-person agency for 5 years and lost $180K to scope creep. 87 signups from one LinkedIn post. 3 agencies in active pilots averaging $2,400/month in recovered revenue in the first 30 days.",
    variants: [
      "I built this after losing real agency margin to the exact workflow failure Flowstate now solves. That gives me direct customer language, urgency, and design-partner access.",
      "My founder advantage is painful firsthand experience. I already know where agencies say yes too early, how revenue slips, and what output they will actually use to recover it.",
    ],
    ready: false,
    lastSaved: "2026-04-05T12:24:00.000Z",
    sourceSnippets: [
      "Founder Profile: 'Ran a 12-person agency for 5 years and lost $180K to scope creep.'",
      "LinkedIn notes: '87 signups from one post.'",
    ],
  },
  {
    id: "q5",
    question: "How do you make money?",
    answer:
      "SaaS at $299/month per agency. One recovered scope incident pays for 6 months of Flowstate.",
    variants: [
      "We charge agencies $299 per month. The value proposition is immediate because one recovered scope incident usually covers multiple months of subscription cost.",
      "Flowstate is sold as SaaS at $299 monthly per agency. The ROI is fast enough that the customer can justify the spend off a single saved project expansion.",
    ],
    ready: false,
    lastSaved: "2026-04-05T12:27:00.000Z",
    sourceSnippets: [
      "startup_memo.docx: '$299/month per agency.'",
      "Flowstate_deck.pdf, slide 8: 'One recovered incident pays for months of product.'",
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
