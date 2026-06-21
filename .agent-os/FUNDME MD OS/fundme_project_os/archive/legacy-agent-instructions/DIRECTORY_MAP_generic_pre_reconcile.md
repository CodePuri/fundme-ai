# Directory Map

A comprehensive mapping of where specific domains live within the `Fundme` repository.

```text
Fundme/
├── .agent-os/                 # Dedicated Project Knowledge System for AI Agents
├── app/                       # Next.js App Router root
│   ├── api/                   # Backend Route Handlers
│   ├── app/                   # Authenticated application dashboard routes
│   ├── onboarding/            # Unauthenticated public early-access flow
│   ├── ...                    
├── components/                # React Components
│   ├── app/                   # Dashboard specific components
│   ├── ui/                    # Reusable, standard UI components
│   └── startup-programs/      # Directory/explore components
├── docs/                      # Centralized historical reference and audits
│   ├── archive/               # Legacy markdown references and protocols
│   ├── audits/                # Automated audits (Lighthouse, screenshots)
│   └── ...
├── infrastructure/            # Operations
│   ├── db-scripts/            # Supabase SQL commands
│   └── env-archive/           # Retired/preview `.env` files
├── lib/                       # Utility functions, hooks, shared domain logic
├── public/                    # Static assets
└── tests-acceptance/          # Acceptance tests
```
