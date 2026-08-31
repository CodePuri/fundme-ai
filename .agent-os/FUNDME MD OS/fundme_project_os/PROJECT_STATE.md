# FundMe Project State

Status: LIVE IN PRODUCTION (https://tryfundme.in); Canonical Release Baseline Verified End-to-End
Last verified: 2026-08-31 Asia/Kolkata
Evidence root: `/Users/totem/Desktop/Code/Fundme-archive/verification/20260831_014000`

## Verified Baselines

### Production Environment (LIVE)
| Item | Verified value |
|---|---|
| Production Domain | `https://tryfundme.in` (HTTP/2 200, Vercel Anycast) |
| Production Branch | `main` |
| Production Release SHA | `c465064` |
| Rollback Tag | `rollback/pre-conversion-loop-v1-34d4213` |
| Production Database | Dedicated Supabase project `wduygrhtijvaevcwptnr` (`Fund Me AI`, region `ap-south-1`) |
| Production Auth | Dedicated Clerk Production instance `ins_3IeGsTifITbBh9PcCyg8WUhz9YE` (`pk_live_Y2xlcmsudHJ5ZnVuZG1lLmluJA`) |
| Google OAuth | Live FundMe-owned Web Application Client (`986859817529-pg96k43a7ellud13opeerkjd82n4ho3m.apps.googleusercontent.com`) |
| Production FAPI | `https://clerk.tryfundme.in/v1/environment` (HTTP 200, SSL valid) |
| Calibrated Rubric | `fundme-rubric@2026.08-calibrated-v1` (Deterministic, versioned, historical-safe) |
| AI Synthesis Engine | Server-side `groq` provider (`openai/gpt-oss-120b`), deterministic score preservation |
| SEO Baseline | Production `robots.txt`, `sitemap.xml`, OpenGraph, Twitter, Schema.org WebApplication |
| Automated Tests | 71/71 tests passing (62 assessment tests + 9 security/BOLA/IDOR tests) |
| Browser E2E Status | 100% PASS (Full live customer journey: landing -> assessment -> AI diagnosis -> Google OAuth sign-in -> Production DB write -> public share -> signed-out sanitized view) |

### Staging Environment Baseline (Isolated Pre-Production)
| Item | Verified value |
|---|---|
| Staging Domain | `https://staging.tryfundme.in` (Vercel Git-branch mapped to `staging`) |
| Staging Branch | `staging` |
| Staging SHA | `c465064` |
| Staging Database | Dedicated Supabase project `nnzdplkjizwgsalizijd` (`Fund Me AI Staging`, region `ap-south-1`) |
| Staging Auth | Scoped Clerk test instance (`pk_test_...`) with Development mode badge |
| SEO Isolation | `X-Robots-Tag: noindex, nofollow` enforced on all requests |

## Canonical Workspace Layout

```
/Users/totem/Desktop/Code/
├── Fundme/                                      # Canonical repository (main @ a878b09)
├── Fundme-worktrees/
│   ├── Fundme-Product-V1/                       # Active feature worktree (product/v1-grill)
│   └── Fundme-Staging/                          # Active staging worktree (staging @ cc05577)
└── Fundme-archive/                              # Verification evidence, historical bundles & docs
```

## Release Pipeline Model

1. **Feature Development**: Work on `product/v1-grill` or `feature/*` branches in dedicated worktrees.
2. **Staging Integration**: Merge into `staging` branch -> automatic build & deploy to Staging (`staging.tryfundme.in`).
3. **Browser Acceptance**: Complete E2E customer journey verification on staging environment.
4. **Production Promotion**: Fast-forward/merge `staging` into `main` -> automatic deployment to `https://tryfundme.in`.
