# FUNDME AGENT MANAGER RELEASE CONTROL

> **ARCHIVED 2026-07-23:** This document is superseded by [CANONICAL_SOURCE_MAP.md](../../CANONICAL_SOURCE_MAP.md) and [OPERATING_RULES.md](../../OPERATING_RULES.md). Its branch, release, and deployment instructions are stale and must not be executed.

## 0. Mission

This document is the single source of truth for the Fundme early-access website recovery, local QA, and release control process.

The current goal is **not** to finish the full AI assessment product.

The current goal is:

```text
LOCAL READY FOR HUMAN REVIEW
```

That means the website must work locally, visually and functionally, before any preview deployment, production deployment, or domain work.

The website must complete this user journey:

```text
Homepage
→ onboarding email gate
→ onboarding form
→ Supabase save
→ loader
→ thank-you page
```

Only after this is proven locally with screenshots and runtime evidence can Aakash approve a preview deployment.

---

## 1. Core Context

### Project

```text
Fundme.ai early-access website
```

### Active working branch

```text
feature/early-access-intake-preview
```

### Later domain target

```text
tryfundme.in
```

Do not touch this yet.

### Main objective

Make the early-access website good enough to share publicly after human approval.

This means:

1. Homepage looks premium and stable.
2. Navbar works.
3. Footer is complete and not placeholder-like.
4. `/search` looks acceptable.
5. `/onboarding` starts with an email gate.
6. Onboarding form still works.
7. Supabase save still works.
8. Loader appears after save.
9. Thank-you page appears.
10. Mobile works.
11. Local QA passes before preview.
12. Preview QA happens only after Aakash approves local result.
13. Domain cutover happens only after preview is approved.

---

## 2. Why This Document Exists

The project has become messy because the work split across two AntiGravity modes:

1. **IDE conversation**
   Older coding-focused conversation.

2. **Agent Manager conversation**
   Separate orchestration conversation.

These contexts became out of sync.

Multiple agents repeatedly failed by doing:

```text
small edits
→ pnpm build
→ preview deploy
→ overconfident report
→ claim ready
```

That is not acceptable.

### Failed pattern to avoid

```text
build passed = ready
preview deployed = ready
report written = ready
```

None of those are proof.

### Valid proof requires

1. Local browser walkthrough.
2. Screenshots.
3. Runtime onboarding test.
4. Supabase/API save proof.
5. Loader proof.
6. Thank-you proof.
7. Mobile proof.
8. Static audits.
9. No domain touched.
10. Clear final verdict.

---

## 3. Role Split

## 3.1 Agent Manager Role

Agent Manager is the release controller.

Agent Manager must **not** behave like a coding agent.

### Agent Manager responsibilities

1. Reconcile current repo state.
2. Detect whether IDE and Agent Manager contexts are out of sync.
3. Identify what is dirty, committed, broken, deployed, or unknown.
4. Create a precise local-only execution checklist for the IDE.
5. Prevent scope drift.
6. Reject build-only readiness claims.
7. Reject preview/domain readiness claims without proof.
8. Ensure local QA happens before preview.
9. Ensure preview QA happens before domain.
10. Give Aakash exact state, not vague optimism.

### Agent Manager must not

1. Edit code.
2. Deploy.
3. Touch `main`.
4. Touch `tryfundme.in`.
5. Touch DNS.
6. Touch Supabase schema.
7. Touch Clerk config.
8. Print secrets.
9. Claim readiness without proof.

---

## 3.2 IDE Role

IDE is the coding executor.

### IDE responsibilities

1. Edit source files.
2. Run local app.
3. Run build.
4. Run local browser QA.
5. Capture screenshots.
6. Run API/onboarding tests.
7. Fix local failures.
8. Return local proof.
9. Stop at:

```text
LOCAL READY FOR HUMAN REVIEW
```

### IDE must not

1. Deploy preview without Aakash approval.
2. Use `vercel --prod`.
3. Touch domain.
4. Touch DNS.
5. Touch `main`.
6. Print secrets.
7. Commit env files.
8. Claim preview/domain readiness.

---

## 4. Non-Negotiables

Do not touch:

```text
main
tryfundme.in
DNS
custom domains
production aliases
production deployment
Supabase schema
Clerk configuration
.env
.env.local
```

Do not:

```text
use vercel --prod
merge to main
connect domain
print secrets
commit env files
claim readiness from build success
deploy before local QA
skip screenshots
skip browser walkthrough
give /api/onboarding as the human preview link
```

---

## 5. Required Reference Files

Agent Manager and IDE must reference these before execution:

```text
/Users/totem/Desktop/Projects/Fundme/References/FUNDME_LIVE_WEBSITE_UX_CONVERSION_MASTER_BRIEF.md
/Users/totem/Desktop/Projects/Fundme/References/# FUNDME FRONTEND REPAIR, VISUAL QA, AND.md
/Users/totem/Desktop/Projects/Fundme/.agents/skills/grill-me/UI UX PRO SKILL.md
```

Use them as constraints.

Do not use them as permission to expand scope.

---

## 6. Known Project History

### Known safe backend path

The backend path has worked before.

Preserve it.

Previously proven or reported as working:

1. Supabase save worked.
2. Local API save worked.
3. Preview API save worked.
4. Onboarding form worked.
5. Loader worked.
6. Thank-you page worked.
7. Guest submission worked.
8. `main` was untouched.
9. `tryfundme.in` was untouched.

Do not break:

```text
app/api/onboarding/route.ts
Supabase schema
Clerk configuration
environment variables
guest submission behavior
```

### Known safe baseline

Known safe baseline commit referenced during recovery:

```text
8139b9aca68834b8b276fd1a0394ebcdeb9e60a5
```

This baseline was repeatedly used as the known-good reference for restored frontend/backend behavior.

### Known broken / untrusted states

Do not blindly trust previous “ready” claims.

Previous agents claimed readiness on previews such as:

```text
https://fundme-7v1lrrvbu-aakash-s-projects-bf7b5a5e.vercel.app
https://fundme-2knk42k6s-aakash-s-projects-bf7b5a5e.vercel.app
https://fundme-1rgjv1uo9-aakash-s-projects-bf7b5a5e.vercel.app
```

These reports were not sufficient because visual regressions remained.

### Known repeated frontend failures

1. Navbar became washed out or broken.
2. CTA text became invisible.
3. Footer became weak, missing, or placeholder-like.
4. FAQ felt bolted on.
5. `/search` was not properly verified.
6. Onboarding gate was missing or not proven.
7. Agents deployed too early.
8. Agents asked Aakash to review before completing their own QA.
9. Agents overclaimed readiness after build or preview deploy.
10. Agents returned `/api/onboarding` as if it were a human preview link.
11. Agents failed to compare footer against the original website quality.
12. Agents failed to preserve original site structure while applying new copy.

---

## 7. Current Goal

The only acceptable next goal is:

```text
LOCAL READY FOR HUMAN REVIEW
```

Not:

```text
READY FOR PREVIEW
READY FOR DOMAIN CUTOVER
READY FOR PRODUCTION
```

The next checkpoint must be local-only.

Preview deployment comes later only after Aakash approves local screenshots and local runtime proof.

---

## 8. Product Goal

Fundme should feel like:

```text
A premium founder funding-assessment intake product.
```

It must communicate:

```text
Stop pitching blind. Get assessed before you apply.
```

It should feel:

1. Premium.
2. Sharp.
3. Trusted.
4. Minimal.
5. Founder-grade.
6. Mobile-first.
7. Conversion-focused.
8. Not generic SaaS.
9. Not a fake AI demo.
10. Not cluttered.
11. Not a broken directory.
12. Not a placeholder landing page.

---

## 9. Target User Journey

## Step 1: Homepage

User lands on homepage.

Requirements:

1. Premium Fundme visual language.
2. Clear hero.
3. Strong single CTA.
4. Navbar works.
5. Trust rail is clear.
6. FAQ is integrated.
7. Footer is complete.
8. Mobile works.

Hero headline should communicate:

```text
Stop pitching blind. Start applying where you fit.
```

Primary CTA:

```text
Get Started Free
```

CTA helper:

```text
Free assessment. No credit card required.
```

CTA route:

```text
/onboarding
```

Forbidden in hero CTA area:

```text
See how it works
```

---

## Step 2: Onboarding Gate

Before full onboarding form, user sees a lightweight email gate.

Requirements:

1. Email required.
2. Optional LinkedIn.
3. No forced Clerk auth.
4. Guest submission must work.
5. Email persists into onboarding state.
6. Email reaches final Supabase payload.

Gate copy:

Headline:

```text
Start your free funding assessment
```

Body:

```text
Enter your email so Team Fundme can send your assessment update.
```

CTA:

```text
Continue to assessment
```

---

## Step 3: Onboarding Form

Required fields:

1. Full name.
2. Role.
3. Company name.
4. Email.

Optional fields:

1. Website.
2. LinkedIn.
3. X/Twitter.

Startup context:

1. Minimum 35 letters.
2. Maximum 500 letters.
3. UI must say `letters`, not words or characters.
4. Documents can be skipped.
5. Submit CTA says:

```text
Submit for assessment
```

---

## Step 4: Save and Loader

After submit:

1. Save to Supabase must succeed.
2. API must return:

```text
success: true
```

3. API must return:

```text
submissionId
```

4. Loader appears after save.
5. Loader lasts around 5 seconds.
6. Loader uses clean copy only.

Allowed loader steps:

```text
Securing your founder profile
Reading your startup context
Understanding your startup context
Checking missing funding signals
Preparing your early funding assessment
```

Forbidden loader language:

```text
score ready
analysis complete
approved
matched
accepted
guaranteed
weird dynamic company names
```

---

## Step 5: Thank-you Page

Thank-you page must say:

Headline:

```text
Thanks, [FirstName]. You’re on the list.
```

Fallback:

```text
Thanks, you’re on the list.
```

Body:

```text
We’ve received your founder profile and startup context.
Team Fundme will review what you shared and use it to prepare your early funding assessment.
```

Supporting line:

```text
Fundme is being built by Totem Interactive to help founders sharpen their deck, positioning, and funding path before they apply.
```

Closing:

```text
Look out for an email from Team Fundme soon.
```

Signoff:

```text
Team Fundme
A Totem Interactive product.
```

CTA:

```text
Back to home
```

---

## 10. Homepage Requirements

## 10.1 Navbar

Navbar must include:

1. Fundme logo.
2. `How it works`
3. `Programs`
4. `For Founders`
5. `Explore`
6. `Get Started`

Routing:

```text
How it works → #how-it-works
Programs → #matched-programs
For Founders → #for-founders
Explore → /search
Get Started → /onboarding
```

Rules:

1. No dead anchors.
2. No `href="#"`.
3. Header readable at page load.
4. Header readable after scroll.
5. CTA text visible.
6. Nav text visible.
7. Mobile nav usable.
8. Sticky header must not cover section titles.
9. No low-opacity core nav text.
10. No invisible CTA text.
11. No transparent header that disappears into cream background.

---

## 10.2 Hero

Hero must include:

1. Main headline.
2. Subheadline.
3. One primary CTA.
4. CTA helper.
5. No secondary CTA.

Primary CTA:

```text
Get Started Free
```

CTA route:

```text
/onboarding
```

Helper:

```text
Free assessment. No credit card required.
```

Forbidden:

```text
See how it works
```

---

## 10.3 How It Works Section

Section ID:

```text
how-it-works
```

Title:

```text
How Fundme works
```

Cards:

1. Share your startup context
   Add your company, deck, traction, and founder details once.

2. Get assessed before applying
   Fundme reviews your readiness signals and identifies gaps before you submit anywhere.

3. Apply with a sharper angle
   Use the assessment to improve positioning, deck clarity, and program fit.

This section should be compact, premium, and not the old weak “application admin” section.

---

## 10.4 Programs / Trust Rail Section

Section ID:

```text
matched-programs
```

Program mix must include:

1. YC
2. Techstars
3. Antler
4. 500 Global
5. Startup India
6. Startup India Seed Fund
7. MeitY TIDE 2.0
8. BIRAC BIG
9. SIDBI Fund of Funds
10. AWS Activate
11. Google for Startups
12. Microsoft for Startups
13. NVIDIA Inception

Rules:

1. Only one `Now matching with` label.
2. No duplicated rails.
3. No ghost icons.
4. No invisible logos.
5. No horizontal overflow.
6. Static compact strip is acceptable if marquee is unstable.

---

## 10.5 For Founders Section

Section ID:

```text
for-founders
```

Purpose:

Explain who Fundme is for.

Must mention:

1. Early-stage founders.
2. Student founders.
3. Indie builders.
4. Startup teams preparing for grants, credits, accelerators, fellowships, and founder programs.

---

## 10.6 FAQ Section

Section ID:

```text
faq
```

Title:

```text
Questions founders ask before applying
```

Subtitle:

```text
Quick answers before you start your free assessment.
```

FAQ copy:

### Q: What is Fundme?

Fundme helps founders assess their startup profile, pitch direction, and funding readiness before applying to accelerators, grants, credits, and founder programs.

### Q: Is it free?

Yes. The early-access assessment is free and does not require a credit card.

### Q: How does Fundme use my submission?

We use your submitted startup context to prepare an early funding assessment and identify gaps in positioning, deck readiness, and application fit.

### Q: Who is this for?

Early-stage founders, student founders, indie builders, and startup teams preparing to apply for funding programs.

### Q: What happens after I submit?

Team Fundme reviews your profile and will contact you if you are selected for early access.

### Q: Is this only for accelerators?

No. Fundme is being built for accelerators, grants, fellowships, cloud credits, incubators, and other founder programs.

---

## 10.7 Footer

Footer must be visually complete, not a placeholder.

Footer should function like the original website quality, but with updated Fundme copy.

Footer must include:

1. Fundme BrandLockup/logo.
2. `A Totem Interactive product.`
3. `Fundme helps founders stop applying blindly and prepare stronger funding applications.`
4. CTA:

```text
Get Started → /onboarding
```

5. Product links:

```text
How it works → #how-it-works
Programs → #matched-programs
FAQ → #faq
```

6. Explore links:

```text
Program search → /search
For founders → #for-founders
```

7. Copyright:

```text
© 2026 Fundme. All rights reserved.
```

Forbidden footer items:

1. Pricing unless page exists.
2. Privacy unless page exists.
3. Terms unless page exists.
4. Fake Instagram.
5. `href="#"`
6. Placeholder-style centered tiny footer.
7. Footer hidden behind clipping or rounded wrappers.
8. Missing footer on mobile.

---

## 11. `/search` Requirements

Public `Explore` must route to:

```text
/search
```

Protected dashboard route:

```text
/explore
```

must remain protected.

Search page requirements:

1. Must not look like a broken dashboard.
2. Must match Fundme cream/orange/black language.
3. Heading:

```text
Find startup programs worth applying to
```

4. Subheading:

```text
Explore accelerators, grants, fellowships, cloud credits, and founder programs.
```

5. CTA:

```text
Get assessed first
```

6. CTA route:

```text
/onboarding
```

7. Mobile usable.

---

## 12. SEO

Title:

```text
Fundme — Get assessed before you apply
```

Description:

```text
Fundme helps founders assess their startup profile, pitch direction, and funding readiness before applying to accelerators, grants, credits, and founder programs.
```

OpenGraph title:

```text
Fundme — Get assessed before you apply
```

OpenGraph description:

```text
Fundme helps founders stop applying blindly and prepare stronger funding applications.
```

Do not overclaim:

1. AI scoring.
2. AI matching.
3. Guaranteed funding.
4. Guaranteed acceptance.
5. Live program matching.

---

## 13. Local QA Before Preview

No preview deployment until local QA passes and Aakash approves.

Run:

```bash
pnpm build
pnpm dev
```

Local URL:

```text
http://localhost:3000
```

Clear:

1. localStorage.
2. sessionStorage.

Test desktop:

```text
1440px
```

Test mobile:

```text
390px
```

Required local screenshots:

1. homepage top desktop
2. homepage top mobile
3. navbar desktop
4. navbar mobile
5. how-it-works desktop
6. matched-programs desktop
7. for-founders desktop
8. FAQ desktop
9. FAQ mobile
10. footer desktop
11. footer mobile
12. `/search` desktop
13. `/search` mobile
14. onboarding gate desktop
15. onboarding gate mobile
16. onboarding form desktop
17. onboarding form mobile
18. loader desktop
19. thank-you desktop
20. thank-you mobile

Required local tests:

1. Navbar links work.
2. Get Started goes to `/onboarding`.
3. Hero Get Started Free goes to `/onboarding`.
4. Explore goes to `/search`.
5. `/search` CTA goes to `/onboarding`.
6. Footer links work.
7. No `href="#"`.
8. Footer is visible and complete.
9. No horizontal overflow.
10. Onboarding gate appears first with clean localStorage.
11. Gate validates email.
12. Gate passes email into onboarding.
13. Onboarding required fields work.
14. Optional fields can stay empty.
15. Letter counter works.
16. Documents can be skipped.
17. Submit for assessment works.
18. Loader appears.
19. Thank-you appears.
20. API returns `success: true` and `submissionId`.
21. No console errors.

If local fails:

1. Fix locally.
2. Retest locally.
3. Do not deploy.

---

## 14. Static Audits

Run:

```bash
grep -R "href=\"#\"" -n app components || true
grep -R "router.push(\"/thank-you\")" -n app components || true
grep -R "href=\"/thank-you\"" -n app components || true
grep -R "See how it works" -n app components || true
grep -R "Submit for early access\\|Submit for fixes\\|Fix my deck\\|Your deck, destroyed\\|deck destroyed\\|We read everything\\|Here's the truth\\|roast\\|mercy\\|couldn't complete\\|analysis complete\\|score ready" -n app components || true
```

Classify each result:

1. VALID
2. INVALID
3. DEAD OLD FILE

Fix invalid active findings.

---

## 15. Preview Deployment Only After Local Approval

Only after local QA passes and Aakash approves:

```bash
git status --short
git add relevant source files only
git commit -m "fix: complete early access local readiness"
git push origin feature/early-access-intake-preview
npx vercel --confirm
```

Forbidden:

```text
vercel --prod
vercel alias
DNS
custom domain
tryfundme.in
merge to main
```

---

## 16. Final Local Report Format

Return:

1. branch
2. current commit SHA
3. build result
4. files changed
5. homepage result
6. navbar result
7. hero result
8. trust rail result
9. how-it-works result
10. for-founders result
11. FAQ result
12. footer result
13. `/search` result
14. onboarding gate result
15. onboarding form result
16. loader result
17. thank-you result
18. Supabase/API result
19. submissionId proof
20. dead link audit
21. forbidden copy audit
22. desktop screenshot paths
23. mobile screenshot paths
24. P0 blockers
25. P1 issues
26. P2 polish
27. env files untouched
28. Supabase schema untouched
29. Clerk unchanged
30. main untouched
31. tryfundme.in untouched
32. final verdict

Allowed local verdicts:

```text
LOCAL READY FOR HUMAN REVIEW
NOT READY, P0 BLOCKERS
NOT READY, P1 ISSUES
```

Do not say:

```text
READY FOR DOMAIN CUTOVER
READY FOR PREVIEW
```

until local approval is given.

---

## 17. Final Rule

Build passing is not proof.

Deployment is not proof.

A report without screenshots is not proof.

The only valid next checkpoint is:

```text
LOCAL READY FOR HUMAN REVIEW
```
