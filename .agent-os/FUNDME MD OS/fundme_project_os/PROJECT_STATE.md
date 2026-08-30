# FundMe Project State

Status: Staging environment verified end-to-end; pre-production pipeline established and isolated from Production
Last verified: 2026-08-30 Asia/Kolkata
Evidence root: `/Users/totem/Desktop/Code/Fundme-archive/verification/20260830_213925`

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

### Staging Environment Baseline (Verified)
| Item | Verified value |
|---|---|
| Staging Domain | `https://staging.tryfundme.in` (Vercel Git-branch mapped to `staging`) |
| Staging Branch | `staging` |
| Staging SHA | `39ce3239a5015da7b57d605658e4549f3ff2db3a` |
| Live Vercel Deployment | `https://fundme-c8piu4o20-aakash-s-projects-bf7b5a5e.vercel.app` (`dpl_2JRXYbfkmjPLWWJ8QmGKyeiV1c8d`) |
| Staging Database | Dedicated Supabase project `nnzdplkjizwgsalizijd` (`Fund Me AI Staging`, region `ap-south-1`) |
| Staging Auth | Scoped Clerk test instance (`pk_test_...`) |
| AI Synthesis Engine | Server-side `groq` provider (`openai/gpt-oss-120b`), 4.2s latency, deterministic score invariance |
| Browser E2E Status | 100% PASS (13/13 checkpoints verified with screenshots) |

## Canonical Workspace Layout

```
/Users/totem/Desktop/Code/
├── Fundme/                                      # Canonical repository (main @ 1040928)
├── Fundme-worktrees/
│   ├── Fundme-Product-V1/                       # Active feature worktree (product/v1-grill @ 39ce323)
│   └── Fundme-Staging/                          # Active staging worktree (staging @ 39ce323)
└── Fundme-archive/                              # Verification evidence, historical bundles & docs
```

## Release Pipeline Model

1. **Feature Development**: Work on `product/v1-grill` or `feature/*` branches in dedicated worktrees.
2. **Staging Integration**: Merge into `staging` branch -> automatic build & deploy to Staging (`staging.tryfundme.in`).
3. **Browser Acceptance**: Complete E2E customer journey verification on staging environment.
4. **Production Promotion**: Controlled PR/merge from `staging` into `main` -> automatic deployment to `https://tryfundme.in`.

## Remaining Action Items
- **DNS Record**: Add `A staging 76.76.21.21` (or `CNAME staging cname.vercel-dns.com`) at domain registrar (`ns67.domaincontrol.com` / `ns68.domaincontrol.com`) for direct apex SSL cert binding.

