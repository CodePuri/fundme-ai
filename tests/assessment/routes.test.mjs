import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

test("homepage assessment calls to action start at the approved intake", async () => {
  const source = await readFile(new URL("components/public/homepage/public-homepage.tsx", root), "utf8");
  assert.doesNotMatch(source, /\/onboarding/);
  assert.match(source, /href="\/assessment"/);
  assert.doesNotMatch(source, /useSyncExternalStore/);
});

test("the Preview assessment is public without opening authenticated app routes", async () => {
  const middleware = await readFile(new URL("middleware.ts", root), "utf8");
  assert.match(middleware, /"\/assessment\(\.\*\)"/);
  assert.doesNotMatch(middleware, /"\/app\(\.\*\)"/);
});

test("legacy assessment pages are redirects without mock scoring or paywalls", async () => {
  for (const [name, destination] of [["questions", "mentor"], ["analyzing", "result"], ["report", "result"]]) {
    const source = await readFile(new URL(`app/assessment/${name}/page.tsx`, root), "utf8");
    assert.match(source, new RegExp(`redirect\\(\"/assessment/${destination}\"\\)`));
    assert.doesNotMatch(source, /Math\.random|paywall|creditsRemaining|generateMockReport/);
  }
});

test("approved routes contain no random scoring, live database, or payment dependency", async () => {
  const files = [
    "components/assessment/assessment-provider.tsx",
    "components/assessment/mentor-experience.tsx",
    "components/assessment/funding-readiness-report.tsx",
    "lib/assessment/engine.ts",
  ];
  const source = (await Promise.all(files.map((file) => readFile(new URL(file, root), "utf8")))).join("\n");
  assert.doesNotMatch(source, /Math\.random|from ["'][^"']*(?:supabase|stripe|clerk)|checkout\s*\(/i);
});

test("assessment intake reads homepage context through the guarded storage adapter", async () => {
  const source = await readFile(new URL("components/assessment/intake-grid.tsx", root), "utf8");
  assert.match(source, /getBrowserStorage\(window\)/);
  assert.match(source, /readStorageItem\(/);
  assert.doesNotMatch(source, /window\.localStorage\.getItem\(/);
});
