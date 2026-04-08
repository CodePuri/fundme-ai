export type StartupProgramStage =
  | "Idea or Patent"
  | "Prototype"
  | "Early Revenue"
  | "Scaling";

export type StartupProgramFormat = "Remote" | "Hybrid" | "In-person";

export type StartupProgram = {
  id: string;
  name: string;
  slug: string;
  workflow_slug: string;
  program_type: string;
  organization_type: string;
  short_description: string;
  investment_thesis: string;
  website_url: string;
  apply_url: string;
  profile_url: string;
  logo_url: string;
  favicon_url: string;
  applications_open: boolean;
  application_deadline: string | null;
  rolling_applications: boolean;
  program_status: string;
  hq_country: string;
  hq_city: string;
  hq_region: string;
  operating_geographies: string[];
  program_format: StartupProgramFormat;
  relocation_required: boolean;
  target_geographies: string[];
  sector_agnostic: boolean;
  primary_sectors: string[];
  secondary_sectors: string[];
  industry_tags: string[];
  business_model_tags: string[];
  stages_supported: StartupProgramStage[];
  minimum_stage: StartupProgramStage;
  maximum_stage: StartupProgramStage;
  cash_investment_min: number | null;
  cash_investment_max: number | null;
  currency: string;
  equity_min_pct: number | null;
  equity_max_pct: number | null;
  equity_type: string | null;
  equity_free: boolean;
  follow_on_available: boolean;
  grant_amount_min: number | null;
  grant_amount_max: number | null;
  credits_value: number | null;
  perks_summary: string;
  program_duration_weeks: number | null;
  cohort_based: boolean;
  next_cohort_date: string | null;
  demo_day: boolean;
  mentorship_model: string;
  curriculum_focus: string[];
  founder_profile_fit: string;
  notable_alumni: string[];
  portfolio_count: number | null;
  source_url: string;
  ranking_score: number;
  editorial_score: number;
  display_geography_chips: string[];
  display_check_range: string;
  display_stage_chips: StartupProgramStage[];
  display_thesis_snippet: string;
  display_primary_cta: string;
  display_secondary_cta: string;
  display_badges: string[];
};

export type StartupProgramSuggestion = {
  id: string;
  type: "Sectors" | "Program names" | "Tags / themes";
  label: string;
  query: string;
  helperText?: string;
  appliedFilters?: Partial<StartupProgramFilters>;
};

export type StartupProgramFilters = {
  q: string;
  geography: string;
  stage: string;
  checkSize: string;
  sector: string;
  programType: string;
  equityFree: string;
  applicationsOpen: string;
  format: string;
};

type StartupProgramSeed = Pick<
  StartupProgram,
  "name" | "website_url" | "apply_url" | "logo_url" | "source_url"
>;

type StartupProgramMeta = Omit<
  StartupProgram,
  | "id"
  | "name"
  | "slug"
  | "workflow_slug"
  | "website_url"
  | "apply_url"
  | "profile_url"
  | "logo_url"
  | "favicon_url"
  | "source_url"
>;

const DEFAULT_THESIS =
  "Back founders building category-defining companies with strong execution pace and clear market pull.";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getOrigin(url: string) {
  return new URL(url).origin;
}

const WORKFLOW_SLUG_BY_STARTUP_PROGRAM_SLUG: Record<string, string> = {
  "y-combinator": "yc-w26",
  techstars: "techstars-mumbai",
  "500-global": "500-global",
  "google-for-startups-accelerator": "google-for-startups",
  surge: "surge",
  "india-accelerator": "india-accelerator",
  "entrepreneurs-first": "entrepreneur-first-india",
};

function getWorkflowSlug(slug: string) {
  return WORKFLOW_SLUG_BY_STARTUP_PROGRAM_SLUG[slug] ?? slug;
}

function compactCurrency(value: number | null, currency = "USD") {
  if (value == null) return null;

  const symbol = currency === "USD" ? "$" : `${currency} `;

  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${symbol}${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }

  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${symbol}${Number.isInteger(thousands) ? thousands : thousands.toFixed(0)}k`;
  }

  return `${symbol}${value}`;
}

function buildCheckRange(meta: StartupProgramMeta) {
  if (meta.display_check_range) {
    return meta.display_check_range;
  }

  if (meta.equity_free) {
    if (meta.credits_value) {
      return `${compactCurrency(meta.credits_value, meta.currency)} credits`;
    }

    if (meta.grant_amount_min || meta.grant_amount_max) {
      return `${compactCurrency(meta.grant_amount_min, meta.currency) ?? "$0"} to ${
        compactCurrency(meta.grant_amount_max, meta.currency) ?? "grant support"
      }`;
    }

    return "Equity-free";
  }

  const min = compactCurrency(meta.cash_investment_min, meta.currency);
  const max = compactCurrency(meta.cash_investment_max, meta.currency);

  if (min && max) {
    return min === max ? min : `${min} to ${max}`;
  }

  if (max) {
    return `Up to ${max}`;
  }

  return "Varies";
}

function buildBadges(meta: StartupProgramMeta) {
  const badges: string[] = [];

  if (meta.applications_open) badges.push("Open");
  if (meta.equity_free) badges.push("Equity-free");
  if (meta.program_format === "Remote") badges.push("Remote");
  if (meta.program_format === "Hybrid") badges.push("Hybrid");
  if (meta.rolling_applications) badges.push("Rolling");

  return badges.slice(0, 3);
}

const startupProgramSeed: StartupProgramSeed[] = [
  {
    name: "Y Combinator",
    website_url: "https://www.ycombinator.com",
    apply_url: "https://www.ycombinator.com/apply",
    logo_url: "https://logo.clearbit.com/ycombinator.com",
    source_url: "https://www.ycombinator.com",
  },
  {
    name: "Techstars",
    website_url: "https://www.techstars.com",
    apply_url: "https://www.techstars.com/accelerators",
    logo_url: "https://logo.clearbit.com/techstars.com",
    source_url: "https://www.techstars.com",
  },
  {
    name: "500 Global",
    website_url: "https://500.co",
    apply_url: "https://500.co/accelerators",
    logo_url: "https://logo.clearbit.com/500.co",
    source_url: "https://500.co",
  },
  {
    name: "Google for Startups Accelerator",
    website_url: "https://startup.google.com/programs/accelerator/",
    apply_url: "https://startup.google.com/programs/accelerator/",
    logo_url: "https://logo.clearbit.com/startup.google.com",
    source_url: "https://startup.google.com/programs/accelerator/",
  },
  {
    name: "MassChallenge",
    website_url: "https://masschallenge.org",
    apply_url: "https://masschallenge.org/programs-all/",
    logo_url: "https://logo.clearbit.com/masschallenge.org",
    source_url: "https://masschallenge.org/programs-all/",
  },
  {
    name: "SOSV",
    website_url: "https://sosv.com",
    apply_url: "https://sosv.com/for-founders/",
    logo_url: "https://logo.clearbit.com/sosv.com",
    source_url: "https://sosv.com",
  },
  {
    name: "Plug and Play",
    website_url: "https://www.plugandplaytechcenter.com",
    apply_url: "https://www.plugandplaytechcenter.com/startups/",
    logo_url: "https://logo.clearbit.com/plugandplaytechcenter.com",
    source_url: "https://www.plugandplaytechcenter.com",
  },
  {
    name: "Alchemist Accelerator",
    website_url: "https://www.alchemistaccelerator.com",
    apply_url: "https://www.alchemistaccelerator.com/apply",
    logo_url: "https://logo.clearbit.com/alchemistaccelerator.com",
    source_url: "https://www.alchemistaccelerator.com/programs",
  },
  {
    name: "AngelPad",
    website_url: "https://angelpad.com",
    apply_url: "https://angelpad.com",
    logo_url: "https://logo.clearbit.com/angelpad.com",
    source_url: "https://angelpad.com",
  },
  {
    name: "a16z Speedrun",
    website_url: "https://speedrun.a16z.com",
    apply_url: "https://speedrun.a16z.com/apply",
    logo_url: "https://logo.clearbit.com/a16z.com",
    source_url: "https://speedrun.a16z.com",
  },
  {
    name: "Seedcamp",
    website_url: "https://seedcamp.com",
    apply_url: "https://seedcamp.com",
    logo_url: "https://logo.clearbit.com/seedcamp.com",
    source_url: "https://seedcamp.com",
  },
  {
    name: "Entrepreneurs First",
    website_url: "https://www.joinef.com",
    apply_url: "https://apply.joinef.com",
    logo_url: "https://logo.clearbit.com/joinef.com",
    source_url: "https://www.joinef.com",
  },
  {
    name: "Startupbootcamp",
    website_url: "https://startupbootcamp.org",
    apply_url: "https://startupbootcamp.org",
    logo_url: "https://logo.clearbit.com/startupbootcamp.org",
    source_url: "https://startupbootcamp.org",
  },
  {
    name: "Creative Destruction Lab",
    website_url: "https://creativedestructionlab.com",
    apply_url: "https://creativedestructionlab.com/application-triage/",
    logo_url: "https://logo.clearbit.com/creativedestructionlab.com",
    source_url: "https://creativedestructionlab.com",
  },
  {
    name: "Startup Chile",
    website_url: "https://startupchile.org",
    apply_url: "https://startupchile.org/en/apply/",
    logo_url: "https://logo.clearbit.com/startupchile.org",
    source_url: "https://startupchile.org/en/apply/",
  },
  {
    name: "Founders Factory",
    website_url: "https://foundersfactory.com",
    apply_url: "https://foundersfactory.com",
    logo_url: "https://logo.clearbit.com/foundersfactory.com",
    source_url: "https://foundersfactory.com",
  },
  {
    name: "ERA",
    website_url: "https://www.eranyc.com",
    apply_url: "https://www.eranyc.com/apply/",
    logo_url: "https://logo.clearbit.com/eranyc.com",
    source_url: "https://www.eranyc.com/apply/",
  },
  {
    name: "EWOR",
    website_url: "https://www.ewor.com",
    apply_url: "https://www.ewor.com/apply",
    logo_url: "https://logo.clearbit.com/ewor.com",
    source_url: "https://www.ewor.com/apply",
  },
  {
    name: "Wayra",
    website_url: "https://www.wayra.com",
    apply_url: "https://www.wayra.com",
    logo_url: "https://logo.clearbit.com/wayra.com",
    source_url: "https://www.wayra.com",
  },
  {
    name: "Berkeley SkyDeck",
    website_url: "https://skydeck.berkeley.edu",
    apply_url: "https://skydeck.berkeley.edu/apply/",
    logo_url: "https://logo.clearbit.com/berkeley.edu",
    source_url: "https://skydeck.berkeley.edu/apply/",
  },
  {
    name: "StartX",
    website_url: "https://startx.com",
    apply_url: "https://startx.com",
    logo_url: "https://logo.clearbit.com/startx.com",
    source_url: "https://startx.com",
  },
  {
    name: "Forum Ventures",
    website_url: "https://www.forumvc.com",
    apply_url: "https://www.forumvc.com/accelerator",
    logo_url: "https://logo.clearbit.com/forumvc.com",
    source_url: "https://www.forumvc.com/accelerator",
  },
  {
    name: "Village Capital",
    website_url: "https://vilcap.com",
    apply_url: "https://vilcap.com/programs",
    logo_url: "https://logo.clearbit.com/vilcap.com",
    source_url: "https://vilcap.com/programs",
  },
  {
    name: "Capital Factory",
    website_url: "https://capitalfactory.com",
    apply_url: "https://capitalfactory.com/startups/",
    logo_url: "https://logo.clearbit.com/capitalfactory.com",
    source_url: "https://capitalfactory.com/startups/",
  },
  {
    name: "MuckerLab",
    website_url: "https://mucker.com",
    apply_url: "https://mucker.com/accelerator/",
    logo_url: "https://logo.clearbit.com/mucker.com",
    source_url: "https://mucker.com/accelerator/",
  },
  {
    name: "MetaProp",
    website_url: "https://www.metaprop.vc",
    apply_url: "https://www.metaprop.vc",
    logo_url: "https://logo.clearbit.com/metaprop.vc",
    source_url: "https://www.metaprop.vc",
  },
  {
    name: "NFX",
    website_url: "https://www.nfx.com",
    apply_url: "https://signal.nfx.com",
    logo_url: "https://logo.clearbit.com/nfx.com",
    source_url: "https://www.nfx.com",
  },
  {
    name: "Betaworks",
    website_url: "https://betaworks.com",
    apply_url: "https://betaworks.com/camp/",
    logo_url: "https://logo.clearbit.com/betaworks.com",
    source_url: "https://betaworks.com",
  },
  {
    name: "Outlier Ventures",
    website_url: "https://outlierventures.io",
    apply_url: "https://outlierventures.io/base-camp/",
    logo_url: "https://logo.clearbit.com/outlierventures.io",
    source_url: "https://outlierventures.io",
  },
  {
    name: "Rockstart",
    website_url: "https://rockstart.com",
    apply_url: "https://rockstart.com/apply/",
    logo_url: "https://logo.clearbit.com/rockstart.com",
    source_url: "https://rockstart.com",
  },
  {
    name: "Surge",
    website_url: "https://www.surgeahead.com",
    apply_url: "https://www.surgeahead.com",
    logo_url: "https://logo.clearbit.com/surgeahead.com",
    source_url: "https://www.surgeahead.com",
  },
  {
    name: "India Accelerator",
    website_url: "https://www.indiaaccelerator.co",
    apply_url: "https://www.indiaaccelerator.co",
    logo_url: "https://logo.clearbit.com/indiaaccelerator.co",
    source_url: "https://www.indiaaccelerator.co",
  },
  {
    name: "JioGenNext",
    website_url: "https://www.jiogennext.com",
    apply_url: "https://www.jiogennext.com",
    logo_url: "https://logo.clearbit.com/jiogennext.com",
    source_url: "https://www.jiogennext.com",
  },
  {
    name: "100Unicorns",
    website_url: "https://100unicorns.vc",
    apply_url: "https://100unicorns.vc",
    logo_url: "https://logo.clearbit.com/100unicorns.vc",
    source_url: "https://100unicorns.vc",
  },
  {
    name: "Axilor Ventures",
    website_url: "https://axilor.com",
    apply_url: "https://axilor.com",
    logo_url: "https://logo.clearbit.com/axilor.com",
    source_url: "https://axilor.com",
  },
  {
    name: "T-Hub",
    website_url: "https://t-hub.co",
    apply_url: "https://t-hub.co/programs/",
    logo_url: "https://logo.clearbit.com/t-hub.co",
    source_url: "https://t-hub.co",
  },
  {
    name: "HAX",
    website_url: "https://hax.co",
    apply_url: "https://hax.co/apply/",
    logo_url: "https://logo.clearbit.com/hax.co",
    source_url: "https://hax.co",
  },
  {
    name: "IndieBio",
    website_url: "https://indiebio.co",
    apply_url: "https://indiebio.co/apply/",
    logo_url: "https://logo.clearbit.com/indiebio.co",
    source_url: "https://indiebio.co",
  },
  {
    name: "Tenity",
    website_url: "https://www.tenity.com",
    apply_url: "https://www.tenity.com/programs",
    logo_url: "https://logo.clearbit.com/tenity.com",
    source_url: "https://www.tenity.com/programs",
  },
  {
    name: "Endless Frontier Labs",
    website_url: "https://endlessfrontierlabs.com",
    apply_url: "https://endlessfrontierlabs.com/apply",
    logo_url: "https://logo.clearbit.com/endlessfrontierlabs.com",
    source_url: "https://endlessfrontierlabs.com",
  },
];

const startupProgramMeta: Record<string, StartupProgramMeta> = {
  "y-combinator": {
    program_type: "Accelerator",
    organization_type: "VC-backed accelerator",
    short_description: "Flagship accelerator for founders with sharp conviction and fast iteration loops.",
    investment_thesis:
      "Back founders who can compress a painful problem into a wedge that scales into a large market.",
    applications_open: true,
    application_deadline: "Rolling by batch",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "San Francisco",
    hq_region: "North America",
    operating_geographies: ["United States", "India", "United Kingdom", "Singapore", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: true,
    primary_sectors: ["AI", "SaaS", "Developer tools"],
    secondary_sectors: ["Fintech", "Healthcare", "Climate"],
    industry_tags: ["accelerator", "founder-led", "early-stage"],
    business_model_tags: ["B2B", "B2C", "marketplaces"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 500000,
    cash_investment_max: 500000,
    currency: "USD",
    equity_min_pct: 7,
    equity_max_pct: 7,
    equity_type: "Standard deal",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Weekly dinners, advisor network, demo day, and a very strong alumni graph.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Winter 2027",
    demo_day: true,
    mentorship_model: "Partner-led office hours",
    curriculum_focus: ["Product velocity", "Distribution", "Fundraising"],
    founder_profile_fit: "Best for founders with a strong wedge and clear founder-market fit.",
    notable_alumni: ["Airbnb", "Stripe", "DoorDash"],
    portfolio_count: 5000,
    ranking_score: 99,
    editorial_score: 97,
    display_geography_chips: ["USA", "India", "Remote"],
    display_check_range: "$500k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Looks for unusually strong founders, clear urgency, and evidence that a wedge can grow into a category-defining company.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid"],
  },
  techstars: {
    program_type: "Accelerator",
    organization_type: "Global accelerator network",
    short_description: "Mentor-led accelerator platform with city-specific batches and partner programs.",
    investment_thesis:
      "Invest in founders who benefit from structure, a strong mentor network, and fast customer discovery loops.",
    applications_open: true,
    application_deadline: "Varies by city",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Boulder",
    hq_region: "North America",
    operating_geographies: ["United States", "United Kingdom", "India", "Europe", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: true,
    primary_sectors: ["SaaS", "AI", "Climate"],
    secondary_sectors: ["Healthtech", "Fintech", "Consumer"],
    industry_tags: ["accelerator", "mentor network", "batch"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 20000,
    cash_investment_max: 120000,
    currency: "USD",
    equity_min_pct: 6,
    equity_max_pct: 6,
    equity_type: "Common + SAFE",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Mentor office hours, perks, investor exposure, and corporate partner access.",
    program_duration_weeks: 13,
    cohort_based: true,
    next_cohort_date: "Multiple annual cohorts",
    demo_day: true,
    mentorship_model: "Mentor-driven",
    curriculum_focus: ["Customer growth", "Investor readiness", "Founder discipline"],
    founder_profile_fit: "Good for founders who want structured support and dense operator feedback.",
    notable_alumni: ["SendGrid", "ClassPass", "Chainalysis"],
    portfolio_count: 4000,
    ranking_score: 95,
    editorial_score: 92,
    display_geography_chips: ["USA", "UK", "India"],
    display_check_range: "$20k to $120k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Works well for companies with early momentum that can sharpen positioning quickly through mentor density and structured milestones.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid"],
  },
  "500-global": {
    program_type: "Accelerator",
    organization_type: "Venture fund platform",
    short_description: "Global seed platform focused on repeatable growth and investor readiness.",
    investment_thesis:
      "Back startups with repeatable growth potential, strong markets, and founder ambition at global scale.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "San Francisco",
    hq_region: "North America",
    operating_geographies: ["United States", "Southeast Asia", "MENA", "Latin America", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: true,
    primary_sectors: ["SaaS", "AI", "Fintech"],
    secondary_sectors: ["Commerce", "Climate", "Consumer"],
    industry_tags: ["accelerator", "growth", "global expansion"],
    business_model_tags: ["B2B", "B2C", "marketplaces"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 150000,
    cash_investment_max: 150000,
    currency: "USD",
    equity_min_pct: 6,
    equity_max_pct: 6,
    equity_type: "SAFE",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Growth sessions, international market access, and founder support across 500's network.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Multiple cohorts",
    demo_day: true,
    mentorship_model: "Founder + growth mentors",
    curriculum_focus: ["Growth", "Fundraising", "Expansion"],
    founder_profile_fit: "Best for startups already thinking globally and building repeatable GTM.",
    notable_alumni: ["Canva", "Talkdesk", "Grab"],
    portfolio_count: 2800,
    ranking_score: 92,
    editorial_score: 90,
    display_geography_chips: ["USA", "MENA", "SEA"],
    display_check_range: "$150k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Prioritizes global market ambition, growth discipline, and founders who can scale a repeatable motion across regions.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  "google-for-startups-accelerator": {
    program_type: "Accelerator",
    organization_type: "Corporate program",
    short_description: "Google-backed support track with product help, network access, and cloud support.",
    investment_thesis:
      "Support startups using technology in meaningful ways to unlock growth, product leverage, and ecosystem access.",
    applications_open: true,
    application_deadline: "Varies by cohort",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Mountain View",
    hq_region: "North America",
    operating_geographies: ["United States", "India", "Europe", "LATAM", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["AI", "Cloud infrastructure", "SaaS"],
    secondary_sectors: ["Healthcare", "Climate", "Cybersecurity"],
    industry_tags: ["accelerator", "corporate", "cloud credits"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: null,
    cash_investment_max: null,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: null,
    equity_free: true,
    follow_on_available: false,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: 350000,
    perks_summary: "Cloud credits, technical mentorship, and operator sessions tuned to Google product teams.",
    program_duration_weeks: 10,
    cohort_based: true,
    next_cohort_date: "Varies by region",
    demo_day: false,
    mentorship_model: "Google product and GTM mentors",
    curriculum_focus: ["Product scale", "Cloud architecture", "Go-to-market"],
    founder_profile_fit: "Strong for AI and software startups that can use cloud and product support well.",
    notable_alumni: ["DigiBuild", "Rec Room", "CropIn"],
    portfolio_count: null,
    ranking_score: 90,
    editorial_score: 89,
    display_geography_chips: ["USA", "India", "Remote"],
    display_check_range: "$350k credits",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Best for technical startups that want product leverage, cloud support, and a credible operator network without giving up equity.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Equity-free", "Hybrid"],
  },
  masschallenge: {
    program_type: "Accelerator",
    organization_type: "Nonprofit accelerator",
    short_description: "Zero-equity accelerator with industry-specific programs and global founder support.",
    investment_thesis:
      "Support startups solving important problems with measurable outcomes and strong path-to-scale signals.",
    applications_open: true,
    application_deadline: "Varies by program",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Boston",
    hq_region: "North America",
    operating_geographies: ["United States", "Switzerland", "Israel", "Mexico", "United Kingdom"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["Climate", "Healthcare", "Fintech"],
    secondary_sectors: ["Manufacturing", "Foodtech", "Enterprise"],
    industry_tags: ["accelerator", "nonprofit", "zero equity"],
    business_model_tags: ["B2B", "B2B2C", "impact"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: null,
    cash_investment_max: null,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: null,
    equity_free: true,
    follow_on_available: false,
    grant_amount_min: 0,
    grant_amount_max: 100000,
    credits_value: null,
    perks_summary: "Zero-equity support, enterprise partner access, and challenge-based exposure.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Annual tracks",
    demo_day: true,
    mentorship_model: "Operator + partner mentors",
    curriculum_focus: ["Pilot access", "Enterprise readiness", "Impact storytelling"],
    founder_profile_fit: "Useful for startups that want non-dilutive support and partner access.",
    notable_alumni: ["Kinside", "Aromyx", "Mimica"],
    portfolio_count: 3000,
    ranking_score: 88,
    editorial_score: 87,
    display_geography_chips: ["USA", "Israel", "Mexico"],
    display_check_range: "Equity-free awards",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Zero-equity support for startups that want pilot access, mentor depth, and a path into corporate and ecosystem partnerships.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Equity-free"],
  },
  sosv: {
    program_type: "Accelerator",
    organization_type: "Venture fund platform",
    short_description: "Sector-led accelerator family spanning climate, health, biotech, and hardtech.",
    investment_thesis:
      "Invest in mission-driven technical founders building deep products in complex sectors with long-term upside.",
    applications_open: true,
    application_deadline: "Rolling by program",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Princeton",
    hq_region: "North America",
    operating_geographies: ["United States", "Ireland", "China", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["Climate", "Biotech", "Deeptech"],
    secondary_sectors: ["Foodtech", "Industrial", "Web3"],
    industry_tags: ["accelerator", "deeptech", "venture platform"],
    business_model_tags: ["B2B", "deep R&D"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: 150000,
    cash_investment_max: 525000,
    currency: "USD",
    equity_min_pct: 5,
    equity_max_pct: 8,
    equity_type: "SAFE / equity",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Program-specific labs, specialist mentors, and follow-on capital paths.",
    program_duration_weeks: 14,
    cohort_based: true,
    next_cohort_date: "Multiple annual cohorts",
    demo_day: true,
    mentorship_model: "Vertical specialist mentors",
    curriculum_focus: ["Commercialization", "Fundraising", "Technical scaling"],
    founder_profile_fit: "Strong for technical teams in biotech, climate, and hard problems.",
    notable_alumni: ["NotCo", "Upside Foods", "Opentrons"],
    portfolio_count: 1200,
    ranking_score: 91,
    editorial_score: 90,
    display_geography_chips: ["USA", "Ireland", "Remote"],
    display_check_range: "$150k to $525k",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "Best for technical founders working on deep products where specialized capital, labs, and expert mentoring materially change the odds.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  "plug-and-play": {
    program_type: "Accelerator",
    organization_type: "Corporate innovation platform",
    short_description: "Global innovation platform connecting startups to enterprise pilots and partner networks.",
    investment_thesis:
      "Support startups that benefit from immediate enterprise access, pilot cycles, and industry-specific partner channels.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Sunnyvale",
    hq_region: "North America",
    operating_geographies: ["United States", "Germany", "Singapore", "Japan", "UAE"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["Fintech", "AI", "Mobility"],
    secondary_sectors: ["Climate", "Insurtech", "Enterprise"],
    industry_tags: ["accelerator", "corporate pilots", "enterprise access"],
    business_model_tags: ["B2B", "B2B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: null,
    cash_investment_max: null,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Corporate pilots, partner matchmaking, and regional program distribution.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Rolling vertical batches",
    demo_day: true,
    mentorship_model: "Corporate + operator mentors",
    curriculum_focus: ["Enterprise pilots", "Partner sales", "Scale partnerships"],
    founder_profile_fit: "Useful when enterprise validation and partner intros matter more than curriculum.",
    notable_alumni: ["PayPal", "Dropbox", "Rappi"],
    portfolio_count: 2500,
    ranking_score: 86,
    editorial_score: 84,
    display_geography_chips: ["USA", "Germany", "Singapore"],
    display_check_range: "Varies",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Built for startups that can use corporate pilot access and industry relationships as the fastest path to commercial proof.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  "alchemist-accelerator": {
    program_type: "Accelerator",
    organization_type: "Enterprise accelerator",
    short_description: "B2B-focused accelerator centered on enterprise go-to-market and founder storytelling.",
    investment_thesis:
      "Back technical B2B founders building meaningful infrastructure, workflow, or enterprise applications.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "San Francisco",
    hq_region: "North America",
    operating_geographies: ["United States", "India", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["SaaS", "AI", "Cybersecurity"],
    secondary_sectors: ["Developer tools", "Cloud infrastructure", "Fintech"],
    industry_tags: ["accelerator", "enterprise", "B2B"],
    business_model_tags: ["B2B"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 25000,
    cash_investment_max: 50000,
    currency: "USD",
    equity_min_pct: 5,
    equity_max_pct: 5,
    equity_type: "SAFE",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Enterprise GTM sessions, founder coaching, and investor network access.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Quarterly",
    demo_day: true,
    mentorship_model: "Operator-led",
    curriculum_focus: ["Enterprise GTM", "Fundraising", "Category positioning"],
    founder_profile_fit: "Best for B2B and enterprise technical founders already building a sharp wedge.",
    notable_alumni: ["LaunchDarkly", "Rigetti", "Mighty Networks"],
    portfolio_count: 650,
    ranking_score: 87,
    editorial_score: 88,
    display_geography_chips: ["USA", "India", "Remote"],
    display_check_range: "$25k to $50k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Optimized for enterprise-first founders who need help tightening GTM, positioning, and investor narrative around a B2B product.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  angelpad: {
    program_type: "Accelerator",
    organization_type: "Boutique accelerator",
    short_description: "Small-batch accelerator with strong founder support and deep alumni access.",
    investment_thesis:
      "Back ambitious early teams with the potential to become durable venture-scale companies.",
    applications_open: true,
    application_deadline: "Seasonal",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "San Francisco",
    hq_region: "North America",
    operating_geographies: ["United States", "Europe", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: true,
    primary_sectors: ["AI", "SaaS", "Consumer"],
    secondary_sectors: ["Fintech", "Developer tools"],
    industry_tags: ["accelerator", "small batch", "founder support"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Prototype", "Early Revenue"],
    minimum_stage: "Prototype",
    maximum_stage: "Early Revenue",
    cash_investment_min: 120000,
    cash_investment_max: 120000,
    currency: "USD",
    equity_min_pct: 7,
    equity_max_pct: 7,
    equity_type: "SAFE",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Hands-on office hours, small cohorts, and alumni support.",
    program_duration_weeks: 10,
    cohort_based: true,
    next_cohort_date: "Twice yearly",
    demo_day: true,
    mentorship_model: "Partner-led",
    curriculum_focus: ["Product", "Fundraising", "Storytelling"],
    founder_profile_fit: "Good for early founders who value high-touch feedback over large batch scale.",
    notable_alumni: ["Postmates", "Pipedrive", "Coverhound"],
    portfolio_count: 180,
    ranking_score: 80,
    editorial_score: 82,
    display_geography_chips: ["USA", "Europe", "Remote"],
    display_check_range: "$120k",
    display_stage_chips: ["Prototype", "Early Revenue"],
    display_thesis_snippet:
      "Small-batch model for founders who want concentrated support, sharper storytelling, and strong early investor positioning.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid"],
  },
  "a16z-speedrun": {
    program_type: "Accelerator",
    organization_type: "Operator-led accelerator",
    short_description: "Gaming-focused accelerator pairing early teams with capital, operators, and platform leverage.",
    investment_thesis:
      "Back founders building breakout game studios, gaming infrastructure, and interactive entertainment products with strong community pull.",
    applications_open: true,
    application_deadline: "Rolling by cohort",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Los Angeles",
    hq_region: "North America",
    operating_geographies: ["United States", "Global", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["Gaming", "Consumer", "AI"],
    secondary_sectors: ["Creator tools", "Developer tools", "Media"],
    industry_tags: ["accelerator", "gaming", "interactive entertainment"],
    business_model_tags: ["B2C", "B2B", "marketplaces"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: 750000,
    cash_investment_max: 1000000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: 5000000,
    perks_summary: "Hands-on operator support, fundraising help, platform credits, and gaming-specific founder community.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "SR007",
    demo_day: true,
    mentorship_model: "Hands-on operator team",
    curriculum_focus: ["Launch strategy", "Growth loops", "Fundraising"],
    founder_profile_fit: "Best for gaming and interactive founders who want deep operator support and early capital density.",
    notable_alumni: ["Series Entertainment", "Crossmint", "Nexus Labs"],
    portfolio_count: 600,
    ranking_score: 88,
    editorial_score: 90,
    display_geography_chips: ["USA", "Global", "Remote"],
    display_check_range: "$750k to $1M",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "Designed for gaming and interactive startups that benefit from tight operator support, capital access, and community-driven distribution insight.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  seedcamp: {
    program_type: "Accelerator",
    organization_type: "Seed fund platform",
    short_description: "European seed platform that combines capital, community, and operator support.",
    investment_thesis:
      "Back European and globally minded founders building the next generation of category-defining technology companies.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United Kingdom",
    hq_city: "London",
    hq_region: "Europe",
    operating_geographies: ["United Kingdom", "Europe", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Europe", "Global"],
    sector_agnostic: true,
    primary_sectors: ["AI", "SaaS", "Fintech"],
    secondary_sectors: ["Healthtech", "Climate", "Consumer"],
    industry_tags: ["seed fund", "Europe", "operator network"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 250000,
    cash_investment_max: 1000000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Operator platform, portfolio community, and seed capital across Europe.",
    program_duration_weeks: null,
    cohort_based: false,
    next_cohort_date: null,
    demo_day: false,
    mentorship_model: "Operator network",
    curriculum_focus: ["Early distribution", "Hiring", "Fundraising"],
    founder_profile_fit: "Best for founders with early traction who want a European network and capital platform.",
    notable_alumni: ["Wise", "Revolut", "UiPath"],
    portfolio_count: 460,
    ranking_score: 84,
    editorial_score: 86,
    display_geography_chips: ["UK", "Europe", "Remote"],
    display_check_range: "$250k to $1M",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "A strong fit for founders targeting Europe who want capital, operator leverage, and a network that scales beyond one batch.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Rolling"],
  },
  "entrepreneurs-first": {
    program_type: "Fellowship",
    organization_type: "Talent investor",
    short_description: "Pre-team program that backs individuals before they fully form a company.",
    investment_thesis:
      "Invest in exceptional individuals early and help them find cofounders, markets, and company ideas worth pursuing.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United Kingdom",
    hq_city: "London",
    hq_region: "Europe",
    operating_geographies: ["United Kingdom", "India", "Singapore", "France"],
    program_format: "Hybrid",
    relocation_required: true,
    target_geographies: ["Europe", "India", "APAC"],
    sector_agnostic: true,
    primary_sectors: ["AI", "Deeptech", "Enterprise"],
    secondary_sectors: ["Climate", "Healthcare", "Biotech"],
    industry_tags: ["pre-team", "talent", "cofounder matching"],
    business_model_tags: ["B2B", "deeptech"],
    stages_supported: ["Idea or Patent", "Prototype"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Prototype",
    cash_investment_min: 125000,
    cash_investment_max: 125000,
    currency: "USD",
    equity_min_pct: 8,
    equity_max_pct: 10,
    equity_type: "SAFE / founder-first capital",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Cofounder search, founder salary support, and structured company formation.",
    program_duration_weeks: 16,
    cohort_based: true,
    next_cohort_date: "Quarterly",
    demo_day: true,
    mentorship_model: "Talent + founder coaches",
    curriculum_focus: ["Cofounder matching", "Idea formation", "Investor readiness"],
    founder_profile_fit: "Strong for technical or repeat founders still shaping team and problem definition.",
    notable_alumni: ["Tractable", "Magic Pony", "OpenCosmos"],
    portfolio_count: 700,
    ranking_score: 81,
    editorial_score: 83,
    display_geography_chips: ["UK", "India", "Singapore"],
    display_check_range: "$125k",
    display_stage_chips: ["Idea or Patent", "Prototype"],
    display_thesis_snippet:
      "Designed for exceptional individuals earlier than most programs, especially when team formation and founder matching are still in motion.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  startupbootcamp: {
    program_type: "Accelerator",
    organization_type: "Global accelerator network",
    short_description: "Themed accelerator programs with strong regional partner access and mentor support.",
    investment_thesis:
      "Back founders that can move quickly with the help of a strong partner ecosystem and vertical-specific mentor access.",
    applications_open: true,
    application_deadline: "Varies by cohort",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "Netherlands",
    hq_city: "Amsterdam",
    hq_region: "Europe",
    operating_geographies: ["Netherlands", "Middle East", "Africa", "United Kingdom"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Europe", "MENA", "Africa"],
    sector_agnostic: false,
    primary_sectors: ["Fintech", "Climate", "SaaS"],
    secondary_sectors: ["Healthtech", "Mobility", "Insurtech"],
    industry_tags: ["accelerator", "vertical programs", "mentor network"],
    business_model_tags: ["B2B", "B2B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 15000,
    cash_investment_max: 100000,
    currency: "USD",
    equity_min_pct: 6,
    equity_max_pct: 8,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Themed mentors, corporate partnerships, and localized batch support.",
    program_duration_weeks: 13,
    cohort_based: true,
    next_cohort_date: "Varies by track",
    demo_day: true,
    mentorship_model: "Vertical mentors",
    curriculum_focus: ["Industry access", "Partnerships", "Commercialization"],
    founder_profile_fit: "Good for startups that fit a vertical batch and benefit from ecosystem access.",
    notable_alumni: ["Relayr", "Mizzen+Main", "Huspy"],
    portfolio_count: 1500,
    ranking_score: 78,
    editorial_score: 79,
    display_geography_chips: ["Netherlands", "MENA", "Africa"],
    display_check_range: "$15k to $100k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Useful when a vertical-specific program and partner network are more valuable than a generalist accelerator brand.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid"],
  },
  "creative-destruction-lab": {
    program_type: "Accelerator",
    organization_type: "University-backed program",
    short_description: "Deeptech program linking technical founders to researchers, mentors, and commercialization paths.",
    investment_thesis:
      "Support science and deeptech founders who can turn novel technical work into venture-scale companies.",
    applications_open: true,
    application_deadline: "Rolling triage",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "Canada",
    hq_city: "Toronto",
    hq_region: "North America",
    operating_geographies: ["Canada", "United States", "United Kingdom", "Europe"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["Deeptech", "AI", "Climate"],
    secondary_sectors: ["Quantum", "Biotech", "Energy"],
    industry_tags: ["deeptech", "commercialization", "university"],
    business_model_tags: ["B2B", "R&D-heavy"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: null,
    cash_investment_max: 100000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: null,
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Scientific mentors, commercialization support, and investor introductions.",
    program_duration_weeks: 24,
    cohort_based: true,
    next_cohort_date: "Multiple streams",
    demo_day: false,
    mentorship_model: "Scientist + investor mentors",
    curriculum_focus: ["Commercialization", "Technical validation", "Fundraising"],
    founder_profile_fit: "Best for technical teams translating research into venture-backed companies.",
    notable_alumni: ["BenchSci", "Atomwise", "Waabi"],
    portfolio_count: 800,
    ranking_score: 82,
    editorial_score: 84,
    display_geography_chips: ["Canada", "USA", "UK"],
    display_check_range: "Up to $100k",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "A better fit for deeptech and research-heavy companies where commercialization support and technical mentor access matter more than batch theatrics.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  "startup-chile": {
    program_type: "Accelerator",
    organization_type: "Public program",
    short_description: "Equity-free public startup program with grants, mentoring, and Latin American ecosystem access.",
    investment_thesis:
      "Support founders building globally relevant companies while strengthening Chile's startup ecosystem.",
    applications_open: true,
    application_deadline: "By cohort",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "Chile",
    hq_city: "Santiago",
    hq_region: "Latin America",
    operating_geographies: ["Chile", "Latin America", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Latin America", "Global"],
    sector_agnostic: true,
    primary_sectors: ["SaaS", "Commerce", "Climate"],
    secondary_sectors: ["Fintech", "Consumer", "Deeptech"],
    industry_tags: ["equity-free", "public program", "latin america"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: null,
    cash_investment_max: null,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: null,
    equity_free: true,
    follow_on_available: false,
    grant_amount_min: 15000,
    grant_amount_max: 80000,
    credits_value: null,
    perks_summary: "Non-dilutive grants, founder services, and LATAM network access.",
    program_duration_weeks: 16,
    cohort_based: true,
    next_cohort_date: "Twice yearly",
    demo_day: true,
    mentorship_model: "Program mentors + ecosystem partners",
    curriculum_focus: ["Go-to-market", "Expansion", "Local ecosystem access"],
    founder_profile_fit: "Strong for founders who want equity-free support and LATAM access.",
    notable_alumni: ["The Not Company", "Cornershop", "Fintual"],
    portfolio_count: 2000,
    ranking_score: 79,
    editorial_score: 81,
    display_geography_chips: ["Chile", "LATAM", "Remote"],
    display_check_range: "$15k to $80k grants",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "Non-dilutive support with strong Latin American ecosystem access, especially useful when international founders want a regional launchpad.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Equity-free"],
  },
  "founders-factory": {
    program_type: "Venture Studio",
    organization_type: "Venture studio",
    short_description: "Venture studio and accelerator platform connecting founders to corporate partners and capital.",
    investment_thesis:
      "Back founders where venture building support and corporate distribution can materially accelerate company formation.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United Kingdom",
    hq_city: "London",
    hq_region: "Europe",
    operating_geographies: ["United Kingdom", "Europe", "South Africa", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Europe", "Africa", "Global"],
    sector_agnostic: false,
    primary_sectors: ["Fintech", "Climate", "Commerce"],
    secondary_sectors: ["SaaS", "Healthtech", "Consumer"],
    industry_tags: ["venture studio", "corporate partnerships", "venture building"],
    business_model_tags: ["B2B", "B2C", "marketplaces"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: 30000,
    cash_investment_max: 250000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies by track",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Studio support, talent help, partner access, and corporate co-build opportunities.",
    program_duration_weeks: 16,
    cohort_based: true,
    next_cohort_date: "Rolling tracks",
    demo_day: false,
    mentorship_model: "Studio team + partner operators",
    curriculum_focus: ["Company building", "Distribution", "Product execution"],
    founder_profile_fit: "Good for founders who want hands-on building support plus partner leverage.",
    notable_alumni: ["Zego", "Aire", "Juni"],
    portfolio_count: 300,
    ranking_score: 77,
    editorial_score: 80,
    display_geography_chips: ["UK", "Europe", "Remote"],
    display_check_range: "$30k to $250k",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "Useful when venture-building support and partner distribution channels are as important as capital itself.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  era: {
    program_type: "Accelerator",
    organization_type: "Seed accelerator",
    short_description: "New York accelerator with strong operator access and early-stage fundraising support.",
    investment_thesis:
      "Back founders who can turn early traction into a compelling seed narrative through product and GTM clarity.",
    applications_open: true,
    application_deadline: "By cohort",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "New York",
    hq_region: "North America",
    operating_geographies: ["United States", "Remote"],
    program_format: "In-person",
    relocation_required: true,
    target_geographies: ["United States"],
    sector_agnostic: true,
    primary_sectors: ["SaaS", "AI", "Fintech"],
    secondary_sectors: ["Commerce", "Healthtech"],
    industry_tags: ["accelerator", "new york", "seed stage"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Prototype", "Early Revenue"],
    minimum_stage: "Prototype",
    maximum_stage: "Early Revenue",
    cash_investment_min: 150000,
    cash_investment_max: 150000,
    currency: "USD",
    equity_min_pct: 8,
    equity_max_pct: 8,
    equity_type: "SAFE",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "NYC operator access, fundraising prep, and founder community.",
    program_duration_weeks: 16,
    cohort_based: true,
    next_cohort_date: "Twice yearly",
    demo_day: true,
    mentorship_model: "Operator-led",
    curriculum_focus: ["Seed fundraising", "Founder execution", "GTM"],
    founder_profile_fit: "Best for founders who want in-person operator support and a NYC network.",
    notable_alumni: ["TripleLift", "Glossier", "OrderGroove"],
    portfolio_count: 350,
    ranking_score: 75,
    editorial_score: 78,
    display_geography_chips: ["USA", "NYC"],
    display_check_range: "$150k",
    display_stage_chips: ["Prototype", "Early Revenue"],
    display_thesis_snippet:
      "A dense, in-person seed accelerator for founders who benefit from operator pressure, fundraising prep, and a local network.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "In-person"],
  },
  ewor: {
    program_type: "Fellowship",
    organization_type: "Founder fellowship",
    short_description: "Founder fellowship focused on exceptional operators and early company formation.",
    investment_thesis:
      "Support top-tier founders with capital, community, and tactical help before traditional accelerators are a fit.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "Germany",
    hq_city: "Berlin",
    hq_region: "Europe",
    operating_geographies: ["Germany", "Europe", "Remote"],
    program_format: "Remote",
    relocation_required: false,
    target_geographies: ["Europe", "Global"],
    sector_agnostic: true,
    primary_sectors: ["AI", "SaaS", "Fintech"],
    secondary_sectors: ["Climate", "Commerce", "Developer tools"],
    industry_tags: ["fellowship", "founder community", "remote"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Idea or Patent", "Prototype"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Prototype",
    cash_investment_min: 0,
    cash_investment_max: 150000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Founder coaching, community, and early access to investors and operators.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Rolling cohorts",
    demo_day: false,
    mentorship_model: "Founder coaches + investor community",
    curriculum_focus: ["Founder development", "Idea testing", "Network access"],
    founder_profile_fit: "Strong for high-agency founders earlier than a typical accelerator stage.",
    notable_alumni: [],
    portfolio_count: null,
    ranking_score: 73,
    editorial_score: 76,
    display_geography_chips: ["Germany", "Europe", "Remote"],
    display_check_range: "Up to $150k",
    display_stage_chips: ["Idea or Patent", "Prototype"],
    display_thesis_snippet:
      "A founder-first fellowship when the right need is exceptional peer density and early support rather than a full accelerator curriculum.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Remote", "Rolling"],
  },
  wayra: {
    program_type: "Accelerator",
    organization_type: "Corporate venture arm",
    short_description: "Telefónica's startup platform for enterprise partnerships and strategic distribution.",
    investment_thesis:
      "Work with startups where distribution, telecom infrastructure, and strategic enterprise relationships unlock growth.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "Spain",
    hq_city: "Madrid",
    hq_region: "Europe",
    operating_geographies: ["Spain", "United Kingdom", "Brazil", "Germany", "Argentina"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Europe", "LATAM"],
    sector_agnostic: false,
    primary_sectors: ["Telecom", "AI", "Cybersecurity"],
    secondary_sectors: ["Mobility", "IoT", "Enterprise"],
    industry_tags: ["corporate accelerator", "telecom", "distribution"],
    business_model_tags: ["B2B", "B2B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 50000,
    cash_investment_max: 150000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Enterprise distribution, Telefónica partner access, and regional landing support.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Rolling verticals",
    demo_day: false,
    mentorship_model: "Corporate + ecosystem mentors",
    curriculum_focus: ["Partnerships", "Enterprise pilots", "International expansion"],
    founder_profile_fit: "Best when corporate distribution and telecom relationships are core advantages.",
    notable_alumni: ["Cabify", "GoCardless", "Haddock"],
    portfolio_count: 1000,
    ranking_score: 76,
    editorial_score: 77,
    display_geography_chips: ["Spain", "UK", "Brazil"],
    display_check_range: "$50k to $150k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "A stronger fit when enterprise distribution, telecom channels, and strategic partnerships are central to the company’s next phase.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  "berkeley-skydeck": {
    program_type: "Accelerator",
    organization_type: "University-backed accelerator",
    short_description: "Berkeley-linked accelerator with capital, advisor depth, and research network access.",
    investment_thesis:
      "Support technically strong startups that can benefit from proximity to the Berkeley network and venture ecosystem.",
    applications_open: true,
    application_deadline: "By batch",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Berkeley",
    hq_region: "North America",
    operating_geographies: ["United States", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: true,
    primary_sectors: ["AI", "Deeptech", "SaaS"],
    secondary_sectors: ["Climate", "Biotech", "Enterprise"],
    industry_tags: ["university", "accelerator", "berkeley"],
    business_model_tags: ["B2B", "B2C", "deeptech"],
    stages_supported: ["Prototype", "Early Revenue"],
    minimum_stage: "Prototype",
    maximum_stage: "Early Revenue",
    cash_investment_min: 200000,
    cash_investment_max: 200000,
    currency: "USD",
    equity_min_pct: 7.5,
    equity_max_pct: 7.5,
    equity_type: "SAFE",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Berkeley network, advisor depth, and investor access in the Bay Area.",
    program_duration_weeks: 24,
    cohort_based: true,
    next_cohort_date: "Twice yearly",
    demo_day: true,
    mentorship_model: "Advisor network + operators",
    curriculum_focus: ["Fundraising", "Research commercialization", "Growth"],
    founder_profile_fit: "Useful for technical startups that benefit from university-linked credibility and Bay Area access.",
    notable_alumni: ["Carbice", "Mighty Buildings", "SafelyYou"],
    portfolio_count: 250,
    ranking_score: 78,
    editorial_score: 80,
    display_geography_chips: ["USA", "Bay Area"],
    display_check_range: "$200k",
    display_stage_chips: ["Prototype", "Early Revenue"],
    display_thesis_snippet:
      "Strong for technical teams that want Berkeley credibility, Bay Area investor access, and a program that leans into research-driven company building.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid"],
  },
  startx: {
    program_type: "Accelerator",
    organization_type: "Founder community",
    short_description: "Stanford-linked founder community with high-quality peer support and investor access.",
    investment_thesis:
      "Support founders with strong conviction and networks who benefit most from peer density and community leverage.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Palo Alto",
    hq_region: "North America",
    operating_geographies: ["United States", "Remote"],
    program_format: "In-person",
    relocation_required: false,
    target_geographies: ["United States"],
    sector_agnostic: true,
    primary_sectors: ["AI", "SaaS", "Biotech"],
    secondary_sectors: ["Climate", "Healthcare", "Developer tools"],
    industry_tags: ["founder community", "stanford", "alumni"],
    business_model_tags: ["B2B", "B2C", "deeptech"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: null,
    cash_investment_max: null,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: null,
    equity_free: true,
    follow_on_available: false,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Peer network, alumni support, and Bay Area founder access.",
    program_duration_weeks: null,
    cohort_based: false,
    next_cohort_date: null,
    demo_day: false,
    mentorship_model: "Peer network + founder community",
    curriculum_focus: ["Peer learning", "Fundraising", "Hiring"],
    founder_profile_fit: "Best for founders who value community and already have access to a strong network.",
    notable_alumni: ["Lime", "Branch", "Kodiak Robotics"],
    portfolio_count: 700,
    ranking_score: 74,
    editorial_score: 79,
    display_geography_chips: ["USA", "Bay Area"],
    display_check_range: "Community access",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "More community and network than curriculum, which makes it strong for founders who already have momentum and want sharper peer access.",
    display_primary_cta: "Visit Site",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Equity-free", "Rolling"],
  },
  "forum-ventures": {
    program_type: "Accelerator",
    organization_type: "B2B SaaS fund",
    short_description: "B2B SaaS accelerator and fund with a strong early GTM and fundraising focus.",
    investment_thesis:
      "Back SaaS founders who can quickly validate ICP, sharpen narrative, and build repeatable early revenue.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "New York",
    hq_region: "North America",
    operating_geographies: ["United States", "Canada", "Remote"],
    program_format: "Remote",
    relocation_required: false,
    target_geographies: ["North America", "Global"],
    sector_agnostic: false,
    primary_sectors: ["SaaS", "AI", "Developer tools"],
    secondary_sectors: ["Fintech", "Commerce"],
    industry_tags: ["accelerator", "b2b saas", "remote"],
    business_model_tags: ["B2B"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 100000,
    cash_investment_max: 100000,
    currency: "USD",
    equity_min_pct: 7,
    equity_max_pct: 7,
    equity_type: "SAFE",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "B2B SaaS playbooks, investor network, and structured GTM support.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Multiple cohorts",
    demo_day: true,
    mentorship_model: "B2B operators",
    curriculum_focus: ["ICP definition", "Sales motion", "Fundraising"],
    founder_profile_fit: "Best for B2B SaaS teams still shaping go-to-market and early traction loops.",
    notable_alumni: ["Maven AGI", "Tactic", "Conduit"],
    portfolio_count: 450,
    ranking_score: 83,
    editorial_score: 84,
    display_geography_chips: ["USA", "Canada", "Remote"],
    display_check_range: "$100k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "A practical fit for B2B SaaS founders who need sharper ICP, a more disciplined sales story, and a stronger seed narrative.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Remote", "Rolling"],
  },
  "village-capital": {
    program_type: "Accelerator",
    organization_type: "Impact investor network",
    short_description: "Impact-oriented accelerator and investor network focused on inclusion and systems-level problems.",
    investment_thesis:
      "Support founders building inclusive solutions in complex sectors where ecosystem trust and mission fit matter.",
    applications_open: true,
    application_deadline: "Rolling by program",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Washington",
    hq_region: "North America",
    operating_geographies: ["United States", "Africa", "India", "Latin America"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["Fintech", "Climate", "Healthtech"],
    secondary_sectors: ["Agritech", "Inclusion", "Education"],
    industry_tags: ["impact", "accelerator", "peer review"],
    business_model_tags: ["B2B", "B2C", "impact"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 0,
    cash_investment_max: 200000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Impact-focused ecosystem, peer learning, and mission-aligned investor access.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Multiple thematic cohorts",
    demo_day: true,
    mentorship_model: "Peer + operator support",
    curriculum_focus: ["Impact narrative", "Market access", "Investor readiness"],
    founder_profile_fit: "Strong where mission fit and ecosystem credibility matter alongside capital.",
    notable_alumni: ["KarmaLife", "Wala", "M-KOPA"],
    portfolio_count: 1500,
    ranking_score: 77,
    editorial_score: 82,
    display_geography_chips: ["USA", "India", "Africa"],
    display_check_range: "Up to $200k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "More compelling for mission-driven startups in complex sectors where investor alignment and ecosystem trust are real advantages.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  "capital-factory": {
    program_type: "Accelerator",
    organization_type: "Startup hub + fund",
    short_description: "Texas startup hub and investment platform with community, events, and investor access.",
    investment_thesis:
      "Back founders who benefit from a strong local ecosystem, tactical support, and access to active investors.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Austin",
    hq_region: "North America",
    operating_geographies: ["United States", "Texas"],
    program_format: "In-person",
    relocation_required: false,
    target_geographies: ["United States"],
    sector_agnostic: true,
    primary_sectors: ["SaaS", "Defense", "AI"],
    secondary_sectors: ["Fintech", "Developer tools", "Consumer"],
    industry_tags: ["accelerator", "community", "texas"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 25000,
    cash_investment_max: 250000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Local investor network, coworking, events, and tactical founder community.",
    program_duration_weeks: null,
    cohort_based: false,
    next_cohort_date: null,
    demo_day: false,
    mentorship_model: "Community + investor network",
    curriculum_focus: ["Network access", "Fundraising", "Texas market"],
    founder_profile_fit: "Useful when local ecosystem access and investor adjacency matter more than a formal batch.",
    notable_alumni: ["Aceable", "FloSports", "Diligent Robotics"],
    portfolio_count: 350,
    ranking_score: 71,
    editorial_score: 74,
    display_geography_chips: ["USA", "Texas"],
    display_check_range: "$25k to $250k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Best for founders who want access to an active local network and a high-surface-area community rather than a tightly scripted accelerator.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "In-person", "Rolling"],
  },
  muckerlab: {
    program_type: "Accelerator",
    organization_type: "Seed accelerator",
    short_description: "High-conviction LA accelerator focused on product-market fit and founder execution.",
    investment_thesis:
      "Back founders with strong execution habits and enough traction or customer evidence to compound quickly.",
    applications_open: true,
    application_deadline: "By cohort",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Los Angeles",
    hq_region: "North America",
    operating_geographies: ["United States"],
    program_format: "In-person",
    relocation_required: true,
    target_geographies: ["United States"],
    sector_agnostic: true,
    primary_sectors: ["SaaS", "Commerce", "Consumer"],
    secondary_sectors: ["AI", "Fintech"],
    industry_tags: ["accelerator", "la", "small batch"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 100000,
    cash_investment_max: 250000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "High-touch batch support with strong investor exposure in LA.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Seasonal",
    demo_day: true,
    mentorship_model: "Partner-led",
    curriculum_focus: ["Product-market fit", "Execution pace", "Fundraising"],
    founder_profile_fit: "Useful for founders who want a smaller, more opinionated accelerator with close support.",
    notable_alumni: ["ServiceTitan", "Honey", "Boulevard"],
    portfolio_count: 200,
    ranking_score: 79,
    editorial_score: 81,
    display_geography_chips: ["USA", "LA"],
    display_check_range: "$100k to $250k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "A stronger fit when the value is high-touch partner support and a smaller batch, not a giant global brand.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "In-person"],
  },
  metaprop: {
    program_type: "Accelerator",
    organization_type: "Vertical fund",
    short_description: "Real estate technology platform for startups selling into property ecosystems.",
    investment_thesis:
      "Support startups transforming how real estate is developed, operated, financed, or experienced.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "New York",
    hq_region: "North America",
    operating_geographies: ["United States", "Europe", "Middle East"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["Proptech", "Fintech", "Climate"],
    secondary_sectors: ["Construction", "Insurance", "Enterprise SaaS"],
    industry_tags: ["proptech", "accelerator", "vertical"],
    business_model_tags: ["B2B", "B2B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 250000,
    cash_investment_max: 250000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "SAFE",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Real estate partner network, customer introductions, and vertical investor access.",
    program_duration_weeks: 16,
    cohort_based: true,
    next_cohort_date: "Annual cohort",
    demo_day: true,
    mentorship_model: "Vertical specialists",
    curriculum_focus: ["Proptech distribution", "Enterprise sales", "Fundraising"],
    founder_profile_fit: "Best when real estate is core and vertical intros materially move sales cycles.",
    notable_alumni: ["ButterflyMX", "Belong", "Kiavi"],
    portfolio_count: 200,
    ranking_score: 68,
    editorial_score: 74,
    display_geography_chips: ["USA", "Europe", "MENA"],
    display_check_range: "$250k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Highly relevant only when the product sells into real-estate ecosystems and partner access is the real unlock.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  nfx: {
    program_type: "Program",
    organization_type: "Venture platform",
    short_description: "Network-effect oriented platform and capital ecosystem for early founders.",
    investment_thesis:
      "Back founders building products where network effects and distribution loops can create outsized category power.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "San Francisco",
    hq_region: "North America",
    operating_geographies: ["United States", "Remote"],
    program_format: "Remote",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["Consumer", "Marketplaces", "AI"],
    secondary_sectors: ["SaaS", "Fintech", "Web3"],
    industry_tags: ["network effects", "platform", "founder network"],
    business_model_tags: ["marketplaces", "B2C", "B2B"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: null,
    cash_investment_max: 250000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Founder network, network-effects content, and signal-driven intros.",
    program_duration_weeks: null,
    cohort_based: false,
    next_cohort_date: null,
    demo_day: false,
    mentorship_model: "Platform + founder network",
    curriculum_focus: ["Network effects", "Distribution", "Fundraising"],
    founder_profile_fit: "Best for founders building businesses where network effects are core to strategy.",
    notable_alumni: ["Lyft", "Patreon", "DoorDash"],
    portfolio_count: null,
    ranking_score: 72,
    editorial_score: 75,
    display_geography_chips: ["USA", "Remote"],
    display_check_range: "Up to $250k",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "More platform than classic accelerator, which makes it most relevant for companies where network effects genuinely matter.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Remote", "Rolling"],
  },
  betaworks: {
    program_type: "Accelerator",
    organization_type: "Venture studio",
    short_description: "Theme-driven camp programs for startups working on frontier software and culture-tech ideas.",
    investment_thesis:
      "Support founders building the next wave of software products at the edge of technology, media, and culture.",
    applications_open: true,
    application_deadline: "Seasonal",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "New York",
    hq_region: "North America",
    operating_geographies: ["United States", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["United States", "Global"],
    sector_agnostic: false,
    primary_sectors: ["AI", "Consumer", "Media"],
    secondary_sectors: ["Developer tools", "Web3"],
    industry_tags: ["camp", "venture studio", "frontier software"],
    business_model_tags: ["B2C", "B2B"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: null,
    cash_investment_max: null,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Theme-led founder network, product thinking support, and investor relationships.",
    program_duration_weeks: 8,
    cohort_based: true,
    next_cohort_date: "Seasonal",
    demo_day: false,
    mentorship_model: "Theme-specific operators",
    curriculum_focus: ["Product differentiation", "Narrative", "Community"],
    founder_profile_fit: "Useful for companies at the intersection of software, culture, and frontier product experiences.",
    notable_alumni: ["Giphy", "Bitly", "Odeko"],
    portfolio_count: 200,
    ranking_score: 69,
    editorial_score: 73,
    display_geography_chips: ["USA", "Remote"],
    display_check_range: "Varies",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "Best for product-forward founders working on software that blends technology with new behavior, culture, or media patterns.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid"],
  },
  "outlier-ventures": {
    program_type: "Accelerator",
    organization_type: "Web3 accelerator",
    short_description: "Web3-focused accelerator with token design, ecosystem strategy, and investor support.",
    investment_thesis:
      "Support founders building credible web3 infrastructure, middleware, and consumer protocols with clear strategic positioning.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United Kingdom",
    hq_city: "London",
    hq_region: "Europe",
    operating_geographies: ["United Kingdom", "Europe", "Remote", "MENA"],
    program_format: "Remote",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["Web3", "Fintech", "Developer tools"],
    secondary_sectors: ["AI", "Gaming", "Infrastructure"],
    industry_tags: ["web3", "accelerator", "token design"],
    business_model_tags: ["protocols", "developer tools", "B2B"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: 100000,
    cash_investment_max: 250000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "SAFE / token allocation",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Token design support, ecosystem intros, and web3 fundraising help.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Multiple base camps",
    demo_day: true,
    mentorship_model: "Web3 specialists",
    curriculum_focus: ["Token design", "Ecosystem strategy", "Fundraising"],
    founder_profile_fit: "Relevant only when web3 is core to the product and go-to-market.",
    notable_alumni: ["ApeX", "Morpheus Labs", "Boson Protocol"],
    portfolio_count: 300,
    ranking_score: 67,
    editorial_score: 72,
    display_geography_chips: ["UK", "Europe", "Remote"],
    display_check_range: "$100k to $250k",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "Specialized support for web3-native startups where token design, protocol strategy, and ecosystem access are central.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Remote", "Rolling"],
  },
  rockstart: {
    program_type: "Accelerator",
    organization_type: "Seed fund accelerator",
    short_description: "European accelerator for energy, agrifood, and emerging tech startups.",
    investment_thesis:
      "Support founders tackling large, structural sectors where long-term company building matters more than fast gimmicks.",
    applications_open: true,
    application_deadline: "By program",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "Netherlands",
    hq_city: "Amsterdam",
    hq_region: "Europe",
    operating_geographies: ["Netherlands", "Europe", "Africa"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Europe", "Africa"],
    sector_agnostic: false,
    primary_sectors: ["Climate", "Agrifood", "AI"],
    secondary_sectors: ["Energy", "SaaS", "Mobility"],
    industry_tags: ["accelerator", "climate", "europe"],
    business_model_tags: ["B2B", "deeptech", "impact"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 135000,
    cash_investment_max: 250000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "SAFE",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Sector-specific support, investor network, and European expansion help.",
    program_duration_weeks: 16,
    cohort_based: true,
    next_cohort_date: "Annual tracks",
    demo_day: true,
    mentorship_model: "Sector specialists",
    curriculum_focus: ["Commercialization", "Impact", "Fundraising"],
    founder_profile_fit: "Strong for climate and industrial founders that need patient capital and vertical support.",
    notable_alumni: ["Pectcof", "Soly", "Qlayers"],
    portfolio_count: 350,
    ranking_score: 78,
    editorial_score: 80,
    display_geography_chips: ["Netherlands", "Europe", "Africa"],
    display_check_range: "$135k to $250k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "A more relevant fit for climate and industrial startups where sector expertise and European ecosystem access matter materially.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid"],
  },
  surge: {
    program_type: "Accelerator",
    organization_type: "Seed platform",
    short_description: "Peak XV's founder program for ambitious startups building out of India and Southeast Asia.",
    investment_thesis:
      "Back high-upside founders early and help them build category leadership across India and Southeast Asia.",
    applications_open: true,
    application_deadline: "By cohort",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "India",
    hq_city: "Bengaluru",
    hq_region: "APAC",
    operating_geographies: ["India", "Singapore", "Southeast Asia", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["India", "Southeast Asia"],
    sector_agnostic: true,
    primary_sectors: ["AI", "SaaS", "Commerce"],
    secondary_sectors: ["Fintech", "Healthtech", "Consumer"],
    industry_tags: ["accelerator", "india", "sea"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 1000000,
    cash_investment_max: 3000000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Peak XV network, founder peers, operator support, and regional investor access.",
    program_duration_weeks: 16,
    cohort_based: true,
    next_cohort_date: "Twice yearly",
    demo_day: true,
    mentorship_model: "Operator + investor team",
    curriculum_focus: ["Scale", "Hiring", "Fundraising"],
    founder_profile_fit: "Strong for India and SEA startups with big ambition and real velocity.",
    notable_alumni: ["Meesho", "Khatabook", "Jar"],
    portfolio_count: 400,
    ranking_score: 89,
    editorial_score: 91,
    display_geography_chips: ["India", "SEA", "Singapore"],
    display_check_range: "$1M to $3M",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Best for startups building from India or Southeast Asia that already show ambition, velocity, and a regional expansion story.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid"],
  },
  "india-accelerator": {
    program_type: "Accelerator",
    organization_type: "Startup accelerator",
    short_description: "Indian accelerator for founders looking for structure, investor readiness, and operator access.",
    investment_thesis:
      "Support Indian founders building venture-scale companies with clear momentum and coachability.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "India",
    hq_city: "Gurugram",
    hq_region: "APAC",
    operating_geographies: ["India"],
    program_format: "In-person",
    relocation_required: false,
    target_geographies: ["India"],
    sector_agnostic: true,
    primary_sectors: ["SaaS", "AI", "Commerce"],
    secondary_sectors: ["Fintech", "Climate", "Healthtech"],
    industry_tags: ["accelerator", "india", "seed"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Prototype", "Early Revenue"],
    minimum_stage: "Prototype",
    maximum_stage: "Early Revenue",
    cash_investment_min: 100000,
    cash_investment_max: 300000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Indian operator network, investor readiness support, and structured cohort guidance.",
    program_duration_weeks: 16,
    cohort_based: true,
    next_cohort_date: "Rolling cohorts",
    demo_day: true,
    mentorship_model: "Operator-led",
    curriculum_focus: ["Investor readiness", "Go-to-market", "Execution"],
    founder_profile_fit: "Useful for Indian founders who need a practical accelerator with local investor access.",
    notable_alumni: [],
    portfolio_count: null,
    ranking_score: 70,
    editorial_score: 73,
    display_geography_chips: ["India"],
    display_check_range: "$100k to $300k",
    display_stage_chips: ["Prototype", "Early Revenue"],
    display_thesis_snippet:
      "A pragmatic local fit for Indian founders who want operating structure, investor readiness, and regional context.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "In-person", "Rolling"],
  },
  jiogennext: {
    program_type: "Accelerator",
    organization_type: "Corporate program",
    short_description: "Reliance-backed startup program focused on scalable products with strategic commercial fit.",
    investment_thesis:
      "Support startups that can grow through strong distribution channels, strategic corporate leverage, and applied technology.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "India",
    hq_city: "Mumbai",
    hq_region: "APAC",
    operating_geographies: ["India"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["India"],
    sector_agnostic: false,
    primary_sectors: ["AI", "Retail", "Telecom"],
    secondary_sectors: ["Consumer", "Commerce", "Enterprise"],
    industry_tags: ["corporate accelerator", "india", "distribution"],
    business_model_tags: ["B2B", "B2C", "B2B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: null,
    cash_investment_max: 100000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Corporate access, market distribution, and structured India-focused founder support.",
    program_duration_weeks: 16,
    cohort_based: true,
    next_cohort_date: "Rolling",
    demo_day: true,
    mentorship_model: "Corporate + operator mentors",
    curriculum_focus: ["Distribution", "Product-market fit", "India scale"],
    founder_profile_fit: "Best when strategic distribution and corporate alignment can accelerate growth.",
    notable_alumni: [],
    portfolio_count: null,
    ranking_score: 69,
    editorial_score: 72,
    display_geography_chips: ["India"],
    display_check_range: "Up to $100k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "A stronger fit when corporate reach, distribution, and India-specific market access are tangible advantages.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  "100unicorns": {
    program_type: "Accelerator",
    organization_type: "VC fund",
    short_description: "India-focused founder platform with capital and startup acceleration support.",
    investment_thesis:
      "Back companies with strong early conviction and founders building large categories from India.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "India",
    hq_city: "Mumbai",
    hq_region: "APAC",
    operating_geographies: ["India", "UAE", "Singapore"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["India", "Global"],
    sector_agnostic: true,
    primary_sectors: ["SaaS", "AI", "Fintech"],
    secondary_sectors: ["Commerce", "Consumer", "Climate"],
    industry_tags: ["accelerator", "india", "venture fund"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 150000,
    cash_investment_max: 500000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Capital, founder support, and investor network with India-first context.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Rolling batches",
    demo_day: true,
    mentorship_model: "Investor + operator support",
    curriculum_focus: ["Capital readiness", "Scaling", "Founder support"],
    founder_profile_fit: "Useful for Indian founders who want local context plus flexible venture support.",
    notable_alumni: [],
    portfolio_count: null,
    ranking_score: 68,
    editorial_score: 71,
    display_geography_chips: ["India", "UAE", "Singapore"],
    display_check_range: "$150k to $500k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Designed for ambitious Indian founders who want early capital and a local network without losing global optionality.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  "axilor-ventures": {
    program_type: "Accelerator",
    organization_type: "Seed platform",
    short_description: "Startup accelerator and seed platform focused on execution support for Indian founders.",
    investment_thesis:
      "Work with founders who need structure, market access, and tactical help to turn early conviction into execution.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "India",
    hq_city: "Bengaluru",
    hq_region: "APAC",
    operating_geographies: ["India"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["India"],
    sector_agnostic: true,
    primary_sectors: ["SaaS", "AI", "Healthtech"],
    secondary_sectors: ["Fintech", "Commerce", "Climate"],
    industry_tags: ["accelerator", "india", "seed platform"],
    business_model_tags: ["B2B", "B2C"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: 50000,
    cash_investment_max: 150000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Execution support, mentor network, and investor readiness for Indian startups.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Rolling",
    demo_day: true,
    mentorship_model: "Operator-led",
    curriculum_focus: ["Execution", "GTM", "Fundraising"],
    founder_profile_fit: "Good for very early Indian teams that still need operating structure around the business.",
    notable_alumni: [],
    portfolio_count: null,
    ranking_score: 67,
    editorial_score: 70,
    display_geography_chips: ["India"],
    display_check_range: "$50k to $150k",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "A practical early-stage fit for Indian founders who need operating structure, mentorship, and investor readiness rather than a splashy brand.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  "t-hub": {
    program_type: "Accelerator",
    organization_type: "Innovation hub",
    short_description: "Large-scale startup hub with accelerator tracks, ecosystem access, and corporate partnerships.",
    investment_thesis:
      "Support startups that can use a large innovation ecosystem, corporate access, and public-private support to accelerate growth.",
    applications_open: true,
    application_deadline: "Varies by program",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "India",
    hq_city: "Hyderabad",
    hq_region: "APAC",
    operating_geographies: ["India", "Middle East", "Singapore"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["India", "Global"],
    sector_agnostic: true,
    primary_sectors: ["AI", "SaaS", "Healthtech"],
    secondary_sectors: ["Climate", "Agritech", "Mobility"],
    industry_tags: ["innovation hub", "india", "corporate access"],
    business_model_tags: ["B2B", "B2B2C", "B2C"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: 0,
    cash_investment_max: 100000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: 0,
    grant_amount_max: 100000,
    credits_value: null,
    perks_summary: "India ecosystem access, corporate innovation programs, and partner support.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Multiple tracks",
    demo_day: true,
    mentorship_model: "Program mentors + ecosystem partners",
    curriculum_focus: ["Scale", "Corporate pilots", "Founder support"],
    founder_profile_fit: "Strong when India ecosystem access and large partner networks are meaningful differentiators.",
    notable_alumni: [],
    portfolio_count: null,
    ranking_score: 72,
    editorial_score: 74,
    display_geography_chips: ["India", "MENA", "Singapore"],
    display_check_range: "Up to $100k",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "A broad ecosystem play for Indian founders who value corporate access, public-private support, and a large startup network.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  hax: {
    program_type: "Accelerator",
    organization_type: "Hardtech accelerator",
    short_description: "Hardware and hardtech accelerator focused on productization, manufacturing, and venture scale.",
    investment_thesis:
      "Invest in hardtech and frontier product founders who need specialized support around manufacturing and hardware execution.",
    applications_open: true,
    application_deadline: "Rolling",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "Newark",
    hq_region: "North America",
    operating_geographies: ["United States", "China", "Remote"],
    program_format: "Hybrid",
    relocation_required: true,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["Deeptech", "Climate", "Robotics"],
    secondary_sectors: ["Industrial", "Defense", "Hardware"],
    industry_tags: ["hardtech", "manufacturing", "accelerator"],
    business_model_tags: ["B2B", "deeptech"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: 250000,
    cash_investment_max: 500000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "SAFE",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Manufacturing support, hardware mentors, and deeptech capital network.",
    program_duration_weeks: 24,
    cohort_based: true,
    next_cohort_date: "Multiple annual batches",
    demo_day: true,
    mentorship_model: "Hardware specialists",
    curriculum_focus: ["Manufacturing", "Productization", "Fundraising"],
    founder_profile_fit: "Best for hardtech founders who need real productization and manufacturing help.",
    notable_alumni: ["Formlabs", "OpenROV", "Particle"],
    portfolio_count: 250,
    ranking_score: 82,
    editorial_score: 85,
    display_geography_chips: ["USA", "China", "Remote"],
    display_check_range: "$250k to $500k",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "Specialized support for hardtech companies where manufacturing, productization, and deep technical execution are the real bottlenecks.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  indiebio: {
    program_type: "Accelerator",
    organization_type: "Biotech accelerator",
    short_description: "Biotech accelerator with lab access, founder support, and specialized capital.",
    investment_thesis:
      "Back biotech founders translating scientific breakthroughs into venture-backed products and platforms.",
    applications_open: true,
    application_deadline: "By cohort",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "San Francisco",
    hq_region: "North America",
    operating_geographies: ["United States", "Europe"],
    program_format: "In-person",
    relocation_required: true,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["Biotech", "Healthcare", "Climate"],
    secondary_sectors: ["Foodtech", "Synthetic biology", "Deeptech"],
    industry_tags: ["biotech", "labs", "accelerator"],
    business_model_tags: ["B2B", "R&D-heavy"],
    stages_supported: ["Idea or Patent", "Prototype", "Early Revenue"],
    minimum_stage: "Idea or Patent",
    maximum_stage: "Early Revenue",
    cash_investment_min: 275000,
    cash_investment_max: 525000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "SAFE",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Lab access, biotech mentors, and specialized fundraising support.",
    program_duration_weeks: 16,
    cohort_based: true,
    next_cohort_date: "Twice yearly",
    demo_day: true,
    mentorship_model: "Scientific + investor mentors",
    curriculum_focus: ["Scientific commercialization", "Regulatory planning", "Fundraising"],
    founder_profile_fit: "Strong for biotech founders who need lab access, scientific mentors, and patient capital.",
    notable_alumni: ["Memphis Meats", "Ginkgo Bioworks", "Upside Foods"],
    portfolio_count: 300,
    ranking_score: 84,
    editorial_score: 86,
    display_geography_chips: ["USA", "Europe"],
    display_check_range: "$275k to $525k",
    display_stage_chips: ["Idea or Patent", "Prototype", "Early Revenue"],
    display_thesis_snippet:
      "A specialist fit for biotech founders where lab access, scientific credibility, and patient early capital change the execution path.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "In-person"],
  },
  tenity: {
    program_type: "Accelerator",
    organization_type: "Fintech accelerator",
    short_description: "Global innovation ecosystem for fintech and insurtech startups.",
    investment_thesis:
      "Support fintech startups that benefit from regulated-market expertise, partner introductions, and focused operator support.",
    applications_open: true,
    application_deadline: "Varies by program",
    rolling_applications: true,
    program_status: "Active",
    hq_country: "Switzerland",
    hq_city: "Zurich",
    hq_region: "Europe",
    operating_geographies: ["Switzerland", "Singapore", "Nordics", "MENA"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Europe", "APAC", "MENA"],
    sector_agnostic: false,
    primary_sectors: ["Fintech", "Insurtech", "Web3"],
    secondary_sectors: ["AI", "Cybersecurity", "Climate fintech"],
    industry_tags: ["fintech", "accelerator", "regulated markets"],
    business_model_tags: ["B2B", "B2B2C"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: 50000,
    cash_investment_max: 150000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Fintech-focused mentors, regulated-market access, and partner distribution.",
    program_duration_weeks: 12,
    cohort_based: true,
    next_cohort_date: "Multiple regional cohorts",
    demo_day: true,
    mentorship_model: "Industry specialists",
    curriculum_focus: ["Partnerships", "Compliance", "Fundraising"],
    founder_profile_fit: "Best for fintech and insurtech startups that need vertical expertise and partner networks.",
    notable_alumni: ["Pemo", "Relio", "Imburse"],
    portfolio_count: 300,
    ranking_score: 76,
    editorial_score: 79,
    display_geography_chips: ["Switzerland", "Singapore", "MENA"],
    display_check_range: "$50k to $150k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "Useful when fintech or regulated-market knowledge and partner access are more valuable than a generalist accelerator brand.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid", "Rolling"],
  },
  "endless-frontier-labs": {
    program_type: "Accelerator",
    organization_type: "University-backed accelerator",
    short_description: "NYU-backed program connecting deeptech startups with corporate mentors and investors.",
    investment_thesis:
      "Support science- and technology-heavy startups with the relationships and discipline needed to commercialize.",
    applications_open: true,
    application_deadline: "Annual cohort",
    rolling_applications: false,
    program_status: "Active",
    hq_country: "United States",
    hq_city: "New York",
    hq_region: "North America",
    operating_geographies: ["United States", "Europe", "Remote"],
    program_format: "Hybrid",
    relocation_required: false,
    target_geographies: ["Global"],
    sector_agnostic: false,
    primary_sectors: ["AI", "Deeptech", "Climate"],
    secondary_sectors: ["Robotics", "Healthcare", "Fintech"],
    industry_tags: ["deeptech", "university", "commercialization"],
    business_model_tags: ["B2B", "deeptech"],
    stages_supported: ["Prototype", "Early Revenue", "Scaling"],
    minimum_stage: "Prototype",
    maximum_stage: "Scaling",
    cash_investment_min: null,
    cash_investment_max: 500000,
    currency: "USD",
    equity_min_pct: null,
    equity_max_pct: null,
    equity_type: "Varies",
    equity_free: false,
    follow_on_available: true,
    grant_amount_min: null,
    grant_amount_max: null,
    credits_value: null,
    perks_summary: "Corporate mentor network, deeptech commercialization support, and NYU ecosystem access.",
    program_duration_weeks: 16,
    cohort_based: true,
    next_cohort_date: "Annual",
    demo_day: true,
    mentorship_model: "Corporate + investor mentors",
    curriculum_focus: ["Commercialization", "Enterprise access", "Fundraising"],
    founder_profile_fit: "Strong for deeptech teams that need corporate mentor access and commercialization help.",
    notable_alumni: ["Trustmi", "Aquant", "Harmonic Discovery"],
    portfolio_count: 250,
    ranking_score: 77,
    editorial_score: 81,
    display_geography_chips: ["USA", "Europe", "Remote"],
    display_check_range: "Up to $500k",
    display_stage_chips: ["Prototype", "Early Revenue", "Scaling"],
    display_thesis_snippet:
      "A solid fit for deeptech founders who need commercialization discipline, enterprise access, and a research-adjacent network.",
    display_primary_cta: "Apply",
    display_secondary_cta: "View profile",
    display_badges: ["Open", "Hybrid"],
  },
};

const fallbackMeta: Omit<
  StartupProgramMeta,
  | "program_type"
  | "organization_type"
  | "short_description"
  | "investment_thesis"
  | "hq_country"
  | "hq_city"
  | "hq_region"
  | "operating_geographies"
  | "target_geographies"
  | "primary_sectors"
  | "secondary_sectors"
  | "industry_tags"
  | "business_model_tags"
  | "stages_supported"
  | "minimum_stage"
  | "maximum_stage"
  | "mentorship_model"
  | "curriculum_focus"
  | "founder_profile_fit"
  | "display_geography_chips"
  | "display_stage_chips"
  | "display_thesis_snippet"
  | "display_primary_cta"
  | "display_secondary_cta"
  | "display_badges"
> = {
  applications_open: true,
  application_deadline: "Rolling",
  rolling_applications: true,
  program_status: "Active",
  program_format: "Hybrid",
  relocation_required: false,
  sector_agnostic: true,
  cash_investment_min: null,
  cash_investment_max: null,
  currency: "USD",
  equity_min_pct: null,
  equity_max_pct: null,
  equity_type: null,
  equity_free: false,
  follow_on_available: false,
  grant_amount_min: null,
  grant_amount_max: null,
  credits_value: null,
  perks_summary: "Mentor sessions, community, and operator support.",
  program_duration_weeks: 12,
  cohort_based: true,
  next_cohort_date: null,
  demo_day: true,
  notable_alumni: [],
  portfolio_count: null,
  ranking_score: 65,
  editorial_score: 65,
  display_check_range: "Varies",
};

export const startupPrograms: StartupProgram[] = startupProgramSeed.map((program) => {
  const slug = slugify(program.name);
  const meta = startupProgramMeta[slug];

  if (!meta) {
    throw new Error(`Missing startup program metadata for ${program.name}`);
  }

  return {
    id: slug,
    name: program.name,
    slug,
    workflow_slug: getWorkflowSlug(slug),
    website_url: program.website_url,
    apply_url: program.apply_url || program.website_url,
    profile_url: program.website_url,
    logo_url: program.logo_url,
    favicon_url: `${getOrigin(program.website_url)}/favicon.ico`,
    source_url: program.source_url,
    ...fallbackMeta,
    ...meta,
    investment_thesis: meta.investment_thesis || DEFAULT_THESIS,
    display_check_range: buildCheckRange(meta),
    display_primary_cta: "Apply",
    display_secondary_cta: "Draft application",
    display_badges: meta.display_badges.length ? meta.display_badges : buildBadges(meta),
  };
});

const sectorSuggestions: StartupProgramSuggestion[] = [
  {
    id: "sector-fintech",
    type: "Sectors",
    label: "fintech",
    query: "fintech",
    helperText: "Includes: payments, banking, lending, insurance, compliance",
    appliedFilters: { sector: "Fintech" },
  },
  {
    id: "sector-saas",
    type: "Sectors",
    label: "SaaS",
    query: "SaaS",
    helperText: "Includes: B2B SaaS, workflow software, developer tools, infrastructure",
    appliedFilters: { sector: "SaaS" },
  },
  {
    id: "sector-commerce",
    type: "Sectors",
    label: "future of commerce",
    query: "future of commerce",
    helperText: "Includes: future of commerce, e-commerce, D2C, retail, CPG, brands",
    appliedFilters: { sector: "Future of commerce" },
  },
  {
    id: "sector-ai",
    type: "Sectors",
    label: "AI",
    query: "AI",
    helperText: "Includes: AI, genAI, ML, computer vision, big data, LLM, agents",
    appliedFilters: { sector: "AI" },
  },
  {
    id: "sector-b2c",
    type: "Sectors",
    label: "B2C",
    query: "B2C",
    helperText: "Includes: B2C, consumer, prosumer, B2B2C",
  },
  {
    id: "sector-web3",
    type: "Sectors",
    label: "web3",
    query: "web3",
    helperText: "Includes: crypto, web3, token networks, onchain tooling",
    appliedFilters: { sector: "Web3" },
  },
  {
    id: "sector-climate",
    type: "Sectors",
    label: "climate",
    query: "climate",
    helperText: "Includes: energy, climate, carbon, industrial decarbonization",
    appliedFilters: { sector: "Climate" },
  },
  {
    id: "sector-biotech",
    type: "Sectors",
    label: "biotech",
    query: "biotech",
    helperText: "Includes: biotech, synthetic biology, therapeutics, diagnostics",
    appliedFilters: { sector: "Biotech" },
  },
];

const tagSuggestions: StartupProgramSuggestion[] = [
  {
    id: "tag-india",
    type: "Tags / themes",
    label: "accelerators in India",
    query: "accelerators in India",
    helperText: "Includes: Surge, India Accelerator, Axilor, T-Hub, JioGenNext",
    appliedFilters: { q: "accelerator", geography: "India", programType: "Accelerator" },
  },
  {
    id: "tag-equity-free",
    type: "Tags / themes",
    label: "equity-free programs",
    query: "equity-free programs",
    helperText: "Includes: MassChallenge, Startup Chile, Google for Startups, StartX",
    appliedFilters: { q: "equity-free", equityFree: "true" },
  },
  {
    id: "tag-remote",
    type: "Tags / themes",
    label: "remote-first programs",
    query: "remote-first programs",
    helperText: "Includes: EWOR, Forum Ventures, Outlier Ventures, NFX",
    appliedFilters: { q: "remote", format: "Remote" },
  },
  {
    id: "tag-deeptech",
    type: "Tags / themes",
    label: "deeptech accelerators",
    query: "deeptech accelerators",
    helperText: "Includes: HAX, IndieBio, CDL, Endless Frontier Labs",
    appliedFilters: { q: "deeptech", sector: "Deeptech", programType: "Accelerator" },
  },
];

const startupProgramSearchAliases: Record<string, string[]> = {
  "plug-and-play": ["Plug and Play Tech Center"],
  era: ["ERA (Entrepreneurs Roundtable Accelerator)", "Entrepreneurs Roundtable Accelerator"],
  muckerlab: ["MuckerLab (Mucker Capital / MuckerLab)", "Mucker Capital"],
  surge: ["Surge (Sequoia / SurgeAhead)", "Sequoia Surge", "SurgeAhead"],
  indiebio: ["IndieBio (SOSV)"],
  hax: ["HAX (SOSV)"],
  tenity: ["Tenity (formerly F10)", "F10"],
  "a16z-speedrun": ["Andreessen Horowitz Speedrun"],
};

const startupProgramSuggestionLabels: Record<string, string> = {
  "plug-and-play": "Plug and Play Tech Center",
  era: "ERA (Entrepreneurs Roundtable Accelerator)",
  muckerlab: "MuckerLab (Mucker Capital / MuckerLab)",
  surge: "Surge (Sequoia / SurgeAhead)",
  indiebio: "IndieBio (SOSV)",
  hax: "HAX (SOSV)",
  tenity: "Tenity (formerly F10)",
};

function getStartupProgramAliases(program: Pick<StartupProgram, "slug">) {
  return startupProgramSearchAliases[program.slug] ?? [];
}

const programSuggestions: StartupProgramSuggestion[] = startupPrograms.map((program) => ({
  id: `program-${program.slug}`,
  type: "Program names",
  label: startupProgramSuggestionLabels[program.slug] ?? program.name,
  query: startupProgramSuggestionLabels[program.slug] ?? program.name,
  helperText: [
    `${program.program_type} · ${program.hq_country}`,
    ...getStartupProgramAliases(program),
  ].join(" · "),
}));

const allSuggestions = [...sectorSuggestions, ...programSuggestions, ...tagSuggestions];

export const startupProgramsFilterOptions = {
  geography: ["All geographies", "India", "United States", "Europe", "Singapore", "Remote", "Latin America"],
  stage: ["All stages", "Idea or Patent", "Prototype", "Early Revenue", "Scaling"],
  checkSize: [
    "All checks",
    "Under $100k",
    "$100k to $500k",
    "$500k+",
    "Equity-free / grants",
    "Varies",
  ],
  sector: [
    "All sectors",
    "AI",
    "SaaS",
    "Fintech",
    "Future of commerce",
    "Climate",
    "Biotech",
    "Web3",
    "Proptech",
    "Deeptech",
  ],
  programType: [
    "All program types",
    "Accelerator",
    "Incubator",
    "Fellowship",
    "Venture Studio",
    "Program",
  ],
  equityFree: ["All equity models", "Equity-free only"],
  applicationsOpen: ["All application states", "Applications open"],
  format: ["All formats", "Remote", "Hybrid", "In-person"],
} as const;

export const defaultStartupProgramFilters: StartupProgramFilters = {
  q: "",
  geography: "",
  stage: "",
  checkSize: "",
  sector: "",
  programType: "",
  equityFree: "",
  applicationsOpen: "",
  format: "",
};

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase();
}

function stemToken(token: string) {
  if (token.endsWith("ies") && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }

  if (token.endsWith("s") && token.length > 4) {
    return token.slice(0, -1);
  }

  return token;
}

function tokenize(value: string) {
  return Array.from(
    new Set(
      normalize(value)
        .split(" ")
        .filter((token) => token && !QUERY_STOP_WORDS.has(token))
        .map(stemToken),
    ),
  );
}

const QUERY_ALIASES: Record<string, string[]> = {
  "future of commerce": ["ecommerce", "retail", "d2c", "brand", "commerce"],
  "equity free": ["grant", "credit", "equityfree"],
  "equity-free": ["grant", "credit", "equityfree"],
  "remote first": ["remote"],
  "remote-first": ["remote"],
  "accelerators in india": ["accelerator", "india"],
  "deeptech accelerators": ["deeptech", "accelerator"],
};
const QUERY_STOP_WORDS = new Set(["and", "for", "in", "of", "the", "to"]);

function getExpandedQueryTokens(value: string) {
  const normalized = normalize(value);
  const tokens = [...tokenize(value)];

  for (const [phrase, aliases] of Object.entries(QUERY_ALIASES)) {
    if (!normalized.includes(phrase)) {
      continue;
    }

    for (const alias of aliases) {
      tokens.push(...tokenize(alias));
    }
  }

  return Array.from(new Set(tokens));
}

function getSearchDocument(program: StartupProgram) {
  return [
    program.name,
    ...getStartupProgramAliases(program),
    program.program_type,
    program.organization_type,
    program.short_description,
    program.investment_thesis,
    program.hq_country,
    program.hq_city,
    program.hq_region,
    program.operating_geographies.join(" "),
    program.target_geographies.join(" "),
    program.primary_sectors.join(" "),
    program.secondary_sectors.join(" "),
    program.industry_tags.join(" "),
    program.business_model_tags.join(" "),
    program.stages_supported.join(" "),
    program.founder_profile_fit,
    program.notable_alumni.join(" "),
    program.perks_summary,
    program.display_thesis_snippet,
    program.display_badges.join(" "),
  ]
    .join(" ");
}

const startupProgramSearchIndex = new Map(
  startupPrograms.map((program) => {
    const document = getSearchDocument(program);
    return [
      program.slug,
      {
        document: normalize(document),
        tokens: new Set(tokenize(document)),
        name: normalize(program.name),
      },
    ] as const;
  }),
);

function getCheckBucket(program: StartupProgram) {
  if (program.equity_free) return "Equity-free / grants";

  const max =
    program.cash_investment_max ?? program.grant_amount_max ?? program.credits_value ?? null;

  if (max == null) return "Varies";
  if (max < 100000) return "Under $100k";
  if (max <= 500000) return "$100k to $500k";
  return "$500k+";
}

function scoreProgram(program: StartupProgram, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return program.ranking_score * 10 + program.editorial_score;
  }

  const indexedProgram = startupProgramSearchIndex.get(program.slug);
  const queryTokens = getExpandedQueryTokens(query);
  let score = program.ranking_score * 10 + program.editorial_score;

  if (indexedProgram?.name.includes(normalizedQuery)) {
    score += 150;
  }

  if (indexedProgram?.document.includes(normalizedQuery)) {
    score += 40;
  }

  for (const token of queryTokens) {
    if (!indexedProgram) {
      continue;
    }

    if (indexedProgram.tokens.has(token)) {
      score += 24;
    } else if (indexedProgram.document.includes(token)) {
      score += 10;
    }
  }

  return score;
}

export function filterStartupPrograms(filters: StartupProgramFilters) {
  const query = normalize(filters.q);
  const queryTokens = getExpandedQueryTokens(filters.q);

  return startupPrograms
    .filter((program) => {
      const indexedProgram = startupProgramSearchIndex.get(program.slug);
      const document = indexedProgram?.document ?? "";
      const matchedTokenCount = queryTokens.filter(
        (token) =>
          indexedProgram?.tokens.has(token) ||
          document.includes(token),
      ).length;

      if (query && !document.includes(query) && matchedTokenCount === 0) {
        return false;
      }

      if (filters.geography) {
        const geography = normalizeFilterValue(filters.geography);
        const geographyFields = [
          program.hq_country,
          program.hq_city,
          program.hq_region,
          ...program.operating_geographies,
          ...program.target_geographies,
          ...program.display_geography_chips,
        ]
          .join(" ")
          .toLowerCase();

        if (!geographyFields.includes(geography)) return false;
      }

      if (filters.stage && !program.stages_supported.includes(filters.stage as StartupProgramStage)) {
        return false;
      }

      if (filters.checkSize && getCheckBucket(program) !== filters.checkSize) {
        return false;
      }

      if (filters.sector) {
        const sector = normalizeFilterValue(filters.sector);
        const sectorFields = [
          ...program.primary_sectors,
          ...program.secondary_sectors,
          ...program.industry_tags,
          ...program.business_model_tags,
        ]
          .join(" ")
          .toLowerCase();

        if (!sectorFields.includes(sector)) return false;
      }

      if (
        filters.programType &&
        normalizeFilterValue(program.program_type) !== normalizeFilterValue(filters.programType)
      ) {
        return false;
      }

      if (filters.equityFree === "true" && !program.equity_free) {
        return false;
      }

      if (filters.applicationsOpen === "true" && !program.applications_open) {
        return false;
      }

      if (filters.format && normalizeFilterValue(program.program_format) !== normalizeFilterValue(filters.format)) {
        return false;
      }

      return true;
    })
    .sort((left, right) => scoreProgram(right, filters.q) - scoreProgram(left, filters.q));
}

export function getStartupProgramSuggestions(query: string) {
  const normalized = normalize(query);

  const filtered = normalized
    ? allSuggestions.filter((suggestion) => {
        const helper = normalize(suggestion.helperText ?? "");
        return (
          normalize(suggestion.label).includes(normalized) ||
          normalize(suggestion.query).includes(normalized) ||
          helper.includes(normalized)
        );
      })
    : allSuggestions;

  const groups: StartupProgramSuggestion["type"][] = ["Sectors", "Program names", "Tags / themes"];

  return groups
    .map((group) => ({
      type: group,
      items: filtered
        .filter((item) => item.type === group)
        .slice(0, group === "Program names" ? Number.MAX_SAFE_INTEGER : 4),
    }))
    .filter((group) => group.items.length > 0);
}

export function buildStartupProgramSearchHref(
  filters: StartupProgramFilters,
  basePath = "/search",
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function buildStartupProgramFiltersFromParams(searchParams: URLSearchParams): StartupProgramFilters {
  return {
    q: searchParams.get("q") ?? "",
    geography: searchParams.get("geography") ?? "",
    stage: searchParams.get("stage") ?? "",
    checkSize: searchParams.get("checkSize") ?? "",
    sector: searchParams.get("sector") ?? "",
    programType: searchParams.get("programType") ?? "",
    equityFree: searchParams.get("equityFree") ?? "",
    applicationsOpen: searchParams.get("applicationsOpen") ?? "",
    format: searchParams.get("format") ?? "",
  };
}

export function getStartupProgramBySlug(slug: string) {
  return startupPrograms.find((program) => program.slug === slug) ?? null;
}

export function getStartupProgramByWorkflowSlug(workflowSlug: string) {
  return startupPrograms.find((program) => program.workflow_slug === workflowSlug) ?? null;
}
