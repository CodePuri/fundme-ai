# Durable Decisions

## 2026-07-15 - Isolate V1 behind runtime adapters

The V1 Grill ships only as a branch-specific Preview using demo adapters. Demo identity, persistence, parsing, retrieval, scoring, recommendations, entitlements, and sharing remain replaceable behind explicit contracts. Production defaults to fail-closed live mode so an accidental Production deployment cannot silently use demo persistence as real persistence.

## 2026-07-15 - Make the score deterministic and evidence-bound

The V1 score uses `fundme-v1-demo-rubric@1`, ten fixed weighted dimensions, a versioned local guidance corpus, and stable lexical retrieval. The same normalized evidence must produce the same report. The score is funding readiness, not predicted funding success.

## 2026-07-15 - Treat unavailable artifacts as unavailable

File names, MIME types, and founder claims are not proof that a deck was parsed. Only server-extracted text becomes deck evidence. Invalid, corrupt, image-only, or truncated input must produce an explicit partial state and cannot produce invented slide findings.

## 2026-07-15 - Keep demo reports private to the browser

The Preview stores the latest intake and report in versioned local storage. It does not create public personal-data URLs, write Production Supabase rows, or map identities through Production Clerk. Persistent sharing is deferred to a live adapter with authorization and retention controls.

## 2026-07-15 - Keep the complete public Preview graph Clerk-independent

The homepage, Grill, Search, Explore, and Grill API may render without Clerk in Vercel Preview. Authenticated application routes keep Clerk. Public funding-readiness links target `/grill` so automatic prefetch cannot make a protected onboarding route a hidden dependency of the demo.

## 2026-07-15 - Accept one stable branch alias after corrective deployments

The accepted artifact is the stable `codex/v1-grill-demo` branch alias at code SHA `5722fe8ba21726d7ddc0fb0e41b8f935fbd97dc7`. Four Git-triggered Preview attempts were needed because acceptance exposed three Preview-only Clerk/prefetch defects; corrections stayed on the same branch and never targeted or aliased Production.
