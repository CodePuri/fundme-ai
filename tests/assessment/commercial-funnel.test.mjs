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
  assert.match(intake, /Founder profile/);
  assert.match(intake, /Startup website/);
  assert.match(intake, /Pitch deck/);
  assert.match(intake, /Optional sources/);
  assert.match(intake, /How profile sources work/);
  assert.doesNotMatch(intake, /Get a deterministic funding-readiness diagnosis/);
  assert.doesNotMatch(intake, /No long questionnaire/);
  assert.doesNotMatch(intake, /Review context|Continue to mentor/);
  assert.match(analyzing, /Analyzing your funding fit/);
  assert.match(analyzing, /role="progressbar"/);
  assert.doesNotMatch(analyzing, /stages\.map/);
  assert.doesNotMatch(analyzing, /fundme-demo-rubric/);
  assert.match(report, /Save assessment &amp; see matches|Save assessment & see matches/);
  assert.doesNotMatch(report, /Early access-email|Save Preview interest/);
});

test("the diagnosis exposes compact evidence, actions, and the FundMe opportunity moat", async () => {
  const [report, fixtures] = await Promise.all([
    source("components/assessment/funding-readiness-report.tsx"),
    source("lib/assessment/preview-matches.ts"),
  ]);

  for (const phrase of [
    "Funding Readiness Score",
    "Strongest signal",
    "Biggest risk",
    "Evidence coverage",
    "Missing proof",
    "Best next move",
    "Preview opportunities",
    "Investors and VC firms",
    "Accelerators",
    "Incubators",
    "Grants and government programs",
  ]) {
    assert.match(`${report}\n${fixtures}`, new RegExp(phrase));
  }
  assert.match(report, /Preview example/);
  assert.match(report, /Preview methodology/);
  assert.match(report, /<details/);
  const dimensionSummary = report.match(/<summary className="cursor-pointer list-none[\s\S]*?<\/summary>/)?.[0] ?? "";
  assert.doesNotMatch(dimensionSummary, /dimension\.explanation/);
  assert.match(report, /compactMatchReason\(match\.category\)/);
  assert.doesNotMatch(report, /\{match\.previewSignal\} · \{match\.sourceStatus\}/);
  assert.doesNotMatch(report, /live verified|verified matches/i);
  assert.doesNotMatch(report, /Deterministic Preview fixtures/);
  assert.doesNotMatch(report, /rubric version/i);
  assert.doesNotMatch(fixtures, /fitScore|baseFit|readinessAdjustment/);
});

test("the Preview dashboard is premium, compact, and groups the locked workspace", async () => {
  const sourceText = await source("components/assessment/preview-dashboard.tsx");

  assert.match(sourceText, /Saved assessment/);
  assert.match(sourceText, /Top opportunities/);
  assert.match(sourceText, /View assessment/);
  assert.match(sourceText, /Optimize/);
  assert.match(sourceText, /Reach/);
  assert.match(sourceText, /Manage/);
  assert.match(sourceText, /Preview example/);
  assert.doesNotMatch(sourceText, /Tab-local Preview workspace/);
  assert.doesNotMatch(sourceText, /deterministic fixtures/);
  assert.doesNotMatch(sourceText, /Browser persistence/);
  assert.doesNotMatch(sourceText, /LOCKED_ACTIONS/);
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
  assert.match(report, /Google sign-in isn’t configured for this Preview/);
  assert.doesNotMatch(report, /tab-local demo identity/);
});

test("the auth handoff is storage-truthful and traps keyboard focus", async () => {
  const report = await source("components/assessment/funding-readiness-report.tsx");

  assert.match(report, /session\.persistenceWarning/);
  assert.match(report, /browser persistence was not confirmed/i);
  assert.match(report, /focusableSelectors/);
  assert.match(report, /dialogRef/);
  assert.match(report, /authTriggerRef/);
  assert.match(report, /inert=\{authOpen\}/);
  assert.match(report, /Save your assessment/);
  assert.match(report, /Your assessment is not shared or published/);
});

test("the Preview identity tolerates browser storage denial", async () => {
  const provider = await source("components/app/demo-provider.tsx");

  assert.match(provider, /try\s*\{[\s\S]*localStorage\.getItem/);
  assert.match(provider, /try\s*\{[\s\S]*localStorage\.setItem/);
});
