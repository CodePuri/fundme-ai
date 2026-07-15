import type { AssessmentRepository } from "../contracts";
import type {
  FounderIntake,
  GrillIntake,
  GrillReport,
  PersistedGrillState,
  StartupIntake,
} from "../types";
import { isGrillReport, parseGrillIntake } from "../validation";

export const GRILL_STORAGE_KEY = "fundme.grill.demo.v1";
export const GRILL_STORAGE_EVENT = "fundme:grill-storage";
export const GRILL_STORAGE_ERROR_SNAPSHOT = "__fundme_grill_storage_error__";
export const GRILL_STORAGE_ERROR_MESSAGE =
  "Your demo could not be saved in this browser. Check storage permissions and try again.";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type BrowserStorageHost = {
  readonly localStorage: StorageLike;
  dispatchEvent(event: Event): boolean;
};

export class DemoPersistenceError extends Error {
  constructor(cause?: unknown) {
    super(GRILL_STORAGE_ERROR_MESSAGE, {
      cause,
    });
    this.name = "DemoPersistenceError";
  }
}

export class StaleAnalysisError extends Error {
  constructor(message = "The intake changed while this report was being generated. Run the Grill again.") {
    super(message);
    this.name = "StaleAnalysisError";
  }
}

export class StaleIntakeError extends Error {
  constructor(field: string) {
    super(`This ${field} field changed in another tab. Review the latest value and try again.`);
    this.name = "StaleIntakeError";
  }
}

const FOUNDER_KEYS: Array<keyof FounderIntake> = [
  "fullName",
  "role",
  "background",
  "yearsExperience",
  "achievements",
  "profileText",
];
const STARTUP_KEYS: Array<keyof StartupIntake> = [
  "name",
  "website",
  "oneLinePitch",
  "problem",
  "solution",
  "targetCustomer",
  "market",
  "stage",
  "traction",
  "revenueOrUsers",
  "team",
  "fundingAsk",
  "useOfFunds",
];

function mergeIntake(
  current: GrillIntake,
  expected: GrillIntake,
  next: GrillIntake,
) {
  const founder = { ...current.founder };
  for (const key of FOUNDER_KEYS) {
    if (Object.is(next.founder[key], expected.founder[key])) continue;
    if (
      !Object.is(current.founder[key], expected.founder[key]) &&
      !Object.is(current.founder[key], next.founder[key])
    ) {
      throw new StaleIntakeError(`founder ${key}`);
    }
    (founder[key] as FounderIntake[typeof key]) = next.founder[key];
  }

  const startup = { ...current.startup };
  for (const key of STARTUP_KEYS) {
    if (Object.is(next.startup[key], expected.startup[key])) continue;
    if (
      !Object.is(current.startup[key], expected.startup[key]) &&
      !Object.is(current.startup[key], next.startup[key])
    ) {
      throw new StaleIntakeError(`startup ${key}`);
    }
    startup[key] = next.startup[key];
  }

  return { founder, startup };
}

function isPersistedState(value: unknown): value is PersistedGrillState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<PersistedGrillState>;
  return (
    candidate.schemaVersion === 1 &&
    typeof candidate.sessionId === "string" &&
    Number.isInteger(candidate.currentStep) &&
    (candidate.currentStep ?? -1) >= 0 &&
    (candidate.currentStep ?? 4) <= 3 &&
    parseGrillIntake(candidate.intake) !== null &&
    (candidate.report === null || isGrillReport(candidate.report)) &&
    (candidate.activeAnalysisId === null || typeof candidate.activeAnalysisId === "string")
  );
}

function newSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `demo-${Date.now().toString(36)}`;
}

function intakeFingerprint(intake: GrillIntake) {
  return JSON.stringify([
    intake.founder.fullName,
    intake.founder.role,
    intake.founder.background,
    intake.founder.yearsExperience,
    intake.founder.achievements,
    intake.founder.profileText,
    intake.startup.name,
    intake.startup.website,
    intake.startup.oneLinePitch,
    intake.startup.problem,
    intake.startup.solution,
    intake.startup.targetCustomer,
    intake.startup.market,
    intake.startup.stage,
    intake.startup.traction,
    intake.startup.revenueOrUsers,
    intake.startup.team,
    intake.startup.fundingAsk,
    intake.startup.useOfFunds,
  ]);
}

export class DemoAssessmentRepository implements AssessmentRepository {
  constructor(
    private readonly storage: StorageLike,
    private readonly notify: () => void = () => undefined,
  ) {}

  load() {
    let raw: string | null;
    try {
      raw = this.storage.getItem(GRILL_STORAGE_KEY);
    } catch (error) {
      throw new DemoPersistenceError(error);
    }
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isPersistedState(parsed)) {
        this.storage.removeItem(GRILL_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch (error) {
      if (error instanceof DemoPersistenceError) throw error;
      try {
        this.storage.removeItem(GRILL_STORAGE_KEY);
      } catch (removeError) {
        throw new DemoPersistenceError(removeError);
      }
      return null;
    }
  }

  create(intake: GrillIntake) {
    const existing = this.load();
    const state: PersistedGrillState = {
      schemaVersion: 1,
      sessionId: existing?.sessionId ?? newSessionId(),
      currentStep: existing?.currentStep ?? 0,
      intake,
      report: null,
      activeAnalysisId: null,
    };
    this.save(state);
    return state;
  }

  save(state: PersistedGrillState) {
    try {
      this.storage.setItem(GRILL_STORAGE_KEY, JSON.stringify(state));
      this.notify();
    } catch (error) {
      throw new DemoPersistenceError(error);
    }
  }

  beginAnalysis(expectedIntake: GrillIntake) {
    const current = this.load();
    if (!current) throw new DemoPersistenceError();
    if (intakeFingerprint(current.intake) !== intakeFingerprint(expectedIntake)) {
      throw new StaleAnalysisError();
    }
    const analysisId = newSessionId();
    this.save({ ...current, report: null, activeAnalysisId: analysisId });
    return analysisId;
  }

  saveReport(report: GrillReport, expectedIntake: GrillIntake, expectedAnalysisId: string) {
    const current = this.load();
    if (!current) throw new DemoPersistenceError();
    if (intakeFingerprint(current.intake) !== intakeFingerprint(expectedIntake)) {
      throw new StaleAnalysisError();
    }
    if (current.activeAnalysisId !== expectedAnalysisId) {
      throw new StaleAnalysisError(
        "This analysis was superseded by a newer run. Open the latest report instead.",
      );
    }
    this.save({ ...current, report, activeAnalysisId: null });
  }

  update(intake: GrillIntake, currentStep: number, expectedIntake: GrillIntake) {
    const current = this.load();
    const mergedIntake = current
      ? mergeIntake(current.intake, expectedIntake, intake)
      : intake;
    const intakeChanged =
      current !== null && intakeFingerprint(current.intake) !== intakeFingerprint(mergedIntake);
    const state: PersistedGrillState = {
      schemaVersion: 1,
      sessionId: current?.sessionId ?? newSessionId(),
      currentStep,
      intake: mergedIntake,
      report: intakeChanged ? null : current?.report ?? null,
      activeAnalysisId: intakeChanged ? null : current?.activeAnalysisId ?? null,
    };
    this.save(state);
    return state;
  }

  clear() {
    try {
      this.storage.removeItem(GRILL_STORAGE_KEY);
      this.notify();
    } catch (error) {
      throw new DemoPersistenceError(error);
    }
  }

  getSnapshot() {
    try {
      return this.storage.getItem(GRILL_STORAGE_KEY) ?? "";
    } catch {
      return GRILL_STORAGE_ERROR_SNAPSHOT;
    }
  }
}

export function createBrowserAssessmentRepository(
  configuredBrowser?: BrowserStorageHost | null,
) {
  const browser =
    configuredBrowser === undefined
      ? typeof window === "undefined"
        ? null
        : window
      : configuredBrowser;
  if (!browser) return null;

  try {
    const storage = browser.localStorage;
    storage.getItem(GRILL_STORAGE_KEY);
    return new DemoAssessmentRepository(storage, () => {
      browser.dispatchEvent(new Event(GRILL_STORAGE_EVENT));
    });
  } catch {
    return null;
  }
}

export function subscribeToGrillStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(GRILL_STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(GRILL_STORAGE_EVENT, onStoreChange);
  };
}
