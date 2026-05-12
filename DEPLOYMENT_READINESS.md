# Deployment Readiness

## Mock / Real Status

| Feature | Status | Notes |
|---------|--------|-------|
| AI analysis | **FOUNDATION IN PLACE** | Structured schema, prompt templates, validation, and model adapter created in `lib/assessment/`. Still uses `generateMockReport()` at runtime until Chunks C-D-E connect the real AI pipeline. |
| Auth | **LIVE** | Clerk auth is configured and active. `/sign-in`, `/sign-up` routes functional. |
| Paywall | **MOCK** | Unlock modal shows "Early Access Coming Soon" placeholder. No real payment integration. |
| Data persistence | **LIVE** | `localStorage` via `fundme-assessment-v1` key. No backend database. |
| Assessment flow | **LIVE** | Full frontend funnel: homepage → intake → analyzing → report. Mock report data. |
| Dashboard continuation | **LIVE (client-side)** | `/app/report` renders within dashboard shell using client-side diagnosis state. No server persistence. |

## Must Turn On Before Live

1. **Real AI analysis** — Replace `generateMockReport()` with actual NLP / LLM-powered startup signal analysis.
2. **Payment integration** — Connect a payment provider (Stripe, etc.) to the unlock modal.
3. **Backend database** — Persist user assessments, reports, and progress server-side.
4. **Real program matching** — Replace `lockedMatchesPreview` mock data with real accelerator/program data.

## Auth

- Clerk authentication is fully configured.
- Routes protected via `proxy.ts` middleware.
- `/sign-in` and `/sign-up` are active.
- Currently, the assessment funnel does NOT require auth to view the report.

## Route Safety Status

| Route | Access | Notes |
|-------|--------|-------|
| `/search` | Public | No auth required |
| `/assessment` | Public | Intake form, no auth |
| `/assessment/report` | Public | Shows "No Diagnosis Found" if no report in localStorage |
| `/explore` | Protected | Redirects to sign-in if unauthenticated |
| `/app` | Protected | Redirects to sign-in if unauthenticated |
| `/app/report` | Protected | Dashboard continuation WIP — redirects to sign-in if unauthenticated |

## Paywall

- **MOCK**: The unlock modal displays an "Early Access Coming Soon" state.
- No real payment flow.
- "Unlock improvement plan" CTA currently routes to `/sign-up`.
- Auto-modal triggers after 5 seconds on the report or after scrolling past 400px.

## AI Analysis

- **MOCK**: Scores are randomized within a range derived from assessment answers.
- Weaknesses and assessments are static templates.
- No real website scanning, NLP, or signal analysis.

## Test Flow Instructions

1. Visit `/` — homepage with rotating input placeholder and "Analyze" button
2. Enter a website URL (or use "Use sample startup" on `/assessment`)
3. Click "Analyze" / "Start funding scan"
4. On `/assessment` — compact source input console
5. Click "Use sample startup" to prefill test data (or enter manually)
6. Click "Start funding scan"
7. On `/assessment/analyzing` — scan loader → 10 questions with back button + sticky CTA → 4 founder reality cards → completion screen
8. Report auto-redirects to `/assessment/report` — verdict, score, score interpretation, top issues, signals, what Fundme can fix, opportunity radar
9. Paywall modal appears automatically after 5s or scroll past scores
10. "Continue with free report" closes modal
11. "Unlock improvement plan" routes to `/sign-up`

## Test Data

- **Sample startup**: `https://flowstate.ai`, name "Flowstate AI", LinkedIn "sarah-chen-ai", notes included
- **Keyboard test**: Ensure input CTA is visible when mobile keyboard is open
- **Back button**: Available on question screens only (not during loading states)

## Known Limitations

- Report scores are non-deterministic (random variance per refresh)
- Locked fix cards show mock blurred previews, not real fix content
- Opportunity radar shows static match previews
- No server-side persistence — reloading clears assessment state
- Dashboard continuation is client-side only — `/app/report` reads from `fundme-assessment-v1` localStorage key
- No server-side persistence — report is lost on localStorage clear
- Clerk webhook persistence still future work (no backend database for user reports)
- Questions are duplicated between `/assessment/questions` and `/assessment/analyzing`
- No real file upload to server — uploaded file names stored in localStorage only
- Genkit AI pipeline still future work (mock report generation only)

## Vercel / Domain Mismatch Note

- Ensure the active live domain (`fundme-ai.vercel.app`) is correctly mapped to the current production Vercel project linked to the `CodePuri/fundme-ai` GitHub repository. Any legacy custom domain DNS bindings must be audited to prevent pointing to deprecated static project deployments.

## Production Checklist

- [ ] Replace mock report generation with real AI analysis
- [ ] Add payment provider integration
- [ ] Add server-side database for assessment persistence
- [ ] Add real accelerator/program data for matching
- [ ] Wire up file upload to cloud storage (not localStorage)
- [ ] Remove "Use sample startup" button or guard behind dev flag
- [ ] Replace "Early Access Coming Soon" with real unlock flow
- [ ] Add analytics/tracking
- [ ] Add error boundaries and fallbacks
- [ ] Performance audit: images, fonts, bundle size
- [ ] Accessibility audit: keyboard nav, screen reader, contrast
- [ ] Test on 390px mobile, tablet, desktop
- [ ] Test with prefers-reduced-motion

## Intelligence Pipeline Status

The structured intelligence foundation is in place but **not yet wired to the runtime flow**.

| Layer | File | Status |
|-------|------|--------|
| Schema | `lib/assessment/schema.ts` | ✅ `StructuredReport` type, signal/issue models, `mapToLegacyReport()` mapper, `getScoreLabel()` |
| Prompts | `lib/assessment/prompt.ts` | ✅ System prompt with safety rules, user prompt builder, emergency fallback |
| Validation | `lib/assessment/validate.ts` | ✅ Score ranges, confidence labels, blocked pattern detection, sanitize |
| Model Adapter | `lib/assessment/model-adapter.ts` | ✅ Provider-agnostic interface (Groq, OpenAI, Anthropic, xAI), primary/fallback/emergency chain |
| Env Config | `.env.example` | ✅ Documents all required env vars |
| Runtime | `component/assessment/assessment-provider.tsx` | ⏳ Still uses `generateMockReport()` — next chunk |
| Website extraction | `app/api/website/extract` | ❌ Not yet built — Chunk C |
| Analysis API | `app/api/assessment/analyze` | ❌ Not yet built — Chunk D |
| Connect to flow | `/assessment/analyzing` | ❌ Not yet connected — Chunk E |
| Server persistence | `assessments` table | ❌ SQL written but not executed — Chunk F |
| Dashboard server read | `/app/report` | ❌ Not yet connected — Chunk G |
