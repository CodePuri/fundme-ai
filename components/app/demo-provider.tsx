"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import {
  createApplicationQuestions,
  defaultFounderProfile,
  defaultOpportunities,
  defaultStartupProfile,
  gmailEmails,
  type ApplicationSession,
  type ApplicationQuestion,
  type FounderProfile,
  type Opportunity,
  type ProgramStatus,
  type StartupProfile,
} from "@/lib/demo-data";

type DemoState = {
  isAuthenticated: boolean;
  gmailConnected: boolean;
  uploadSourceUrl: string;
  founderNotes: string;
  startupProfile: StartupProfile;
  founderProfile: FounderProfile;
  opportunities: Opportunity[];
  applicationSessions: Record<string, ApplicationSession>;
  emailUpdatesApplied: boolean;
  selectedFiles: string[];
  lastSyncAt: string;
  onboardingCompleted: boolean;
  resumeBannerDismissed: boolean;
  gmailConnectClicked: boolean;
  gmailApplyClicked: boolean;
  trackerNotificationVisible: boolean;
  manualTrackerPrograms: Opportunity[];
};

type DemoContextValue = {
  state: DemoState;
  signIn: () => void;
  setUploadInputs: (payload: {
    sourceUrl: string;
    notes: string;
    files: string[];
  }) => void;
  completeOnboarding: (payload: {
    founderName: string;
    founderRole: string;
    notes: string;
    files: string[];
  }) => void;
  dismissResumeBanner: () => void;
  markTrackerVisited: () => void;
  startNewIdea: () => void;
  updateStartupField: (field: keyof StartupProfile, value: string) => void;
  updateFounderField: (field: keyof FounderProfile, value: string | string[]) => void;
  ensureApplicationSession: (programSlug: string) => void;
  cycleAnswerVariant: (programSlug: string, questionId: string) => void;
  saveAnswer: (programSlug: string, questionId: string, answer: string) => void;
  markReady: (programSlug: string, questionId: string) => void;
  updateOpportunityStatus: (slug: string, status: ProgramStatus) => void;
  connectGmail: () => void;
  applyEmailUpdates: () => void;
  addTrackerProgram: (program: Opportunity) => void;
};

const STORAGE_KEY = "fundme-ai-demo-v2";
export const ONBOARDING_STEP_KEY = "onboardingStep";
export const ONBOARDING_DRAFT_KEY = "onboardingDraft";
const DEFAULT_APPLICATION_SLUG = "yc-w26";

function cloneQuestions(questions: ApplicationQuestion[]) {
  return questions.map((question) => ({
    ...question,
    variants: [...question.variants],
    sourceSnippets: [...question.sourceSnippets],
  }));
}

function createApplicationSession(programSlug: string): ApplicationSession {
  return {
    programSlug,
    questions: createApplicationQuestions(),
    lastOpenedAt: new Date().toISOString(),
  };
}

function updateSessionProgress(program: Opportunity, questions: ApplicationQuestion[]): Opportunity {
  const readyCount = questions.filter((question) => question.ready).length;
  const lockedStatuses: ProgramStatus[] = [
    "Submitted",
    "Interview Scheduled",
    "Accepted",
    "Rejected",
  ];
  return {
    ...program,
    tracked: true,
    questionCount: questions.length,
    questionsCompleted: readyCount,
    status:
      readyCount === questions.length
        ? "Ready"
        : lockedStatuses.includes(program.status)
          ? program.status
          : "Drafting",
    lastEdited: new Date().toISOString(),
  };
}

const defaultState: DemoState = {
  isAuthenticated: false,
  gmailConnected: false,
  uploadSourceUrl: "",
  founderNotes:
    "We have 3 agencies in pilot. They're averaging $2,400/month in recovered revenue within the first 30 days.",
  startupProfile: defaultStartupProfile,
  founderProfile: defaultFounderProfile,
  opportunities: defaultOpportunities,
  applicationSessions: {
    [DEFAULT_APPLICATION_SLUG]: createApplicationSession(DEFAULT_APPLICATION_SLUG),
  },
  emailUpdatesApplied: false,
  selectedFiles: defaultStartupProfile.uploadedAssets,
  lastSyncAt: "2026-04-05T13:08:00.000Z",
  onboardingCompleted: false,
  resumeBannerDismissed: false,
  gmailConnectClicked: false,
  gmailApplyClicked: false,
  trackerNotificationVisible: false,
  manualTrackerPrograms: [],
};

const DemoContext = createContext<DemoContextValue | null>(null);

function hydrateState(saved: Partial<DemoState> & { ycQuestions?: ApplicationQuestion[] }): DemoState {
  const mergedOpportunities = defaultState.opportunities.map((opportunity) => {
    const savedMatch = saved.opportunities?.find((item) => item.slug === opportunity.slug);
    return savedMatch ? { ...opportunity, ...savedMatch } : opportunity;
  });

  const savedSessions = saved.applicationSessions ?? {};
  const mergedSessions = Object.fromEntries(
    Object.entries(savedSessions).map(([programSlug, session]) => [
      programSlug,
      {
        ...session,
        lastOpenedAt: session.lastOpenedAt ?? new Date().toISOString(),
        questions: cloneQuestions(session.questions),
      },
    ]),
  ) as Record<string, ApplicationSession>;
  delete mergedSessions[DEFAULT_APPLICATION_SLUG];

  const savedDefaultQuestions = savedSessions[DEFAULT_APPLICATION_SLUG]?.questions ?? saved.ycQuestions;
  const defaultQuestions = cloneQuestions(
    savedDefaultQuestions && savedDefaultQuestions.length
      ? defaultState.applicationSessions[DEFAULT_APPLICATION_SLUG].questions.map((question) => {
          const savedMatch = savedDefaultQuestions.find((item) => item.id === question.id);
          return savedMatch ? { ...question, ...savedMatch } : question;
        })
      : defaultState.applicationSessions[DEFAULT_APPLICATION_SLUG].questions,
  );

  return {
    ...defaultState,
    ...saved,
    startupProfile: {
      ...defaultState.startupProfile,
      ...saved.startupProfile,
    },
    founderProfile: {
      ...defaultState.founderProfile,
      ...saved.founderProfile,
    },
    opportunities: mergedOpportunities,
    applicationSessions: {
      [DEFAULT_APPLICATION_SLUG]: {
        programSlug: DEFAULT_APPLICATION_SLUG,
        questions: defaultQuestions,
        lastOpenedAt:
          savedSessions[DEFAULT_APPLICATION_SLUG]?.lastOpenedAt ?? defaultState.lastSyncAt,
      },
      ...mergedSessions,
    },
    selectedFiles: saved.selectedFiles?.length ? saved.selectedFiles : defaultState.selectedFiles,
    manualTrackerPrograms: saved.manualTrackerPrograms ?? [],
  };
}

function updateBySlug(
  opportunities: Opportunity[],
  slug: string,
  updater: (item: Opportunity) => Opportunity,
) {
  return opportunities.map((item) => (item.slug === slug ? updater(item) : item));
}

function ensureSessionExists(
  sessions: Record<string, ApplicationSession>,
  programSlug: string,
) {
  if (sessions[programSlug]) {
    return sessions;
  }

  return {
    ...sessions,
    [programSlug]: createApplicationSession(programSlug),
  };
}

function updateApplicationSession(
  state: DemoState,
  programSlug: string,
  updater: (questions: ApplicationQuestion[]) => ApplicationQuestion[],
) {
  const timestamp = new Date().toISOString();
  const nextSessions = ensureSessionExists(state.applicationSessions, programSlug);
  const currentSession = nextSessions[programSlug];
  const nextQuestions = updater(currentSession.questions);
  const nextSession: ApplicationSession = {
    programSlug,
    questions: nextQuestions,
    lastOpenedAt: timestamp,
  };

  return {
    ...state,
    applicationSessions: {
      ...nextSessions,
      [programSlug]: nextSession,
    },
    opportunities: state.opportunities.map((program) =>
      program.slug === programSlug ? updateSessionProgress(program, nextQuestions) : program,
    ),
    manualTrackerPrograms: state.manualTrackerPrograms.map((program) =>
      program.slug === programSlug ? updateSessionProgress(program, nextQuestions) : program,
    ),
    lastSyncAt: timestamp,
  };
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(() => {
    if (typeof window === "undefined") {
      return defaultState;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultState;
    }

    try {
      return hydrateState(JSON.parse(saved) as Partial<DemoState>);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return defaultState;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    function handleDemoReset(event: KeyboardEvent) {
      if (event.shiftKey && event.key.toLowerCase() === "r") {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(ONBOARDING_STEP_KEY);
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
        window.location.href = "/";
      }
    }

    window.addEventListener("keydown", handleDemoReset);
    return () => window.removeEventListener("keydown", handleDemoReset);
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      state,
      signIn: () => {
        window.localStorage.removeItem(ONBOARDING_STEP_KEY);
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
        startTransition(() => {
          setState((current) => ({
            ...current,
            isAuthenticated: true,
            onboardingCompleted: true,
            resumeBannerDismissed: true,
            lastSyncAt: new Date().toISOString(),
          }));
        });
      },
      setUploadInputs: ({ sourceUrl, notes, files }) => {
        setState((current) => ({
          ...current,
          uploadSourceUrl: sourceUrl,
          founderNotes: notes,
          selectedFiles: files.length > 0 ? files : current.selectedFiles,
          startupProfile: {
            ...current.startupProfile,
            uploadedAssets: files.length > 0 ? files : current.startupProfile.uploadedAssets,
          },
          lastSyncAt: new Date().toISOString(),
        }));
      },
      completeOnboarding: ({ founderName, founderRole, notes, files }) => {
        window.localStorage.removeItem(ONBOARDING_STEP_KEY);
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
        setState((current) => ({
          ...current,
          isAuthenticated: true,
          onboardingCompleted: true,
          resumeBannerDismissed: false,
          founderNotes: notes,
          selectedFiles: files,
          startupProfile: {
            ...current.startupProfile,
            uploadedAssets: files,
          },
          founderProfile: {
            ...current.founderProfile,
            name: founderName,
            role: founderRole,
          },
          lastSyncAt: new Date().toISOString(),
        }));
      },
      dismissResumeBanner: () => {
        setState((current) => ({
          ...current,
          resumeBannerDismissed: true,
        }));
      },
      markTrackerVisited: () => {
        setState((current) =>
          current.trackerNotificationVisible
            ? {
                ...current,
                trackerNotificationVisible: false,
              }
            : current,
        );
      },
      startNewIdea: () => {
        window.localStorage.removeItem(ONBOARDING_STEP_KEY);
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
        setState((current) => ({
          ...current,
          resumeBannerDismissed: false,
        }));
      },
      updateStartupField: (field, value) => {
        setState((current) => ({
          ...current,
          startupProfile: {
            ...current.startupProfile,
            [field]: value,
          },
        }));
      },
      updateFounderField: (field, value) => {
        setState((current) => ({
          ...current,
          founderProfile: {
            ...current.founderProfile,
            [field]: value,
          },
        }));
      },
      ensureApplicationSession: (programSlug) => {
        setState((current) => {
          if (current.applicationSessions[programSlug]) {
            return current;
          }

          return {
            ...current,
            applicationSessions: ensureSessionExists(current.applicationSessions, programSlug),
          };
        });
      },
      cycleAnswerVariant: (programSlug, questionId) => {
        setState((current) =>
          updateApplicationSession(current, programSlug, (questions) =>
            questions.map((item) => {
              if (item.id !== questionId) {
                return item;
              }
              const nextVariant = item.variants[0];
              return {
                ...item,
                answer: nextVariant,
                variants: [...item.variants.slice(1), item.answer],
                lastSaved: new Date().toISOString(),
              };
            }),
          ),
        );
        toast.success("Fundme rewrote this answer with a sharper program fit.");
      },
      saveAnswer: (programSlug, questionId, answer) => {
        setState((current) =>
          updateApplicationSession(current, programSlug, (questions) =>
            questions.map((item) =>
              item.id === questionId
                ? {
                    ...item,
                    answer,
                    lastSaved: new Date().toISOString(),
                  }
                : item,
            ),
          ),
        );
      },
      markReady: (programSlug, questionId) => {
        setState((current) =>
          updateApplicationSession(current, programSlug, (questions) =>
            questions.map((item) =>
              item.id === questionId
                ? {
                    ...item,
                    ready: true,
                    lastSaved: new Date().toISOString(),
                  }
                : item,
            ),
          ),
        );
        toast.success("This answer is marked ready for founder review.");
      },
      updateOpportunityStatus: (slug, status) => {
        setState((current) => ({
          ...current,
          opportunities: updateBySlug(current.opportunities, slug, (item) => ({
            ...item,
            status,
          })),
          manualTrackerPrograms: updateBySlug(current.manualTrackerPrograms, slug, (item) => ({
            ...item,
            status,
          })),
          lastSyncAt: new Date().toISOString(),
        }));
      },
      connectGmail: () => {
        setState((current) => ({
          ...current,
          gmailConnected: true,
          gmailConnectClicked: true,
          trackerNotificationVisible: current.gmailApplyClicked ? true : current.trackerNotificationVisible,
          lastSyncAt: new Date().toISOString(),
        }));
        toast.success("Gmail connected. Fundme found 2 application updates.");
      },
      applyEmailUpdates: () => {
        setState((current) => ({
          ...current,
          emailUpdatesApplied: true,
          gmailApplyClicked: true,
          trackerNotificationVisible: current.gmailConnectClicked ? true : current.trackerNotificationVisible,
          opportunities: current.opportunities.map((item) => {
            const match = gmailEmails.find((email) => email.programSlug === item.slug);
            return match ? { ...item, status: match.suggestedStatus } : item;
          }),
          lastSyncAt: new Date().toISOString(),
        }));
        toast.success("Tracker updated from the latest inbox signals.");
      },
      addTrackerProgram: (program) => {
        let addedToTracker = false;

        setState((current) => {
          if (current.manualTrackerPrograms.some((item) => item.slug === program.slug)) {
            return current;
          }

          const existingOpportunity = current.opportunities.find((item) => item.slug === program.slug);

          if (existingOpportunity) {
            if (existingOpportunity.tracked) {
              return current;
            }

            addedToTracker = true;
            return {
              ...current,
              opportunities: updateBySlug(current.opportunities, program.slug, (item) => ({
                ...item,
                tracked: true,
                status: item.status ?? "Drafting",
                lastEdited: new Date().toISOString(),
              })),
              lastSyncAt: new Date().toISOString(),
            };
          }

          addedToTracker = true;
          return {
            ...current,
            manualTrackerPrograms: [
              ...current.manualTrackerPrograms,
              {
                ...program,
                status: "Drafting",
                tracked: true,
              },
            ],
            lastSyncAt: new Date().toISOString(),
          };
        });
        if (addedToTracker) {
          toast.success("Program added to your tracker.");
        }
      },
    }),
    [state],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within DemoProvider");
  }

  return context;
}
