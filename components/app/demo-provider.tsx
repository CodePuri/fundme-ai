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
  defaultFounderProfile,
  defaultOpportunities,
  defaultStartupProfile,
  gmailEmails,
  ycQuestions,
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
  ycQuestions: ApplicationQuestion[];
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
  cycleAnswerVariant: (questionId: string) => void;
  saveAnswer: (questionId: string, answer: string) => void;
  markReady: (questionId: string) => void;
  updateOpportunityStatus: (slug: string, status: ProgramStatus) => void;
  connectGmail: () => void;
  applyEmailUpdates: () => void;
  addTrackerProgram: (program: Opportunity) => void;
};

const STORAGE_KEY = "fundme-ai-demo-v2";
export const ONBOARDING_STEP_KEY = "onboardingStep";
export const ONBOARDING_DRAFT_KEY = "onboardingDraft";

const defaultState: DemoState = {
  isAuthenticated: false,
  gmailConnected: false,
  uploadSourceUrl: "",
  founderNotes:
    "We have 3 agencies in pilot. They're averaging $2,400/month in recovered revenue within the first 30 days.",
  startupProfile: defaultStartupProfile,
  founderProfile: defaultFounderProfile,
  opportunities: defaultOpportunities,
  ycQuestions,
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

function hydrateState(saved: Partial<DemoState>): DemoState {
  const mergedOpportunities = defaultState.opportunities.map((opportunity) => {
    const savedMatch = saved.opportunities?.find((item) => item.slug === opportunity.slug);
    return savedMatch ? { ...opportunity, ...savedMatch } : opportunity;
  });

  const mergedQuestions = defaultState.ycQuestions.map((question) => {
    const savedMatch = saved.ycQuestions?.find((item) => item.id === question.id);
    return savedMatch ? { ...question, ...savedMatch } : question;
  });

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
    ycQuestions: mergedQuestions,
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
        startTransition(() => {
          setState((current) => ({
            ...current,
            isAuthenticated: true,
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
      cycleAnswerVariant: (questionId) => {
        setState((current) => ({
          ...current,
          ycQuestions: current.ycQuestions.map((item) => {
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
        }));
        toast.success("Fundme rewrote this answer with a sharper YC angle.");
      },
      saveAnswer: (questionId, answer) => {
        setState((current) => ({
          ...current,
          ycQuestions: current.ycQuestions.map((item) =>
            item.id === questionId
              ? {
                  ...item,
                  answer,
                  lastSaved: new Date().toISOString(),
                }
              : item,
          ),
        }));
      },
      markReady: (questionId) => {
        setState((current) => ({
          ...current,
          ycQuestions: current.ycQuestions.map((item) =>
            item.id === questionId
              ? {
                  ...item,
                  ready: true,
                  lastSaved: new Date().toISOString(),
                }
              : item,
          ),
        }));
        toast.success("This answer is marked ready for founder review.");
      },
      updateOpportunityStatus: (slug, status) => {
        setState((current) => ({
          ...current,
          opportunities: updateBySlug(current.opportunities, slug, (item) => ({
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
        setState((current) => {
          if (
            current.manualTrackerPrograms.some((item) => item.slug === program.slug) ||
            current.opportunities.some((item) => item.slug === program.slug && item.tracked)
          ) {
            return current;
          }

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
          };
        });
        toast.success("Program added to your tracker.");
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
