import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { forOwner, localReportForViewer, reportForViewer } from "../../lib/assessment/owner-scoped.ts";

const root = new URL("../../", import.meta.url);

test("Product Auth State: exposes all 6 required lifecycle states", async () => {
  const source = await readFile(new URL("lib/hooks/use-product-auth-state.ts", root), "utf8");
  
  assert.match(source, /"anonymous_clean"/);
  assert.match(source, /"anonymous_in_progress"/);
  assert.match(source, /"anonymous_with_result"/);
  assert.match(source, /"authenticated_no_assessment"/);
  assert.match(source, /"authenticated_with_saved"/);
  assert.match(source, /"authenticated_fresh_result"/);
  assert.match(source, /Open my assessment/);
  assert.match(source, /Assess another startup/);
});

test("Sign-in & Sign-up routes: redirect already-authenticated users to their workspace", async () => {
  const signInSource = await readFile(new URL("app/sign-in/[[...sign-in]]/page.tsx", root), "utf8");
  const signUpSource = await readFile(new URL("app/sign-up/[[...sign-up]]/page.tsx", root), "utf8");

  assert.match(signInSource, /if\s*\(\s*userId\s*\)/);
  assert.match(signInSource, /redirect\("\/app\/preview"\)/);
  assert.match(signUpSource, /if\s*\(\s*userId\s*\)/);
  assert.match(signUpSource, /redirect\("\/app\/preview"\)/);
});

test("Funding readiness report: authenticated users save directly without redundant modal prompt", async () => {
  const reportSource = await readFile(new URL("components/assessment/funding-readiness-report.tsx", root), "utf8");

  assert.match(reportSource, /if\s*\(\s*viewerId\s*\)/);
  assert.match(reportSource, /if\s*\(\s*state\.isAuthenticated\s*\)\s*\{\s*router\.push\("\/app\/preview"\)/);
  assert.match(reportSource, /fetch\("\/api\/assessment\/save"/);
  assert.equal(reportSource.match(/fetch\("\/api\/assessment\/save"/g)?.length, 1);
  assert.match(reportSource, /if \(!response\.ok \|\| !\(await response\.json\(\)\)\.ok\)/);
  assert.match(reportSource, /Your assessment could not be saved/);
  assert.match(reportSource, /router\.push\(`\/app\/preview/);
});

test("Preview workspace detects returning Clerk users before local-state gates and confirms saves", async () => {
  const source = await readFile(new URL("components/assessment/preview-dashboard.tsx", root), "utf8");

  assert.match(source, /const \{ isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, user \} = useUser\(\);/);
  assert.doesNotMatch(source, /ClerkUserSync/);
  assert.match(source, /if \(!clerkLoaded \|\| !isSignedIn \|\| !user\?\.id \|\| !assessmentHydrated\) return;/);
  assert.match(source, /if \(!saveResponse\.ok \|\| !\(await saveResponse\.json\(\)\)\.ok\)/);
  assert.ok(source.indexOf("if (!saveResponse.ok") < source.indexOf('removeItem("fundme-claim-token")'));
  assert.match(source, /fetch\("\/api\/assessment\/latest", \{ cache: "no-store" \}\)/);
  assert.doesNotMatch(source, /fetch\(`\/api\/assessment\/latest\$\{/);
  assert.match(source, /Preview assessment \(this browser\)/);
});

test("Preview workspace never shows another Clerk user's cached server or browser report", () => {
  const accountA = { ownerId: "user_a", assessment: { verdict: "private to A" } };
  const localReport = { verdict: "browser report from A" };

  assert.equal(forOwner(accountA, "user_b"), null);
  assert.equal(forOwner(accountA, null), null);
  assert.equal(forOwner(accountA, "user_a"), accountA);
  assert.equal(localReportForViewer(localReport, true), null);
  assert.equal(localReportForViewer(localReport, false), localReport);
  assert.equal(localReportForViewer(localReport, false, "user_a"), null);
  assert.equal(reportForViewer(localReport, "user_a", "user_b"), null);
  assert.equal(reportForViewer(localReport, "user_a", null), null);
  assert.equal(reportForViewer(localReport, "user_a", "user_a"), localReport);
  assert.equal(reportForViewer(localReport, null, "user_a"), null);
  assert.equal(reportForViewer(localReport, null, null), localReport);
});

test("Saved-report links stay in the account-scoped workspace", async () => {
  const dashboard = await readFile(new URL("components/assessment/preview-dashboard.tsx", root), "utf8");
  const result = await readFile(new URL("app/assessment/result/page.tsx", root), "utf8");
  const analysis = await readFile(new URL("app/assessment/analyzing/page.tsx", root), "utf8");
  const viewer = await readFile(new URL("lib/assessment/viewer.ts", root), "utf8");

  assert.match(dashboard, /id="diagnostic"/);
  assert.match(dashboard, /href="#diagnostic"/);
  assert.doesNotMatch(dashboard, /href="\/assessment\/result"/);
  assert.match(result, /FundingReadinessReport viewerId=\{userId\} identityResolved=\{resolved\}/);
  assert.match(analysis, /AnalysisProgress ownerId=\{userId\} identityResolved=\{resolved\}/);
  assert.match(viewer, /!process\.env\.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \|\| !process\.env\.CLERK_SECRET_KEY/);
  assert.match(viewer, /userId: null, resolved: false/);
});

test("anonymous save requires a matching intent and account drafts stay separate", async () => {
  const dashboard = await readFile(new URL("components/assessment/preview-dashboard.tsx", root), "utf8");
  const result = await readFile(new URL("components/assessment/funding-readiness-report.tsx", root), "utf8");
  const provider = await readFile(new URL("components/assessment/assessment-provider.tsx", root), "utf8");
  const intake = await readFile(new URL("components/assessment/intake-grid.tsx", root), "utf8");
  const onboarding = await readFile(new URL("components/assessment/onboarding-bridge.ts", root), "utf8");
  const demo = await readFile(new URL("components/app/demo-provider.tsx", root), "utf8");
  const thankYou = await readFile(new URL("app/thank-you/page.tsx", root), "utf8");
  const onboardingPage = await readFile(new URL("app/onboarding/page.tsx", root), "utf8");
  const frame = await readFile(new URL("components/app/dashboard-frame.tsx", root), "utf8");

  assert.match(result, /PENDING_ASSESSMENT_SAVE_KEY/);
  assert.match(result, /crypto\.randomUUID\(\)/);
  assert.match(dashboard, /candidate\.report\?\.generatedAt === intent\.generatedAt/);
  assert.match(dashboard, /const claimToken = pendingClaimToken \|\| urlClaimToken/);
  assert.match(provider, /assessmentStorageForViewer\(window\.localStorage, viewerId\)/);
  assert.match(provider, /if \(hasExistingDraft\)/);
  assert.match(intake, /if \(!hasHydrated \|\| viewerId \|\| session\.input\.websiteUrl/);
  assert.match(onboarding, /assessmentStorageForViewer\(window\.localStorage, userId\)/);
  assert.match(demo, /browserKeyForViewer\(STORAGE_KEY, viewerId\)/);
  assert.match(demo, /state: hasHydrated \? state : defaultState/);
  assert.match(thankYou, /browserKeyForViewer\(ONBOARDING_DRAFT_KEY, user\?\.id \?\? null\)/);
  assert.match(thankYou, /draftRecord\?\.identityKey === identityKey/);
  assert.match(onboardingPage, /signal: controller\.signal/);
  assert.match(onboardingPage, /currentIdentityRef\.current !== submittedIdentity/);
  assert.ok(onboardingPage.indexOf("completeOnboarding({", onboardingPage.indexOf("async function finishOnboarding"))
    > onboardingPage.indexOf("if (controller.signal.aborted || currentIdentityRef.current !== submittedIdentity) return;", onboardingPage.indexOf("async function finishOnboarding")));
  assert.match(frame, /readStorageItem\(getBrowserStorage\(window\), resumeKey\)/);
});

test("Public Homepage: navbar and hero adapt intelligently based on product auth state", async () => {
  const homepageSource = await readFile(new URL("components/public/homepage/public-homepage.tsx", root), "utf8");

  assert.match(homepageSource, /useProductAuthState/);
  assert.match(homepageSource, /UserButton/);
  assert.match(homepageSource, /primaryCta/);
  assert.match(homepageSource, /secondaryCta/);
});
