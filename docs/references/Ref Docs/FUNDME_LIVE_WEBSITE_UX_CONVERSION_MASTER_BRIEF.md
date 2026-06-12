FUNDME_LIVE_WEBSITE_UX_CONVERSION_MASTER_BRIEF.md
    0. Mission

Fundme is not just a pretty landing page.

Fundme must feel like a credible, sharp, founder-grade funding assessment product that makes a founder think:

“I should submit my details before I waste time applying blindly.”

The current backend is finally functional. Supabase saves work. Loader works. Thank-you works. The next phase is pure UX, conversion, trust, and mobile readiness.

The goal is to make the current early-access site strong enough to connect to the live domain and share publicly.

1. Non-Negotiable Execution Rules

Before making any UX changes, create a checkpoint.

Do Not Touch
main
production deployment
tryfundme.in
DNS
custom domains
production aliases
Supabase schema
Clerk configuration
.env
.env.local
working API save flow
Do Not Do
Do not use vercel --prod
Do not connect domain
Do not rewrite the whole app
Do not break Supabase save
Do not fake success states
Do not hide errors
Do not leave broken mobile layouts
Do not claim readiness without screenshots and browser QA
Must Preserve
Supabase insert
API save
loader
thank-you route
Submit for assessment
forbidden-copy cleanup
mobile usability
current Fundme visual language
2. Phase 0: Mandatory Checkpoint

Run this first.

git branch --show-current
git log --oneline -5
git status
pnpm build

If build passes and no source changes are pending, create:

git tag -a checkpoint-early-access-working-supabase -m "Checkpoint: early access working Supabase flow"
git push origin feature/early-access-intake-preview
git push origin checkpoint-early-access-working-supabase

If there are source changes, stop and report them.

If only .env or .env.local changed, do not commit them.

3. Design Philosophy

Fundme must follow four design laws.

3.1 Less, But Better

Dieter Rams’ principles emphasize usefulness, understandability, honesty, restraint, detail, and “as little design as possible.” Fundme should remove anything that does not improve trust, action, or comprehension.

3.2 Do Not Make Users Think

Steve Krug’s core usability principle is that a website should help users accomplish the intended task as directly and easily as possible. Fundme has one job: get founders into the assessment flow.

3.3 Motivation + Ability + Prompt

The Fogg Behavior Model says behavior happens when motivation, ability, and prompt converge. Fundme must increase motivation, reduce effort, and place one clear CTA at the right moment.

3.4 Visibility, Minimalism, Error Prevention

Nielsen-style usability heuristics include visibility of system status, consistency, error prevention, recognition over recall, and aesthetic minimalist design. Fundme’s current onboarding must become more obvious, responsive, and forgiving.

4. Current Brutal UX Diagnosis
4.1 Homepage
Problems
Hero is visually premium but not conversion-tight.
Primary CTA competes with “See how it works.”
Marquee/trust rail is duplicated and unclear.
“Now matching with” appears in places where it wastes space.
Program logos/assets are weak or invisible.
Marquee does not move correctly.
The floating program cards feel decorative, not intentional.
Hero text and floating logo cards lack Framer Motion polish.
The “Everything in one place / worth your time” section looks bland and too dashboard-like.
Page is not mobile-first.
Copy is too text-heavy in sections where users need quick trust.
No FAQ.
No strong footer.
No Instagram link.
No “Fundme is a Totem Interactive product” ownership line.
SEO is weak.
Footer trust and next-step clarity are missing.
Impact

The page currently says “interesting prototype,” not “credible founder tool.”

The first impression must be sharper.

4.2 Onboarding
Problems
Layout structure is okay, but mobile execution is weak.
Logo sizing is inconsistent.
Left orange panel is acceptable on desktop but must collapse elegantly on mobile.
Some text is too generic.
Field validation must feel friendly, not bureaucratic.
Startup idea input should be compact but clear.
Voice input must not create false captured states.
Loader personalization must sanitize weird company names.
Accessibility needs improvement: readable sizing, tap targets, focus states, keyboard behavior.
Impact

The onboarding is functional but does not yet feel like a polished product experience.

4.3 Thank-you Screen
Problems
Too much empty whitespace on desktop.
Needs stronger confirmation.
Must clearly say users will be contacted by Team Fundme.
Must include “Fundme is a Totem Interactive product.”
Should include Instagram link or social trust in footer.
Dynamic name should not show weird company or test values incorrectly.
Impact

The success page is the last trust moment. It currently feels too sparse.

5. Product Positioning
Fundme One-Liner

Fundme helps founders stop applying blindly by assessing their startup profile, deck context, and funding fit before they apply.

Primary Promise

Get assessed before you hit apply.

Supporting Promise

Upload your startup context once. Fundme helps you understand where you fit, what is weak, and what to improve before sending applications.

Tone
sharp
premium
founder-first
direct
credible
not hype
not fake AI magic
not roast
not “productivity app”
Avoid
“personal hub”
“clarity and productivity”
“programs already in the room”
fake AI claims
fake matching claims
aggressive roast language
too many CTAs
6. Homepage Redesign Requirements
6.1 Hero Goal

The hero must do three things in under 5 seconds:

Explain the problem.
Show the value.
Push the user to start.
6.2 Hero Structure

Recommended order:

Navbar
Hero badge
Headline
Subheadline
Single CTA
Micro-trust line
Animated program/logo orbit or compact rail
Optional trust strip lower down
6.3 Hero Copy
Badge
BACKED BY REAL STARTUP PROGRAM CONTEXT

or shorter:

BUILT FOR FOUNDERS APPLYING NOW
Headline

Keep:

Stop pitching blind.
Start applying where you fit.

Alternative:

Stop applying blind.
Get assessed before you hit apply.
Subheadline
Share your startup context once. Fundme reviews your founder profile, pitch direction, and funding readiness so you know what to fix before you apply.
6.4 CTA Rules

Remove:

See how it works

Primary CTA only:

Get Started Free

Navbar CTA:

Get Started

Both should route to:

/onboarding
6.5 CTA Microcopy

Under CTA:

Free assessment. No credit card required.

This should be the only helper text in that zone.

Remove extra “Now matching with” below CTA if it creates clutter.

7. Marquee / Program Trust Rail
7.1 Current Problem

The trust rail is duplicated, static, and visually noisy.

7.2 Required Behavior

The trust rail should either be:

A clean animated marquee, or
A compact static trust grid.

Do not do both unless it is visually necessary.

7.3 Label

Use:

Now matching with

But only once.

7.4 Content Mix

It must not look like only an accelerator tool.

Include:

accelerators
incubators
fellowships
grants
startup schemes
cloud credits
sector-specific programs

Example list:

Y Combinator
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
7.5 Visual Requirements
Logos/assets must be visible.
Icons should not be tiny gray ghosts.
Cards must not overlap.
Cards must not look randomly floated.
Marquee must move smoothly.
Mobile should show a simplified compact strip or hide complex rail.
No horizontal overflow.
No duplicated rail.
7.6 Motion

Use Framer Motion.

Motion rules:

Fade in hero copy.
Float program cards with subtle y-axis movement.
Use ease-out, not bouncy gimmicks.
Delay secondary elements by 100–200ms.
Respect reduced-motion preference.
Marquee should be smooth and slow.
No jerky infinite loops.

Suggested animation style:

initial: { opacity: 0, y: 16 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
8. Section Removal: Comment Out “Worth Your Time”
8.1 Instruction

Comment out the section currently resembling:

Your time is worth more than application admin.
Everything in one place.

or:

The application is worth your time.

Do not delete permanently.

Add a clear code comment:

{/* TODO: Rebuild this section after domain launch. Temporarily disabled because it weakens conversion hierarchy. */}
8.2 Why

The section is not strong enough right now. It is text-heavy, bland, and pulls attention away from the primary onboarding action.

9. FAQ Section Requirements

Add a simple FAQ near the bottom before the footer.

FAQ Goals
reduce hesitation
clarify what happens after submission
increase SEO surface
build trust
avoid fake promises
Suggested FAQ Items
Q1: What does Fundme do?
Fundme helps founders assess their startup profile, pitch direction, and funding readiness before applying to accelerators, grants, credits, and startup programs.
Q2: Is this free?
Yes. The early-access assessment is free and does not require a credit card.
Q3: What happens after I submit?
Team Fundme reviews your profile and startup context. If you are a fit for early access, we will contact you with next steps.
Q4: Do I need a pitch deck?
No. A pitch deck helps, but you can start with your website, LinkedIn, or a short startup description.
Q5: Is this only for accelerators?
No. Fundme is being built for accelerators, grants, fellowships, cloud credits, incubators, and other founder programs.
Q6: Who is building Fundme?
Fundme is a Totem Interactive product.
10. Footer Requirements

Add a clean footer.

Must Include
Fundme logo
Short positioning line
“A Totem Interactive product”
Instagram link
Email/contact if available
Basic links
Suggested Footer Copy
Fundme helps founders stop applying blindly and prepare stronger funding applications.
A Totem Interactive product.

Instagram link label:

Instagram

If URL is unknown, use placeholder and mark TODO:

// TODO: Replace with final Fundme / Totem Instagram URL
11. SEO Requirements
Metadata

Ensure homepage metadata includes:

Title: Fundme — Get assessed before you apply
Description: Fundme helps founders assess their startup profile, pitch direction, and funding readiness before applying to accelerators, grants, credits, and startup programs.
Keywords / Themes

Use naturally in copy:

founder funding assessment
startup accelerator applications
startup grants
pitch deck readiness
funding readiness
startup programs
founder application support
SEO Rules
Do not keyword stuff.
Use clean headings.
Add FAQ semantic structure if possible.
Avoid fake claims.
Avoid claiming real matching if matching is static/mock.
12. Onboarding Redesign Requirements
12.1 Desktop Layout

Current left-panel/right-form structure can remain.

Improve:

logo sizing
panel typography
form density
CTA visibility
validation clarity
accessible spacing
focus states
12.2 Mobile Layout

Mobile must not be a squeezed desktop.

Requirements:

single-column layout
left orange section collapses into compact top header
logo readable
step indicator visible but not huge
CTA reachable without awkward scrolling
no horizontal overflow
large touch targets
form fields not oversized
no giant blank top space
12.3 Logo Sizing

Logo must visually align with text.

Rules:

logo mark and wordmark should not look mismatched
if asset has weird intrinsic sizing, compensate with CSS
test visually with screenshot
maintain accessible contrast
12.4 Field Rules

Required:

Full name
Role
Company name
Email

Optional:

Website
LinkedIn
X/Twitter

Validation:

Email must include @ and a domain.
Website optional, but if provided, accept example.com and https://example.com.
LinkedIn optional, but if provided, require linkedin.com.
X/Twitter optional, but if provided, require x.com or twitter.com.
12.5 Startup Context Input

Current live requirement:

minimum 35 letters
maximum 500 letters

UI:

X / 500 letters

Below minimum:

Please add [N] more letters so we can understand what you’re building.

Valid:

Good context. Ready to continue.

Over maximum:

You are [N] letters over the limit. Keep it under 500 letters for now.
12.6 Voice Input

Voice input should remain functional.

Requirements:

tap once to request mic permission
clear listening state
stop works
transcript remains editable
typed text is not wiped
captured state only if transcript exists
if unsupported, graceful fallback to typing
auto-stop after 2 minutes
13. Loader Requirements

Loader should be short, confidence-building, not fake AI overclaiming.

Allowed Loader Copy
Securing your founder profile
Reading your startup context
Understanding your idea
Checking missing funding signals
Preparing your early funding assessment
Dynamic Personalization Rules

If using company/startup name:

sanitize
trim
avoid weird outputs like repeated words
cap to 24 characters
fallback to “your startup”

Bad:

Understanding d’s Fish Fish Fish idea...

Good:

Understanding your startup context

or:

Understanding Totem’s startup context
14. Thank-you Page Requirements
Goal

The thank-you page should feel like a confident confirmation, not a sparse debug page.

Copy

Headline:

Thanks, [FirstName]. You’re on the list.

Fallback:

Thanks, you’re on the list.

Body:

We’ve received your founder profile and startup context.
Team Fundme will review what you shared and use it to prepare your early funding assessment.

Supporting line:

Fundme is being built by Totem Interactive to help founders sharpen their deck, positioning, and funding path before they apply.

Closing:

Look out for an email from Team Fundme soon.

Signoff:

Team Fundme
A Totem Interactive product

CTA:

Back to home
Layout Rules
reduce giant empty desktop space
center content without looking lost
readable at 100%, 125%, and mobile width
email must wrap correctly
footer/social link visible
15. Visual Direction Inspired by Death by Clawd

Do not copy Death by Clawd’s dark cyberpunk style directly.

Extract the useful principles:

Immediate tension
Clear score/state cards
Strong visual hierarchy
Distinct categories
Compact dense information
Motion that makes the product feel alive
One memorable interaction loop

Translate into Fundme’s visual language:

cream background
orange accent
black primary CTA
editorial startup tone
glass/card components
restrained premium motion
warm credibility, not horror/cyberpunk
16. Final Homepage Structure

Recommended public homepage order:

Navbar
Hero
CTA microcopy
Clean trust rail / moving marquee
Founder problem section
Optional short “How Fundme works” 3-step section
FAQ
Footer

Comment out “worth your time” section for now.

17. Final Navbar Requirements

Desktop:

Logo left
Minimal links
Remove anything unnecessary
Primary CTA right: Get Started

Mobile:

Logo left
Menu or direct CTA
CTA visible if possible
no crowding
no tiny tap targets

Remove:

See how it works

from hero CTA area.

Keep nav links only if they work and do not distract.

18. Implementation Plan
Phase 1: Checkpoint

Create checkpoint tag before edits.

Phase 2: Homepage cleanup
remove secondary CTA
fix helper text
fix marquee
add motion
comment out bland section
add FAQ
add footer
add Instagram placeholder/link
Phase 3: Mobile homepage pass
test 390px
remove overflow
tighten hero
simplify trust rail
Phase 4: Onboarding UX pass
logo sizing
mobile layout
validation polish
accessibility
loader sanitization
thank-you copy
Phase 5: SEO pass
metadata
FAQ structure
footer ownership line
no overclaiming
Phase 6: Regression testing
Supabase save
loader
thank-you
mobile
voice
CTA
forbidden copy
Phase 7: Preview deployment only

No production. No domain.

19. Acceptance Criteria
Homepage Passes If
no broken crop at desktop sizes
hero headline fully visible
one primary CTA
no “See how it works” in hero CTA zone
helper copy is clean
marquee works or is removed
logos are visible
no duplicate “Now matching with”
“worth your time” section commented out
FAQ exists
footer exists
Instagram link exists or TODO placeholder is explicit
“A Totem Interactive product” appears
mobile 390px has no horizontal overflow
Onboarding Passes If
logo visually aligned
mobile layout is usable
required fields work
optional URL fields do not block empty
letter counter works
CTA reachable
Supabase save still works
loader still works
thank-you still works
voice either passes or is marked for human confirmation
Backend Regression Passes If
API returns success: true
submissionId returned
row appears in Supabase or proof exists
no fake thank-you on failed save
20. Final Report Required

Return exactly:

branch
checkpoint tag status
commit SHA
build result
preview URL
homepage changes
onboarding changes
mobile QA result
Supabase regression result
loader result
thank-you result
voice result
SEO/FAQ/footer result
Instagram link status
Totem Interactive ownership line status
files changed
screenshots
P0 blockers
P1 issues
P2 polish
confirmation main untouched
confirmation tryfundme.in untouched
final verdict

Allowed verdicts:

READY FOR HUMAN PREVIEW
NOT READY, P0 BLOCKERS
NOT READY, P1 ISSUES
READY FOR DOMAIN CUTOVER REVIEW

Do not say READY FOR DOMAIN CUTOVER REVIEW unless all acceptance criteria pass.

22. Domain Readiness Rule

Only after this UX pass is accepted:

merge to main
verify fundme-ai.vercel.app
connect tryfundme.in
smoke test live domain
post/share publicly

Do not skip directly to domain while the homepage still feels broken.