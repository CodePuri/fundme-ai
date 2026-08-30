# FundMe Project State

Status: Production Readiness Hardened on Staging (https://staging.tryfundme.in); All P0 Security & Isolation Defenses Verified
Last verified: 2026-08-31 Asia/Kolkata
Evidence root: `/Users/totem/Desktop/Code/Fundme-archive/verification/20260831_003800`

## Verified Baselines

### Production Baseline (Untouched)
| Item | Verified value |
|---|---|
| Production Domain | `https://tryfundme.in` (HTTP 200) |
| Production Branch | `main` |
| Production SHA | `10409284c56f2b5dea968b9e4b727d420b96aaeb` |
| Release Tag | `release-live-tryfundme-v1` / `fundme-homepage-baseline-optimized-1040928` |
| Database | Production Supabase (`wduygrhtijvaevcwptnr`) |
| Auth | Production Clerk instance |

### Staging Environment Baseline (Hardened & Verified)
| Item | Verified value |
|---|---|
| Staging Domain | `https://staging.tryfundme.in` (Vercel Git-branch mapped to `staging`) |
| Staging Branch | `staging` |
| Staging SHA | `4a1d754` |
| Live Vercel Deployment | `https://fundme-r965dv2wb-aakash-s-projects-bf7b5a5e.vercel.app` |
| Staging Database | Dedicated Supabase project `nnzdplkjizwgsalizijd` (`Fund Me AI Staging`, region `ap-south-1`) |
| Database Security | Privileges revoked from `anon`/`public`. Encapsulated `SECURITY DEFINER` RPCs with server secret & Clerk `auth()` verification. Zero bypass policies. |
| Staging Auth | Scoped Clerk test instance (`pk_test_...`) with server-side authoritative `userId` resolution. |
| AI Synthesis Engine | Server-side `groq` provider (`openai/gpt-oss-120b`), 4.2s latency, deterministic score invariance |
| Analytics & Email | Dedicated PostHog project with strict session recording privacy masking, lightweight GA4 funnel tracking, Resend email on `mail.tryfundme.in` |
| Automated Tests | 70/70 tests passing (61 assessment tests + 9 security/BOLA/IDOR/isolation tests) |
| Browser E2E Status | 100% PASS (Full in-browser flow: assessment -> AI diagnosis -> Clerk auth -> save -> restore -> owner share -> signed-out public share view -> referral attribution) |

## Canonical Workspace Layout

```
/Users/totem/Desktop/Code/
├── Fundme/                                      # Canonical repository (main @ 1040928)
├── Fundme-worktrees/
│   ├── Fundme-Product-V1/                       # Active feature worktree (product/v1-grill)
│   └── Fundme-Staging/                          # Active staging worktree (staging @ 4a1d754)
└── Fundme-archive/                              # Verification evidence, historical bundles & docs
```

## Release Pipeline Model

1. **Feature Development**: Work on `product/v1-grill` or `feature/*` branches in dedicated worktrees.
2. **Staging Integration**: Merge into `staging` branch -> automatic build & deploy to Staging (`staging.tryfundme.in`).
3. **Browser Acceptance**: Complete E2E customer journey verification on staging environment.
4. **Production Promotion**: Controlled PR/merge from `staging` into `main` -> automatic deployment to `https://tryfundme.in`.
