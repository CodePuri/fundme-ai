# Active Phase Contract — Phase 1 Commercial Funding-Fit Funnel

Status: Approved; implementation locally verified, independent review and branch Preview pending
Owner: Aakash Puri + Engineering
Branch: `product/v1-grill`
Worktree: `/Users/totem/Desktop/Projects/Fundme-Product-V1`
Implementation baseline: `3ca0f895d8fb11d27f49a820f26da3f5168befbc`
Preview: Update the existing Git-connected branch Preview only; never promote it

## One user outcome

A founder reaches a useful, evidence-grounded funding-fit diagnosis before authentication, sees the shape of FundMe's opportunity moat, then can save the browser-local assessment into a limited Preview workspace through configured Clerk Google authentication or an explicitly local Preview profile.

## Route flow

```text
Homepage CTA
→ /assessment
→ /assessment/analyzing
→ /assessment/result
→ auth handoff
→ /app/preview
→ /search
```

`/assessment/review`, `/assessment/mentor`, and `/assessment/questions` recover to `/assessment`. `/assessment/report` remains a compatibility redirect to `/assessment/result`.

## Scope

- Keep homepage layout intact and route assessment entry to `/assessment`.
- Collect founder name, optional LinkedIn/profile source, optional startup website, optional deck metadata, and a one-line description only when website/deck context is absent.
- Offer honest LinkedIn URL, export/PDF, or pasted-text paths; do not scrape or claim an unavailable API connection.
- Apply `fundme-demo-rubric@1` locally through truthful supported analysis stages.
- Show a compact score hero, ten dimensions, evidence basis, paired gaps/actions, founder/startup/deck boundaries, download/share, and deterministic opportunity fixtures.
- Place `Save my assessment and see my matches` only after the diagnosis and teaser are visible.
- When a Clerk Preview key exists, offer the configured Google handoff. Without it, label Google unavailable and offer a distinct browser-local Preview profile.
- Show a compact `/app/preview` workspace with saved score, weakness, next action, four categories, limited fixture matches, public Explore, and locked optimization actions.
- Preserve current FundMe production typography, tokens, components, focus behavior, reduced-motion rules, and responsive language.

## Explicit exclusions

- No conversational mentor, SERA workspace, chat-first intake, long questionnaire, dashboard sidebar, generic AI gradients, gamification, or copied VC Boom branding/copy/layout.
- No live AI/RAG, website fetch, deck parsing, LinkedIn scraping, live matching, Production Clerk keys, Production Supabase write, migration, payment, outreach, tracker, or Production deployment.
- No claim that fixture matches, deadlines, checks, grants, identity, or persistence are live, verified, personalized, or durable.
- No broad homepage, middleware, auth architecture, `/app/*`, lint, type, or legacy-product refactor.

## Sources

- [PROJECT_STATE.md](./PROJECT_STATE.md)
- [PRODUCT_GROUND_TRUTH.md](./PRODUCT_GROUND_TRUTH.md)
- [SYSTEM_CONTRACT.md](./SYSTEM_CONTRACT.md)
- [UI_IMPLEMENTATION_CONTRACT.md](./UI_IMPLEMENTATION_CONTRACT.md)
- [OPERATING_RULES.md](./OPERATING_RULES.md)
- [DECISIONS.md](./DECISIONS.md)
- Aakash-supplied FundMe screenshots and `FundMe_UX_Rebuild_Commercial_Funnel_Prompt.md`
- VC Boom public pages/screenshots as information-architecture reference only

## Allowed domains

- `app/assessment/**`, `components/assessment/**`, `lib/assessment/**`
- exact `/app/preview` page/frame handling and conditional Clerk provider boundary
- closely related `/search` opportunity signposting and assessment CTA
- focused tests, executable implementation plan, and active canonical state/contract documents

## Data and truth contract

- Session data is versioned `demo` mode and browser-local.
- File bytes are neither uploaded nor persisted; accepted metadata may recover after refresh.
- URL presence is context, not fetched website evidence.
- LinkedIn URLs and profile files are founder-supplied metadata unless pasted text exists; contents are not fetched or parsed.
- Deck review remains `not-provided` or `received-unparsed`; no slide claims.
- Every dimension/finding cites submitted evidence or an explicit gap.
- Report state remains `partial` when mentor evidence is absent; the simplified funnel never relabels missing answers as complete.
- Traction stays `missing`, `none`, `positive`, or `contradictory`; negation/zero never creates a strength, and only actual current claim conflicts create contradictions.
- Preview matches are deterministic fixtures with verification-pending labels and no external mutation.
- `/app/preview` contains no server private data. Its exact public boundary exists only so no-key branch Previews remain usable; sibling and prefix-collision `/app/*` routes stay protected.

## Processing contract

Only supported local operations may appear:

- organizing submitted founder evidence or recording its absence
- using the submitted website address as context, without fetching it
- recording pitch-deck metadata or confirming no deck
- checking submitted evidence and gaps
- scoring `fundme-demo-rubric@1`
- selecting deterministic Preview opportunity categories

No fabricated extraction, queue position, percentage, AI-response, parser, or live-match progress is shown.

## Recovery

- Validation preserves entered values and reports field-specific errors.
- Refresh restores only structurally valid current-version state.
- Invalid, corrupt, oversized, or incoherent state is removed and returns to labelled recoverable intake.
- Back/forward keeps the shared local session; direct result/analyzing access recovers to the earliest valid step.
- Explicit restart clears valid local state or performs a labelled in-memory reset if storage is unavailable.
- Missing profile, denied LinkedIn connection, absent deck, and unparsed files never block the diagnosis.

## Acceptance

- website + founder completes with explicit missing profile/deck/startup-description evidence
- deck + founder validates the file and never invents slide findings
- LinkedIn URL/PDF/text is represented honestly and affects evidence coverage only within the submitted boundary
- weak input scores below a stronger specific fixture and names gaps
- authentication handoff works with or without a Clerk Preview key and never impersonates Google
- `/app/preview` shows saved local diagnosis, limited fixtures, locked actions, and public Explore
- focused tests, changed-scope ESLint, optimized build, and standalone TypeScript baseline show no new failures
- local and branch Preview pass 1440px, 390px, reduced-motion, hydration, overflow, console, and failed-request checks
- exact public-route boundaries pass; private sibling routes remain protected
- independent review inspects code and evidence
- Production remains at `10409284c56f2b5dea968b9e4b727d420b96aaeb`

## Stop conditions

- Production baseline or aliases move.
- Repository/worktree state becomes unsafe.
- A security, credential, platform-setting, or external-service action needs owner authorization.
- The bounded implementation and focused correction allowances are exhausted.
- A usage-limit warning occurs; save resume state and stop.

## Next contract

Intelligence foundation: accepted dossier/evidence model, rubric calibration, retrieval/provenance, real artifact extraction boundary, and live-adapter prerequisites. The later optimization workspace may evaluate the SERA interaction reference only under its own approved contract.
