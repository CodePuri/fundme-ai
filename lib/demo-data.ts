export type MatchLabel = "Strong Match" | "Good Match" | "Possible Match";
export type ProgramStatus =
  | "Drafting"
  | "Ready"
  | "Submitted"
  | "Interview"
  | "Accepted"
  | "Rejected";

export type Opportunity = {
  slug: string;
  name: string;
  type: string;
  category: string;
  deadline: string;
  fitScore: number;
  fitLabel: MatchLabel;
  why: string;
  overview: string;
  requirements: string[];
  gaps: string[];
  signals: string[];
  status: ProgramStatus;
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
  tagline: "Contract intelligence that catches scope creep before agencies lose margin.",
  stage: "Pre-seed",
  sector: "Vertical SaaS / Legal Ops for Agencies",
  location: "Mumbai, India",
  teamSize: "4",
  traction: "87 qualified signups, 3 pilot conversations live, 2 agency operators advising product roadmap.",
  problem:
    "Digital agencies consistently lose revenue because project teams agree to off-scope work in calls, Slack threads, and email without documenting the commercial impact.",
  solution:
    "Flowstate AI monitors client communication, flags probable scope drift in real time, and auto-generates change-order language that account managers can send before margin disappears.",
  businessModel: "Annual SaaS subscriptions priced by retained revenue under management.",
  competitiveEdge:
    "The product is trained on agency workflow language, blends detection with immediately usable documentation, and fits into agency delivery rhythms without requiring legal teams.",
  fundraisingAsk: "$750k pre-seed round to finish productization, deepen integrations, and convert pilots into paid design partners.",
  useOfFunds:
    "55% engineering, 25% product and implementation, 20% founder-led GTM with agency-specific distribution partnerships.",
  uploadedAssets: [
    "Flowstate_Seed_Deck_v5.pdf",
    "customer-problem-notes.txt",
    "agency-pilot-memo.docx",
    "yc-application-2025.md",
  ],
  missingInfo: [
    "Website URL",
    "Incorporation details",
    "Prior funding history",
    "Cofounder or technical lead details",
  ],
};

export const defaultFounderProfile: FounderProfile = {
  name: "Arjun Mehta",
  role: "Founder and CEO",
  location: "Mumbai, India",
  linkedIn: "linkedin.com/in/arjunmehta",
  background:
    "Arjun spent five years running a digital agency where he repeatedly watched profitable projects turn into flat-fee delivery chaos because scope creep was discovered too late.",
  domainExpertise:
    "Agency operations, client delivery systems, proposal design, change-order workflows, and AI-assisted documentation.",
  previousStartupInfo:
    "Built and operated a services business to multi-lakh annual revenue; this is Arjun's first venture-backed startup.",
  skills: [
    "Founder-led sales",
    "Agency workflow design",
    "Operational analytics",
    "Customer discovery",
    "Prompt and knowledge-system design",
  ],
  credibility:
    "The founder has lived the pain firsthand, already has warm access to early design partners, and can clearly articulate the cost of untracked scope creep in agency economics.",
  missingInfo: ["Technical lead profile", "Prior exits or angel track record"],
};

export const defaultOpportunities: Opportunity[] = [
  {
    slug: "yc-w26",
    name: "Y Combinator W26",
    type: "Accelerator",
    category: "Global",
    deadline: "May 12",
    fitScore: 96,
    fitLabel: "Strong Match",
    why: "Clear wedge, strong founder-market fit, and early pull from a painful workflow problem.",
    overview:
      "YC is best for companies with sharp problem definition, speed of iteration, and founders who can sell insight before the product is fully built.",
    requirements: [
      "Compelling founder story",
      "Large market with expansion path",
      "Velocity and user insight",
      "Clear reason this team wins",
    ],
    gaps: [
      "Tighten technical execution story",
      "Clarify product defensibility beyond workflow automation",
      "Add formal website and incorporation details",
    ],
    signals: [
      "Founder has firsthand pain and language",
      "Problem is urgent and quantifiable",
      "Application can lean on pilot conversations and distribution insight",
    ],
    status: "Drafting",
  },
  {
    slug: "antler-india",
    name: "Antler India",
    type: "Accelerator",
    category: "India",
    deadline: "Rolling",
    fitScore: 91,
    fitLabel: "Strong Match",
    why: "Strong pre-seed thesis with a founder who knows the buyer and can iterate fast in-market.",
    overview: "Antler backs founders early and values velocity, ambition, and a sharp understanding of the problem space.",
    requirements: ["Founder quality", "Market insight", "Ability to recruit", "Early product narrative"],
    gaps: ["Show technical build path", "Add hiring plan for first engineering lead"],
    signals: ["India footprint", "B2B workflow pain point", "Pre-seed timing fits program"],
    status: "Drafting",
  },
  {
    slug: "google-startups-india",
    name: "Google for Startups India",
    type: "Program",
    category: "Cloud + Mentorship",
    deadline: "Jun 3",
    fitScore: 87,
    fitLabel: "Strong Match",
    why: "AI-enabled B2B workflow product with a credible use case and immediate product-development upside.",
    overview: "Google for Startups supports technical founders with cloud credits, mentoring, and ecosystem access.",
    requirements: ["Product innovation", "Scale potential", "Team readiness"],
    gaps: ["More product screenshots", "More explicit AI stack explanation"],
    signals: ["AI-native product", "India focus", "Early GTM clarity"],
    status: "Drafting",
  },
  {
    slug: "techstars-mumbai",
    name: "Techstars Mumbai",
    type: "Accelerator",
    category: "India",
    deadline: "Jul 18",
    fitScore: 83,
    fitLabel: "Good Match",
    why: "B2B SaaS with founder hustle and early market clarity aligns with mentor-led acceleration.",
    overview: "Techstars focuses on mentor density and founder readiness to compress learning cycles.",
    requirements: ["Strong founding team", "Coachability", "Market potential"],
    gaps: ["Need clearer GTM math", "Add roadmap for enterprise integration"],
    signals: ["Founder-led sales", "Urgent workflow problem"],
    status: "Drafting",
  },
  {
    slug: "nasscom-10000",
    name: "NASSCOM 10,000 Startups",
    type: "Incubator",
    category: "India",
    deadline: "Rolling",
    fitScore: 79,
    fitLabel: "Good Match",
    why: "India-based SaaS startup with early traction and ecosystem fit.",
    overview: "NASSCOM helps Indian startups with market access, founder support, and ecosystem credibility.",
    requirements: ["Indian startup profile", "Innovation angle", "Team commitment"],
    gaps: ["Formal company registration data"],
    signals: ["India HQ", "Enterprise workflow use case"],
    status: "Drafting",
  },
  {
    slug: "500-global",
    name: "500 Global",
    type: "Accelerator",
    category: "Global",
    deadline: "Aug 1",
    fitScore: 76,
    fitLabel: "Good Match",
    why: "Operational SaaS with cross-border scale path and clear revenue story.",
    overview: "500 Global looks for scalable businesses with credible growth paths and founder ambition.",
    requirements: ["Scalability", "Strong market narrative", "Fundraising readiness"],
    gaps: ["Broaden market sizing", "Add longer-term product expansion vision"],
    signals: ["Recurring revenue model", "Large service economy problem"],
    status: "Drafting",
  },
  {
    slug: "on-deck-founders",
    name: "On Deck Founders Fellowship",
    type: "Fellowship",
    category: "Network",
    deadline: "Rolling",
    fitScore: 71,
    fitLabel: "Possible Match",
    why: "Useful for network density, founder support, and feedback loops while refining the story.",
    overview: "A founder community and support environment for early operators building ambitious startups.",
    requirements: ["Founder ambition", "Clarity of idea", "Community participation"],
    gaps: ["Less urgent than direct accelerator paths"],
    signals: ["Strong founder narrative", "Pre-seed exploration phase"],
    status: "Drafting",
  },
  {
    slug: "aws-activate",
    name: "AWS Activate",
    type: "Credits",
    category: "Infrastructure",
    deadline: "Rolling",
    fitScore: 64,
    fitLabel: "Possible Match",
    why: "Helpful non-dilutive support for an AI-heavy workflow product, though not core to the narrative.",
    overview: "AWS Activate provides infrastructure credits and founder support for eligible startups.",
    requirements: ["Basic company details", "Build plan", "Cloud use case"],
    gaps: ["Formal incorporation details"],
    signals: ["AI product likely to consume infrastructure"],
    status: "Drafting",
  },
];

export const ycQuestions: ApplicationQuestion[] = [
  {
    id: "what-are-you-building",
    question: "What are you building, and what problem are you solving?",
    answer:
      "We are building Flowstate AI, a contract intelligence layer for digital agencies. Agencies regularly lose margin because account managers agree to off-scope work in meetings, email, and Slack without realizing the revenue impact until the project is already underwater. Flowstate detects probable scope creep in real time and automatically drafts the change-order documentation required to recover that revenue before it disappears.",
    variants: [
      "Flowstate AI helps digital agencies catch scope creep before it kills project margin. We monitor client communication, flag off-scope requests as they happen, and generate the change-order language teams need to convert hidden delivery work into approved revenue.",
      "We are building an AI-powered scope control system for agencies. Instead of discovering margin leakage at the end of a project, teams get live alerts, commercial context, and draft change orders the moment client requests start drifting beyond the original agreement.",
    ],
    ready: false,
    lastSaved: "2026-04-04T16:10:00.000Z",
    sourceSnippets: [
      "Pitch deck: 'scope creep is the silent margin killer for agencies'",
      "Founder notes: 'documentation delay is what makes recovery impossible'",
    ],
  },
  {
    id: "why-now",
    question: "Why is this the right time for your company to exist?",
    answer:
      "Agencies now run more of their delivery process through fragmented digital channels, which means scope drift is more frequent and less visible than it was in email-only workflows. At the same time, LLMs have become good enough to understand ambiguous client requests, map them to contractual commitments, and draft commercially precise documentation. That combination makes real-time scope intelligence possible for the first time.",
    variants: [
      "The timing works because agency delivery has become messy enough to create the problem and language models have become reliable enough to solve it. Teams finally have enough communication exhaust to detect scope drift and enough AI capability to turn that signal into action.",
      "Scope creep has always existed, but the modern agency stack makes it easier to miss and more expensive to ignore. We can now ingest messy communication across channels, reason over contractual expectations, and create a draft response instantly instead of after the work is already done.",
    ],
    ready: true,
    lastSaved: "2026-04-04T16:12:00.000Z",
    sourceSnippets: [
      "Startup memo: communication moved from PM tools to Slack and calls",
      "Deck: 'AI can now reason over nuance, not just keywords'",
    ],
  },
  {
    id: "founder-fit",
    question: "Why are you the right person to build this?",
    answer:
      "I spent five years running a digital agency and repeatedly watched profitable projects become painful because teams were too slow to recognize and document scope drift. I know how agencies sell, deliver, and argue about margin because I lived those workflows directly. That gives me unusually fast access to real buyer language, design partners, and a product instinct shaped by firsthand pain rather than abstract market research.",
    variants: [
      "I built this because I ran into the problem as an operator, not an observer. After years of trying to protect agency margin with process alone, I know exactly where workflows break and what kind of output teams will actually use in a client conversation.",
      "My founder advantage is painful intimacy with the workflow. I’ve been the person negotiating project expansion without the documentation needed to charge for it, so the product is grounded in operational reality rather than generic AI tooling.",
    ],
    ready: false,
    lastSaved: "2026-04-04T16:14:00.000Z",
    sourceSnippets: [
      "Founder notes: 'scope creep killed our best projects more than sales ever did'",
      "LinkedIn summary: ran digital agency for five years",
    ],
  },
];

export const gmailEmails: GmailEmail[] = [
  {
    id: "yc-received",
    subject: "Y Combinator application received",
    from: "apply@ycombinator.com",
    preview: "We've received your W26 application and will review it shortly.",
    programSlug: "yc-w26",
    suggestedStatus: "Submitted",
    receivedAt: "2026-04-04T16:25:00.000Z",
  },
  {
    id: "antler-invite",
    subject: "Antler India interview invite",
    from: "india@antler.co",
    preview: "We'd love to schedule a partner interview next week.",
    programSlug: "antler-india",
    suggestedStatus: "Interview",
    receivedAt: "2026-04-04T16:40:00.000Z",
  },
];
