import assert from "node:assert/strict";
import test from "node:test";

test("website ingestion normalizes URLs and strips HTML tags cleanly", async () => {
  const { normalizeUrl, stripHtml } = await import("../../lib/ingestion/website.ts");

  assert.equal(normalizeUrl("mycoolstartup.com"), "https://mycoolstartup.com");
  assert.equal(normalizeUrl("http://mycoolstartup.com"), "http://mycoolstartup.com");
  assert.equal(normalizeUrl("https://mycoolstartup.com/app"), "https://mycoolstartup.com/app");
  assert.equal(normalizeUrl(""), "");

  const rawHtml = `
    <html>
      <head><style>body { color: red; }</style></head>
      <body>
        <nav><a href="/">Home</a></nav>
        <h1>Welcome to SignalStack</h1>
        <p>Real-time &amp; automated <b>vendor reviews</b> for enterprise teams.</p>
        <script>console.log("secret");</script>
        <footer>Copyright 2026</footer>
      </body>
    </html>
  `;
  const clean = stripHtml(rawHtml);
  assert.match(clean, /Welcome to SignalStack/);
  assert.match(clean, /Real-time & automated vendor reviews for enterprise teams/);
  assert.doesNotMatch(clean, /body \{ color: red; \}/);
  assert.doesNotMatch(clean, /console\.log/);
  assert.doesNotMatch(clean, /Copyright 2026/);
});

test("founder profile ingestion detects years of experience, leadership, and background signals", async () => {
  const { ingestFounderProfile } = await import("../../lib/ingestion/founder.ts");

  const profile = ingestFounderProfile(
    "Asha Rao",
    "Founder & CEO",
    "12 years of experience leading enterprise procurement at Google and Flipkart. Alumnus of IIT Bombay. Shipped AI workflows at scale.",
    "https://linkedin.com/in/asha-rao"
  );

  assert.equal(profile.founderName, "Asha Rao");
  assert.equal(profile.founderRole, "Founder & CEO");
  assert.equal(profile.linkedInUrl, "https://linkedin.com/in/asha-rao");
  assert.equal(profile.extractedYearsOfExperience, 12);
  assert.ok(profile.detectedSignals.includes("leadership-or-founder-history"));
  assert.ok(profile.detectedSignals.includes("technical-or-academic-background"));
  assert.ok(profile.detectedSignals.includes("technical-depth"));
  assert.ok(profile.previousCompaniesOrRoles.includes("Google") || profile.previousCompaniesOrRoles.includes("Flipkart"));
});
