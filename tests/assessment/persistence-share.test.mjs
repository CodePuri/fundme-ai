import assert from "node:assert/strict";
import test from "node:test";

async function loadAdapters() {
  try {
    return {
      ...(await import("../../lib/assessment/persistence.ts")),
      ...(await import("../../lib/assessment/share.ts")),
      ...(await import("../../lib/assessment/engine.ts")),
    };
  } catch {
    return {
      GRILL_STORAGE_KEY: "missing",
      createInitialSession: () => ({}),
      loadSession: () => ({}),
      saveSession: () => ({ ok: false }),
      clearSession: () => {},
      serializeReport: () => "",
      shareReport: async () => "failed",
      createPreviewReferralCode: () => "",
      assessSession: () => null,
    };
  }
}

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values,
  };
}

test("round-trips a versioned session and recovers from invalid storage", async () => {
  const adapters = await loadAdapters();
  const storage = memoryStorage();
  const session = adapters.createInitialSession("2026-07-23T00:00:00.000Z");
  session.input.startupName = "SignalStack";

  assert.deepEqual(adapters.saveSession(storage, session), { ok: true, error: null });
  assert.deepEqual(adapters.loadSession(storage), session);

  storage.setItem(adapters.GRILL_STORAGE_KEY, "not-json");
  assert.equal(adapters.loadSession(storage).stage, "intake");
  adapters.clearSession(storage);
  assert.equal(storage.getItem(adapters.GRILL_STORAGE_KEY), null);
});

test("serializes a truthful portable report", async () => {
  const { serializeReport } = await loadAdapters();
  const text = serializeReport({
    rubricVersion: "fundme-demo-rubric@1",
    generatedAt: "2026-07-23T00:00:00.000Z",
    readinessScore: 64,
    verdict: "Promising, with evidence gaps",
    conciseVerdict: "Preview evidence only.",
    evidenceCoverage: 67,
    confidence: "medium",
    completionState: "partial",
    tractionState: "missing",
    strongestDimension: "problem-clarity",
    weakestDimension: "traction-proof",
    dimensions: [{ id: "traction-proof", label: "Traction proof", score: 30, explanation: "Missing metrics.", evidenceUsed: [], missingEvidence: ["Revenue"] }],
    evidence: [],
    findings: [],
    founderReview: { credibility: "Limited", founderMarketFit: "Limited", profilePositioning: "Limited" },
    startupReview: { problem: "Clear", solution: "Clear", market: "Limited", differentiation: "Limited", traction: "Limited", fundingNarrative: "Limited" },
    deckReview: { status: "not-provided", summary: "No deck was provided.", findings: [] },
    actions: [{ horizon: "fix-now", title: "Add traction", detail: "Add one verified metric." }],
  });

  assert.match(text, /FundMe Funding Readiness Preview/);
  assert.match(text, /64\/100/);
  assert.match(text, /fundme-demo-rubric@1/);
  assert.match(text, /Add traction/);
  assert.match(text, /Assessment state: partial/);
  assert.match(text, /Deck review/);
  assert.match(text, /Founder review/);
});

test("uses native share and falls back to clipboard on rejection", async () => {
  const { shareReport } = await loadAdapters();
  const copied = [];
  assert.equal(await shareReport({ title: "Report", text: "Evidence", share: async () => {}, writeText: async (value) => copied.push(value) }), "shared");
  assert.equal(await shareReport({ title: "Report", text: "Evidence", share: async () => { throw new Error("cancelled"); }, writeText: async (value) => copied.push(value) }), "copied");
  assert.deepEqual(copied, ["Evidence"]);
});

test("creates a stable, clearly Preview-only referral code", async () => {
  const { createPreviewReferralCode } = await loadAdapters();
  const first = createPreviewReferralCode("Founder@Example.com ");
  assert.match(first, /^PREVIEW-[A-Z0-9]{8}$/);
  assert.equal(first, createPreviewReferralCode("founder@example.com"));
  assert.notEqual(first, createPreviewReferralCode("other@example.com"));
});

test("rejects and clears malformed current-version sessions without crashing recovery", async () => {
  const adapters = await loadAdapters();
  const valid = adapters.createInitialSession("2026-07-23T00:00:00.000Z");
  const malformed = [
    { ...valid, input: { ...valid.input, founderName: undefined } },
    { ...valid, artifacts: [{}] },
    { ...valid, conversation: [{ role: "founder", content: 42 }] },
    { ...valid, processingState: "teleporting" },
    { ...valid, earlyAccess: { status: "success" } },
    { ...valid, input: { ...valid.input, profileText: "x".repeat(20_001) } },
  ];

  for (const payload of malformed) {
    const storage = memoryStorage({ [adapters.GRILL_STORAGE_KEY]: JSON.stringify(payload) });
    const recovered = adapters.loadSession(storage);
    assert.equal(recovered.stage, "intake");
    assert.match(recovered.persistenceWarning, /invalid|recover/i);
    assert.equal(storage.getItem(adapters.GRILL_STORAGE_KEY), null);

    const freshAfterRemoval = adapters.loadSession(storage);
    assert.equal(freshAfterRemoval.stage, "intake");
    assert.equal(freshAfterRemoval.processingState, "preparing");
    assert.equal(freshAfterRemoval.persistenceWarning, null);
  }
});

test("recovers from corrupt JSON and invalid storage access", async () => {
  const adapters = await loadAdapters();
  const corrupt = memoryStorage({ [adapters.GRILL_STORAGE_KEY]: "not-json" });
  assert.equal(adapters.loadSession(corrupt).stage, "intake");
  assert.equal(corrupt.getItem(adapters.GRILL_STORAGE_KEY), null);

  const unavailable = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); },
  };
  assert.match(adapters.loadSession(unavailable).persistenceWarning, /unavailable/i);
});

test("uses one safe adapter for browser storage discovery and non-session reads", async () => {
  const adapters = await loadAdapters();
  const storage = memoryStorage({ "fundme-homepage-website": "signalstack.example" });

  assert.equal(adapters.getBrowserStorage({ localStorage: storage }), storage);
  assert.deepEqual(
    adapters.readStorageItem(storage, "fundme-homepage-website"),
    { ok: true, value: "signalstack.example" },
  );
  assert.deepEqual(adapters.readStorageItem(null, "fundme-homepage-website"), { ok: false, value: null });

  const blockedWindow = {};
  Object.defineProperty(blockedWindow, "localStorage", {
    get() { throw new DOMException("blocked", "SecurityError"); },
  });
  assert.equal(adapters.getBrowserStorage(blockedWindow), null);

  const blockedStorage = {
    getItem() { throw new DOMException("blocked", "SecurityError"); },
    setItem() {},
    removeItem() {},
  };
  assert.deepEqual(adapters.readStorageItem(blockedStorage, "fundme-homepage-website"), { ok: false, value: null });
});

test("rejects a same-version session missing the required processing state", async () => {
  const adapters = await loadAdapters();
  const malformed = adapters.createInitialSession("2026-07-23T00:00:00.000Z");
  malformed.stage = "review";
  malformed.input.startupName = "SignalStack";
  malformed.input.founderName = "Asha Rao";
  malformed.input.founderRole = "Founder";
  malformed.input.description = "We help procurement teams validate vendor evidence.";
  delete malformed.processingState;
  const storage = memoryStorage({ [adapters.GRILL_STORAGE_KEY]: JSON.stringify(malformed) });

  const recovered = adapters.loadSession(storage);
  assert.equal(recovered.stage, "intake");
  assert.equal(recovered.processingState, "recoverable");
  assert.match(recovered.persistenceWarning, /invalid|removed/i);
  assert.equal(storage.getItem(adapters.GRILL_STORAGE_KEY), null);
});

test("rejects same-version sessions with incoherent lifecycle fields", async () => {
  const adapters = await loadAdapters();
  const base = adapters.createInitialSession("2026-07-23T00:00:00.000Z");
  const reviewed = {
    ...base,
    stage: "mentor",
    processingState: "ready",
    input: {
      ...base.input,
      startupName: "SignalStack",
      founderName: "Asha Rao",
      founderRole: "Founder",
      description: "We help procurement teams validate vendor evidence.",
    },
    reviewedAt: "2026-07-23T00:30:00.000Z",
  };
  const report = adapters.assessSession(reviewed, "2026-07-23T01:00:00.000Z");
  const validResult = {
    ...reviewed,
    stage: "result",
    processingState: report.completionState,
    report,
  };
  const validStorage = memoryStorage({ [adapters.GRILL_STORAGE_KEY]: JSON.stringify(validResult) });
  assert.deepEqual(adapters.loadSession(validStorage), validResult);
  const assessingResult = { ...reviewed, stage: "result", processingState: "assessing", report: null };
  const assessingStorage = memoryStorage({ [adapters.GRILL_STORAGE_KEY]: JSON.stringify(assessingResult) });
  assert.deepEqual(adapters.loadSession(assessingStorage), assessingResult);

  const malformed = [
    { ...validResult, stage: "intake" },
    { ...validResult, stage: "review" },
    { ...validResult, stage: "mentor" },
    { ...validResult, processingState: "assessing" },
    { ...validResult, processingState: report.completionState === "partial" ? "complete" : "partial" },
    { ...reviewed, stage: "result", processingState: "partial", report: null },
    { ...reviewed, reviewedAt: null },
  ];

  for (const payload of malformed) {
    const storage = memoryStorage({ [adapters.GRILL_STORAGE_KEY]: JSON.stringify(payload) });
    const recovered = adapters.loadSession(storage);
    assert.equal(recovered.stage, "intake");
    assert.equal(recovered.processingState, "recoverable");
    assert.match(recovered.persistenceWarning, /invalid|removed/i);
    assert.equal(storage.getItem(adapters.GRILL_STORAGE_KEY), null);
  }
});

test("confirms early-access success only after browser storage succeeds", async () => {
  const adapters = await loadAdapters();
  const session = adapters.createInitialSession("2026-07-23T00:00:00.000Z");
  const storage = memoryStorage();

  const invalid = adapters.persistEarlyAccess(storage, session, "not-an-email", "2026-07-23T00:30:00.000Z");
  assert.equal(invalid.ok, false);
  assert.equal(invalid.session.earlyAccess.status, "error");
  assert.equal(storage.getItem(adapters.GRILL_STORAGE_KEY), null);

  const success = adapters.persistEarlyAccess(storage, session, "founder@example.com", "2026-07-23T01:00:00.000Z");
  assert.equal(success.ok, true);
  assert.equal(success.session.earlyAccess.status, "success");
  assert.match(storage.getItem(adapters.GRILL_STORAGE_KEY), /founder@example\.com/);

  const failingStorage = { ...memoryStorage(), setItem() { throw new Error("quota"); } };
  const failure = adapters.persistEarlyAccess(failingStorage, session, "founder@example.com", "2026-07-23T01:00:00.000Z");
  assert.equal(failure.ok, false);
  assert.equal(failure.session.earlyAccess.status, "error");
  assert.equal(failure.session.earlyAccess.email, "founder@example.com");
  assert.match(failure.error, /not saved/i);

  const unavailable = adapters.persistEarlyAccess(null, session, "founder@example.com", "2026-07-23T01:00:00.000Z");
  assert.equal(unavailable.ok, false);
  assert.equal(unavailable.session.earlyAccess.status, "error");

  const failedSessionAfterProviderWarning = {
    ...failure.session,
    persistenceWarning: "Progress could not be saved in this browser.",
  };
  const retry = adapters.persistEarlyAccess(storage, failedSessionAfterProviderWarning, "founder@example.com", "2026-07-23T02:00:00.000Z");
  assert.equal(retry.ok, true);
  assert.equal(retry.session.earlyAccess.status, "success");
  assert.equal(retry.session.persistenceWarning, null);
  assert.equal(JSON.parse(storage.getItem(adapters.GRILL_STORAGE_KEY)).persistenceWarning, null);
});

test("preserves and recovers historical reports from legacy rubric versions", async () => {
  const adapters = await loadAdapters();
  const session = adapters.createInitialSession("2026-07-23T00:00:00.000Z");
  const reviewed = { ...session, stage: "result", reviewedAt: "2026-07-23T00:10:00.000Z" };
  const currentReport = adapters.assessSession(session, "2026-07-23T00:10:00.000Z");
  
  // Historical report with legacy rubric version
  const legacyReport = {
    ...currentReport,
    rubricVersion: "fundme-demo-rubric@1",
  };
  const legacyPayload = {
    ...reviewed,
    processingState: legacyReport.completionState,
    report: legacyReport,
  };
  
  const storage = memoryStorage({ [adapters.GRILL_STORAGE_KEY]: JSON.stringify(legacyPayload) });
  const loaded = adapters.loadSession(storage);
  assert.equal(loaded.stage, "result");
  assert.equal(loaded.report?.rubricVersion, "fundme-demo-rubric@1");
  assert.equal(loaded.report?.readinessScore, legacyReport.readinessScore);
});
