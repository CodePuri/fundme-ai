# Directory Map

> Last updated: 2026-06-21
> Repository root: `/Users/totem/Desktop/Projects/Fundme`
> Git root: `/Users/totem/Desktop/Projects/Fundme`

```text
Fundme/
├── .agent-os/                            # Agent Operating System
│   ├── PROJECT_OVERVIEW.md               # Repository-level overview (index)
│   ├── ARCHITECTURE.md                   # Repository-level architecture summary
│   ├── DIRECTORY_MAP.md                  # This file
│   ├── AGENT_RULES.md                    # Repository-level agent rules
│   ├── DEVELOPMENT_GUIDELINES.md         # Dev workflow and tooling
│   ├── ENVIRONMENT_REFERENCE.md          # Environment variable reference
│   ├── DECISION_LOG.md                   # Repository-level decision log
│   └── FUNDME MD OS/                     # Fundme Product Operating System
│       ├── fundme_project_os/            # ← CANONICAL PRODUCT TRUTH
│       │   ├── FUNDME_PROJECT_OS.md      # Product operating system
│       │   ├── PROJECT_STATE.md          # Current verified state
│       │   ├── MASTER_PRD.md             # Product requirements
│       │   ├── TECHNICAL_ARCHITECTURE.md # Technical architecture
│       │   ├── DATA_AI_MATCHING_SPEC.md  # Data, AI, matching spec
│       │   ├── DELIVERY_ROADMAP.md       # Phased delivery plan
│       │   ├── PHASE_01_BUILD_CONTRACT.md# Current phase contract
│       │   ├── DECISIONS.md              # Active decisions
│       │   ├── AGENTS.md                 # Universal agent contract
│       │   ├── ANTIGRAVITY.md            # Antigravity adapter
│       │   ├── CODEX.md                  # Codex adapter
│       │   ├── CHATGPT_ORCHESTRATOR.md   # ChatGPT adapter
│       │   ├── PRODUCT_CHARTER.md        # Product charter
│       │   ├── USER_FLOWS_UX.md          # User flows and UX
│       │   ├── OPPORTUNITY_DATA_SEO_AEO.md
│       │   ├── ANALYTICS_GROWTH_VIRALITY.md
│       │   ├── DESIGN_CONTENT_SYSTEM.md
│       │   ├── SECURITY_PRIVACY_OPERATIONS.md
│       │   ├── QUALITY_RELEASE_PLAYBOOK.md
│       │   ├── SOURCES_AND_ASSUMPTIONS.md
│       │   ├── HANDOFF_TEMPLATE.md
│       │   ├── PHASE_CONTRACT_TEMPLATE.md
│       │   └── archive/                  # Superseded documents
│       └── fundme_repo_install/          # Original install bundle (reference only)
│
├── AGENTS.md                             # Root agent entry point (thin adapter)
├── ANTIGRAVITY.md                        # Antigravity agent adapter
├── CODEX.md                              # Codex agent adapter
├── CHATGPT_ORCHESTRATOR.md               # ChatGPT orchestrator adapter
├── REVIEWER.md                           # Reviewer role adapter
│
├── app/                                  # Next.js App Router
│   ├── api/                              # Backend Route Handlers
│   │   ├── onboarding/route.ts           # Supabase onboarding persistence
│   │   ├── roast/route.ts                # Legacy AI critique endpoint
│   │   └── env/route.ts                  # Debug env endpoint
│   ├── app/                              # Authenticated dashboard routes
│   │   ├── applications/
│   │   ├── founder-profile/
│   │   ├── matches/
│   │   ├── programs/
│   │   ├── settings/
│   │   ├── startup-profile/
│   │   ├── tracker/
│   │   ├── upload/
│   │   └── workspace/[slug]/
│   ├── assessment/                       # Assessment flow (client-side demo)
│   ├── explore/                          # Public opportunity browsing
│   ├── onboarding/                       # Public onboarding flow
│   ├── search/                           # Public search
│   ├── sign-in/, sign-up/               # Clerk auth routes
│   ├── startup-programs/                 # Program directory
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Homepage
│   ├── robots.ts                         # Dynamic robots.txt
│   └── sitemap.ts                        # Dynamic sitemap
│
├── components/                           # React components
│   ├── app/                              # Dashboard components + DemoProvider
│   ├── assessment/                       # Assessment components + provider
│   ├── public/                           # Public page components
│   ├── startup-programs/                 # Program directory components
│   └── ui/                              # Reusable UI primitives
│
├── lib/                                  # Shared utilities and data
│   ├── demo-data.ts                      # Demo/mock state data
│   ├── startup-programs.ts               # Curated program dataset
│   ├── supabase.ts                       # Supabase client
│   └── utils.ts                          # General utilities
│
├── public/                               # Static assets
├── infrastructure/                       # Operations
│   ├── db-scripts/                       # SQL migration scripts
│   └── env-archive/                      # Retired .env configurations
├── docs/                                 # Documentation
│   └── archive/                          # Legacy documentation
├── tests-acceptance/                     # Acceptance test artifacts
├── videos/                               # Video assets
│
├── package.json                          # Project manifest
├── pnpm-lock.yaml                        # Lock file
├── tsconfig.json                         # TypeScript config
├── next.config.ts                        # Next.js config
├── proxy.ts                              # Next.js 16 middleware
├── eslint.config.mjs                     # ESLint config
└── .gitignore                            # Git exclusions
```
