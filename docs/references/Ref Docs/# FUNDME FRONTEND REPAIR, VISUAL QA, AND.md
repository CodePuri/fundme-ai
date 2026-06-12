# FUNDME FRONTEND REPAIR, VISUAL QA, AND DOMAIN-READINESS PROTOCOL

## 0. Purpose

This protocol fixes the damage from the last broad UX pass.

The previous pass correctly added some useful items:
- CTA routing away from direct `/thank-you`
- FAQ content
- footer attribution
- SEO metadata
- dead link cleanup

But it also introduced visible UX damage:
- FAQ looks ugly and bolted on
- navbar lost useful buttons/structure
- homepage still does not feel premium enough
- visual QA was not actually proven
- the report overclaimed domain readiness before live preview proof was complete

This phase is not a rebuild.

This phase is a surgical visual repair and final QA pass.

## 1. Current working baseline

Branch:

```text
feature/early-access-intake-preview

Known good backend baseline:

8139b9aca68834b8b276fd1a0394ebcdeb9e60a5

Known checkpoint/tag if available:

checkpoint-before-final-ux-conversion-pass

Working backend that must be preserved:

Supabase save
API submission
loader
thank-you
onboarding validation
preview deployment
2. Non-negotiables

Do not touch:

main
DNS
tryfundme.in
custom domains
production aliases
production deployment
Supabase schema
Clerk configuration
.env
.env.local
app/api/onboarding/route.ts unless regression test proves it is broken

Do not:

use vercel --prod
merge
connect domain
print secrets
commit env files
rewrite the app
blindly keep the previous Gemini changes
blindly revert everything
claim readiness without screenshots and tests
3. Correct design intent

Fundme should feel like:

A premium founder funding-assessment intake.

Not:

Generic SaaS landing page
FAQ dump
Directory
Productivity app
AI gimmick

Primary message:

Stop pitching blind. Get assessed before you apply.

Primary action:

Get Started Free

Primary route:

/onboarding
4. What must be preserved from the previous pass

Preserve if implemented correctly:

signed-in CTA should route to /onboarding, not direct /thank-you
no CTA should send users to /thank-you before valid submission
footer should include “A Totem Interactive product”
dead # links should be removed
SEO metadata should be founder/funding focused
FAQ content can remain, but must be redesigned if ugly
backend save flow must remain untouched
5. What must be audited and potentially repaired
Navbar

Problem:
The previous pass removed two buttons / navigation elements too aggressively.

Required:

Restore useful navbar structure if it was unintentionally removed.
Keep navbar clean, not empty.
Nav CTA must say Get Started.
Nav CTA routes to /onboarding.
Do not remove useful navigation unless it is broken or dead.
Do not add dead links.

Desktop navbar should have:

Brand left
useful minimal nav center or right if already existing
primary CTA right

Mobile navbar should:

not overflow
have readable brand
have accessible menu or direct CTA
Hero CTA

Required:

Hero should have one primary CTA:
Get Started Free
Remove See how it works only from hero CTA area.
Do not destroy navbar just because hero secondary CTA was removed.
CTA helper text:
Free assessment. No credit card required.
No duplicate “Now matching with” under CTA.
Trust rail / marquee

Required:

Only one trust rail label:
Now matching with
Logos or badges must be clearly visible.
If logos are broken, use premium text badges.
Marquee must either move smoothly or be replaced with a clean static strip.
No duplicate trust rail.
No horizontal overflow.
No ghost-gray invisible logos.

Include a balanced mix:

YC
Techstars
Antler
500 Global
Startup India
Startup India Seed Fund
MeitY TIDE 2.0
BIRAC BIG
SIDBI Fund of Funds
AWS Activate
Google for Startups
Microsoft for Startups
NVIDIA Inception
FAQ

Problem:
FAQ was added but looks ugly.

Required:

Keep FAQ only if it looks premium and integrated.
FAQ should not look like a generic support dump.
It must have good spacing, rhythm, hierarchy, and mobile behavior.
If accordion looks ugly, redesign it as clean stacked cards or refined accordion.
Use warm Fundme palette.
Use less visual noise.
Keep FAQ near bottom, before footer.

FAQ copy:

What is Fundme?
Fundme helps founders assess their startup profile, pitch direction, and funding readiness before applying to accelerators, grants, credits, and founder programs.
Is it free?
Yes. The early-access assessment is free and does not require a credit card.
How does Fundme use my submission?
We use your submitted startup context to prepare an early funding assessment and identify gaps in positioning, deck readiness, and application fit.
Who is this for?
Early-stage founders, student founders, indie builders, and startup teams preparing to apply for funding programs.
What happens after I submit?
Team Fundme reviews your profile and will contact you if you are selected for early access.
Is this only for accelerators?
No. Fundme is being built for accelerators, grants, fellowships, cloud credits, incubators, and other founder programs.
Footer

Required:

Use BrandLockup if it looks good.
If BrandLockup sizing is ugly, fix sizing.
Include:
A Totem Interactive product.
Include:
Fundme helps founders stop applying blindly and prepare stronger funding applications.
Remove fake/dead links.
Do not render Instagram if URL is unknown.
If unknown, leave code TODO but do not show fake link.
Footer must not feel empty or randomly styled.
Onboarding

Do not rebuild onboarding.

Only repair if visible issues remain:

logo sizing
mobile spacing
left orange panel compression
CTA reachability
field alignment
accessibility
thank-you copy

Preserve:

required fields
optional website/LinkedIn/X
35 to 500 letters counter
Supabase save
loader
thank-you
Thank-you

Must say:

Team Fundme will contact the user
Fundme is built by Totem Interactive
Back to home works

Copy:

Thanks, [FirstName]. You’re on the list.

We’ve received your founder profile and startup context.
Team Fundme will review what you shared and use it to prepare your early funding assessment.

Fundme is being built by Totem Interactive to help founders sharpen their deck, positioning, and funding path before they apply.

Look out for an email from Team Fundme soon.

Team Fundme
A Totem Interactive product
6. Required execution sequence
Phase 1: Stop and inspect

Before coding, run:

git branch --show-current
git log --oneline -8
git status
pnpm build
git diff checkpoint-before-final-ux-conversion-pass...HEAD --stat || true
git diff 8139b9aca68834b8b276fd1a0394ebcdeb9e60a5...HEAD --stat || true

Report:

current branch
current HEAD
build result
changed files since checkpoint
whether env files are dirty
whether previous Gemini commit exists
whether checkpoint exists
Phase 2: Visual audit before coding

Open localhost or preview.

Take screenshots:

homepage desktop
homepage mobile 390px
FAQ desktop
FAQ mobile
footer desktop
footer mobile
onboarding desktop
onboarding mobile
thank-you

Classify every changed UI area as:

KEEP
REVERT
REPAIR

Do not code until this classification is written.

Phase 3: Surgical repair

Implement only the repair decisions.

Expected likely fixes:

restore useful navbar buttons if over-removed
remove only hero secondary CTA
redesign ugly FAQ
fix footer spacing and attribution
fix trust rail visibility / motion
preserve CTA routing fix
preserve dead-link cleanup
preserve SEO metadata if safe
preserve Supabase flow
Phase 4: Tests

Run all tests below.

Build
pnpm build

Must pass.

Homepage desktop

Viewport 1440px:

hero readable
navbar not over-pruned
CTA visible
no See how it works in hero CTA zone
trust rail visible
no duplicate Now matching with
FAQ visually acceptable
footer visually acceptable
no dead # links
Homepage mobile

Viewport 390px:

no horizontal overflow
hero readable
CTA reachable
FAQ not ugly or huge
footer readable
trust rail not cluttered
no overlapping cards
CTA routing

Search code:

grep -R "router.push(\"/thank-you\")" -n .
grep -R "href=\"/thank-you\"" -n .

Classify:

valid post-submit redirect
invalid pre-submit shortcut

Invalid shortcuts must be fixed.

Onboarding regression
/onboarding loads
required fields work
optional fields do not block empty
35–500 letters counter still works
documents can be skipped
review button says Submit for assessment
Supabase regression

Submit via API or UI.

Must prove:

success: true
submissionId returned
loader appears after save
thank-you appears after loader
Thank-you
Team Fundme mentioned
Totem Interactive mentioned
Back to home works
mobile readable
Voice

If automation cannot test mic:

mark Voice requires human confirmation
do not claim passed
Phase 5: Commit

If code changed:

git status
git add relevant files only
git commit -m "fix: repair homepage UX and final conversion polish"
git push origin feature/early-access-intake-preview

Do not add:

.env
.env.local
random reports unless explicitly useful
scratch files
screenshots unless requested
Phase 6: Preview only

Deploy preview only:

npx vercel --confirm

Forbidden:

vercel --prod
domain alias
DNS
tryfundme.in
merge to main
Phase 7: Final report

Return exactly:

branch
current commit SHA
checkpoint used
build result
files changed
diff summary since checkpoint
visual audit classification
navbar result
hero CTA result
trust rail result
FAQ result
footer result
SEO result
onboarding result
Supabase regression result
loader result
thank-you result
homepage desktop screenshot
homepage mobile screenshot
FAQ screenshot
footer screenshot
onboarding screenshot
P0 blockers
P1 issues
P2 polish
env files untouched
Supabase schema untouched
Clerk unchanged
main untouched
tryfundme.in untouched
final verdict

Allowed verdicts:

READY FOR HUMAN PREVIEW
NOT READY, P0 BLOCKERS
NOT READY, P1 ISSUES
READY FOR DOMAIN CUTOVER REVIEW

Do not say READY FOR DOMAIN CUTOVER REVIEW unless:

build passes
Supabase save still works
loader works
thank-you works
FAQ is visually acceptable
navbar is not over-pruned
homepage mobile passes
screenshots captured
no dead links
no forbidden copy
no domain touched