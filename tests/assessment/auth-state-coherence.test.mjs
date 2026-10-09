import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { forOwner, localReportForViewer } from "../../lib/assessment/owner-scoped.ts";

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

  assert.match(reportSource, /if\s*\(\s*state\.isAuthenticated\s*\)/);
  assert.match(reportSource, /fetch\("\/api\/assessment\/save"/);
  assert.match(reportSource, /if \(!response\.ok \|\| !\(await response\.json\(\)\)\.ok\)/);
  assert.match(reportSource, /Your assessment could not be saved/);
  assert.match(reportSource, /router\.push\(`\/app\/preview/);
});

test("Preview workspace detects returning Clerk users before local-state gates and confirms saves", async () => {
  const source = await readFile(new URL("components/assessment/preview-dashboard.tsx", root), "utf8");

  assert.match(source, /const clerkSync = clerkConfigured \? <ClerkUserSync onSync=\{handleClerkSync\} \/> : null;/);
  assert.ok(source.indexOf("const clerkSync =") < source.indexOf("if (!demoHydrated"));
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
});

test("Public Homepage: navbar and hero adapt intelligently based on product auth state", async () => {
  const homepageSource = await readFile(new URL("components/public/homepage/public-homepage.tsx", root), "utf8");

  assert.match(homepageSource, /useProductAuthState/);
  assert.match(homepageSource, /UserButton/);
  assert.match(homepageSource, /primaryCta/);
  assert.match(homepageSource, /secondaryCta/);
});
