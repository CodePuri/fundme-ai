import assert from "node:assert/strict";
import test from "node:test";

import { buildDossier } from "../../lib/grill/evidence";
import {
  DemoAssessmentRepository,
  GRILL_STORAGE_KEY,
  GRILL_STORAGE_ERROR_SNAPSHOT,
  createBrowserAssessmentRepository,
} from "../../lib/grill/client/repository";
import { createDemoServerProviders } from "../../lib/grill/server/demo-runtime";
import { parsedDeck, parsedProfile, strongIntake } from "./fixtures";

class MemoryStorage {
  private values = new Map<string, string>();
  shouldFail = false;
  shouldFailRead = false;
  shouldFailRemove = false;

  getItem(key: string) {
    if (this.shouldFailRead) throw new DOMException("blocked", "SecurityError");
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    if (this.shouldFail) throw new Error("quota exceeded");
    this.values.set(key, value);
  }

  removeItem(key: string) {
    if (this.shouldFailRemove) throw new DOMException("blocked", "SecurityError");
    this.values.delete(key);
  }
}

test("versioned demo state survives repository recreation", () => {
  const storage = new MemoryStorage();
  const first = new DemoAssessmentRepository(storage);
  const state = first.create(strongIntake);
  const second = new DemoAssessmentRepository(storage);

  assert.equal(second.load()?.schemaVersion, 1);
  assert.equal(second.load()?.sessionId, state.sessionId);
  assert.deepEqual(second.load()?.intake, strongIntake);
});

test("restart clears the current browser report", () => {
  const storage = new MemoryStorage();
  const repository = new DemoAssessmentRepository(storage);
  repository.create(strongIntake);
  repository.clear();

  assert.equal(repository.load(), null);
});

test("storage failures throw and never report fake success", () => {
  const storage = new MemoryStorage();
  storage.shouldFail = true;
  const repository = new DemoAssessmentRepository(storage);

  assert.throws(() => repository.create(strongIntake), /could not be saved/i);
});

test("blocked browser storage is rejected before render-time use", () => {
  const browser = {
    get localStorage(): never {
      throw new DOMException("blocked", "SecurityError");
    },
    dispatchEvent: () => true,
  };

  assert.equal(createBrowserAssessmentRepository(browser), null);
});

test("storage failures after construction become guarded error states", () => {
  const storage = new MemoryStorage();
  const repository = new DemoAssessmentRepository(storage);
  storage.shouldFailRead = true;

  assert.throws(() => repository.load(), /could not be saved/i);
  assert.equal(repository.getSnapshot(), GRILL_STORAGE_ERROR_SNAPSHOT);

  storage.shouldFailRead = false;
  storage.shouldFailRemove = true;
  assert.throws(() => repository.clear(), /could not be saved/i);
});

test("editing intake invalidates an existing report while step-only updates preserve it", () => {
  const storage = new MemoryStorage();
  const repository = new DemoAssessmentRepository(storage);
  const providers = createDemoServerProviders();
  const dossier = buildDossier(strongIntake, [parsedProfile, parsedDeck]);
  const guidance = providers.knowledgeRetriever.retrieve(dossier, 5);
  const report = providers.grillEngine.analyze(dossier, guidance);

  repository.create(strongIntake);
  const analysisId = repository.beginAnalysis(strongIntake);
  repository.saveReport(report, strongIntake, analysisId);
  repository.update(strongIntake, 2, strongIntake);
  assert.equal(repository.load()?.report?.reportId, report.reportId);

  repository.update(
    {
      ...strongIntake,
      startup: { ...strongIntake.startup, traction: "Updated traction evidence" },
    },
    1,
    strongIntake,
  );
  assert.equal(repository.load()?.report, null);
});

test("corrupt persisted step indexes are discarded", () => {
  for (const currentStep of [-1, 1.5, 4]) {
    const storage = new MemoryStorage();
    storage.setItem(
      GRILL_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        sessionId: "demo-corrupt-step",
        currentStep,
        intake: strongIntake,
        report: null,
        activeAnalysisId: null,
      }),
    );

    const repository = new DemoAssessmentRepository(storage);
    assert.equal(repository.load(), null);
    assert.equal(storage.getItem(GRILL_STORAGE_KEY), null);
  }
});

test("a report cannot overwrite intake edited in another tab", () => {
  const storage = new MemoryStorage();
  const repository = new DemoAssessmentRepository(storage);
  const providers = createDemoServerProviders();
  const dossier = buildDossier(strongIntake, [parsedProfile, parsedDeck]);
  const report = providers.grillEngine.analyze(
    dossier,
    providers.knowledgeRetriever.retrieve(dossier, 5),
  );
  const editedIntake = {
    ...strongIntake,
    startup: { ...strongIntake.startup, name: "Edited in another tab" },
  };

  repository.create(strongIntake);
  const analysisId = repository.beginAnalysis(strongIntake);
  repository.update(editedIntake, 1, strongIntake);

  assert.throws(
    () => repository.saveReport(report, strongIntake, analysisId),
    /intake changed/i,
  );
  assert.equal(repository.load()?.intake.startup.name, "Edited in another tab");
  assert.equal(repository.load()?.report, null);
});

test("a superseded analysis cannot save a report for different tab artifacts", () => {
  const storage = new MemoryStorage();
  const firstTab = new DemoAssessmentRepository(storage);
  const secondTab = new DemoAssessmentRepository(storage);
  const providers = createDemoServerProviders();
  const dossier = buildDossier(strongIntake, [parsedProfile, parsedDeck]);
  const report = providers.grillEngine.analyze(
    dossier,
    providers.knowledgeRetriever.retrieve(dossier, 5),
  );

  firstTab.create(strongIntake);
  const firstAnalysisId = firstTab.beginAnalysis(strongIntake);
  const secondAnalysisId = secondTab.beginAnalysis(strongIntake);

  assert.throws(
    () => firstTab.saveReport(report, strongIntake, firstAnalysisId),
    /superseded/i,
  );
  secondTab.saveReport(report, strongIntake, secondAnalysisId);
  assert.equal(secondTab.load()?.report?.reportId, report.reportId);
});

test("concurrent tab edits merge unrelated intake fields without restoring stale values", () => {
  const storage = new MemoryStorage();
  const firstTab = new DemoAssessmentRepository(storage);
  const secondTab = new DemoAssessmentRepository(storage);

  firstTab.create(strongIntake);
  const firstView = firstTab.load()?.intake;
  const secondView = secondTab.load()?.intake;
  assert.ok(firstView);
  assert.ok(secondView);

  secondTab.update(
    {
      ...secondView,
      startup: { ...secondView.startup, name: "Changed in tab B" },
    },
    1,
    secondView,
  );
  firstTab.update(
    {
      ...firstView,
      founder: { ...firstView.founder, role: "Changed in tab A" },
    },
    0,
    firstView,
  );

  assert.equal(firstTab.load()?.intake.startup.name, "Changed in tab B");
  assert.equal(firstTab.load()?.intake.founder.role, "Changed in tab A");
});
