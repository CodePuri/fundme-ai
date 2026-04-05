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
};

type DemoContextValue = {
  state: DemoState;
  signIn: () => void;
  setUploadInputs: (payload: {
    sourceUrl: string;
    notes: string;
    files: string[];
  }) => void;
  updateStartupField: (field: keyof StartupProfile, value: string) => void;
  updateFounderField: (field: keyof FounderProfile, value: string | string[]) => void;
  cycleAnswerVariant: (questionId: string) => void;
  saveAnswer: (questionId: string, answer: string) => void;
  markReady: (questionId: string) => void;
  updateOpportunityStatus: (slug: string, status: ProgramStatus) => void;
  connectGmail: () => void;
  applyEmailUpdates: () => void;
};

const STORAGE_KEY = "fundme-ai-demo-v1";

const defaultState: DemoState = {
  isAuthenticated: false,
  gmailConnected: false,
  uploadSourceUrl: "https://flowstate.ai",
  founderNotes:
    "Built after years of margin erosion in agency delivery. Focus on detecting scope drift from real communication and making recovery operationally easy.",
  startupProfile: defaultStartupProfile,
  founderProfile: defaultFounderProfile,
  opportunities: defaultOpportunities,
  ycQuestions,
  emailUpdatesApplied: false,
  selectedFiles: defaultStartupProfile.uploadedAssets,
  lastSyncAt: "2026-04-04T16:05:00.000Z",
};

const DemoContext = createContext<DemoContextValue | null>(null);

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
      return JSON.parse(saved) as DemoState;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return defaultState;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
        toast.success("Generated a sharper draft variant.");
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
        setState((current) => {
          const updatedQuestions = current.ycQuestions.map((item) =>
            item.id === questionId
              ? {
                  ...item,
                  ready: true,
                  lastSaved: new Date().toISOString(),
                }
              : item,
          );

          return {
            ...current,
            ycQuestions: updatedQuestions,
            opportunities: updateBySlug(current.opportunities, "yc-w26", (item) => ({
              ...item,
              status: "Ready",
            })),
          };
        });
        toast.success("Question marked ready.");
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
          lastSyncAt: new Date().toISOString(),
        }));
        toast.success("Gmail connected. 2 funding emails detected.");
      },
      applyEmailUpdates: () => {
        setState((current) => ({
          ...current,
          emailUpdatesApplied: true,
          opportunities: current.opportunities.map((item) => {
            const match = gmailEmails.find((email) => email.programSlug === item.slug);
            return match ? { ...item, status: match.suggestedStatus } : item;
          }),
          lastSyncAt: new Date().toISOString(),
        }));
        toast.success("Tracker updated from Gmail signals.");
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
