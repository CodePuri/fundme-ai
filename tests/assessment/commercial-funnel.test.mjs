import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(pathname) {
  return readFile(new URL(pathname, root), "utf8");
}

test("the commercial funnel is value-first and removes mentor/chat from the free assessment", async () => {
  const [intake, analyzing, report] = await Promise.all([
    source("components/assessment/intake-grid.tsx"),
    source("components/assessment/analysis-progress.tsx"),
    source("components/assessment/funding-readiness-report.tsx"),
  ]);

  assert.match(intake, /Analyze my funding fit/);
  assert.match(intake, /LinkedIn|profile/i);
  assert.doesNotMatch(intake, /Review context|Continue to mentor/);
  assert.match(analyzing, /Scoring funding readiness/);
  assert.match(report, /Save my assessment and see my matches/);
  assert.doesNotMatch(report, /Early access-email|Save Preview interest/);
});

test("the diagnosis exposes compact evidence, actions, and the FundMe opportunity moat", async () => {
  const [report, fixtures] = await Promise.all([
    source("components/assessment/funding-readiness-report.tsx"),
    source("lib/assessment/preview-matches.ts"),
  ]);

  for (const phrase of [
    "Funding Readiness Score",
    "What is missing",
    "How to improve it",
    "illustrative Preview opportunities",
    "Investors and VC firms",
    "Accelerators",
    "Incubators",
    "Grants and government programs",
  ]) {
    assert.match(`${report}\n${fixtures}`, new RegExp(phrase));
  }
  assert.match(report, /Preview fixtures|Preview data/);
  assert.doesNotMatch(report, /live verified|verified matches/i);
  assert.doesNotMatch(fixtures, /fitScore|baseFit|readinessAdjustment/);
});

test("the Preview dashboard is compact, transparent, and keeps optimization locked", async () => {
  const sourceText = await source("components/assessment/preview-dashboard.tsx");

  assert.match(sourceText, /Saved assessment/);
  assert.match(sourceText, /Limited Preview matches/);
  assert.match(sourceText, /Open public Explore/);
  assert.match(sourceText, /Early access|Upgrade required/);
  assert.doesNotMatch(sourceText, /checkout|stripe|Supabase/i);
});

test("Clerk is conditional and the browser-local profile is never called Google authentication", async () => {
  const [provider, report] = await Promise.all([
    source("components/providers/route-clerk-provider.tsx"),
    source("components/assessment/funding-readiness-report.tsx"),
  ]);

  assert.match(provider, /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/);
  assert.match(report, /Continue with Google/);
  assert.match(report, /Continue with Preview profile/);
  assert.match(report, /tab-local|local Preview/i);
});

test("the auth handoff is storage-truthful and traps keyboard focus", async () => {
  const report = await source("components/assessment/funding-readiness-report.tsx");

  assert.match(report, /session\.persistenceWarning/);
  assert.match(report, /browser persistence was not confirmed/i);
  assert.match(report, /focusableSelectors/);
  assert.match(report, /dialogRef/);
  assert.match(report, /authTriggerRef/);
  assert.match(report, /inert=\{authOpen\}/);
});

test("the Preview identity tolerates browser storage denial", async () => {
  const provider = await source("components/app/demo-provider.tsx");

  assert.match(provider, /try\s*\{[\s\S]*localStorage\.getItem/);
  assert.match(provider, /try\s*\{[\s\S]*localStorage\.setItem/);
});
