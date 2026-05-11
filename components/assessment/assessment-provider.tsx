"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

import type { AssessmentState, AssessmentAnswer, AnalysisStatus, AssessmentReport } from "./assessment-types";

export const ASSESSMENT_STORAGE_KEY = "fundme-assessment-v1";

const defaultState: AssessmentState = {
  websiteUrl: "",
  startupName: "",
  linkedInUrl: "",
  startupNotes: "",
  uploadedFiles: [],
  answers: [],
  analysisStatus: "idle",
  creditsRemaining: 10,
  hasPaid: false,
  reportGenerated: false,
  report: null,
};

function loadState(): AssessmentState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AssessmentState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export type AssessmentContextValue = {
  state: AssessmentState;
  hasHydrated: boolean;
  setWebsiteUrl: (url: string) => void;
  setStartupName: (name: string) => void;
  setLinkedInUrl: (url: string) => void;
  setStartupNotes: (notes: string) => void;
  setUploadedFiles: (files: string[]) => void;
  setAnswer: (questionId: number, selectedOption: string) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  generateReport: () => void;
  resetAssessment: () => void;
  getAnswerForQuestion: (questionId: number) => string | undefined;
};

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AssessmentState>(defaultState);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState();
    setState(saved);
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(state));
  }, [hasHydrated, state]);

  const setWebsiteUrl = useCallback((url: string) => {
    setState((current) => ({ ...current, websiteUrl: url }));
  }, []);

  const setStartupName = useCallback((name: string) => {
    setState((current) => ({ ...current, startupName: name }));
  }, []);

  const setLinkedInUrl = useCallback((url: string) => {
    setState((current) => ({ ...current, linkedInUrl: url }));
  }, []);

  const setStartupNotes = useCallback((notes: string) => {
    setState((current) => ({ ...current, startupNotes: notes }));
  }, []);

  const setUploadedFiles = useCallback((files: string[]) => {
    setState((current) => ({ ...current, uploadedFiles: files }));
  }, []);

  const setAnswer = useCallback((questionId: number, selectedOption: string) => {
    setState((current) => {
      const nextAnswers = current.answers.filter((a) => a.questionId !== questionId);
      return {
        ...current,
        answers: [...nextAnswers, { questionId, selectedOption }],
      };
    });
  }, []);

  const getAnswerForQuestion = useCallback((questionId: number) => {
    return state.answers.find((a) => a.questionId === questionId)?.selectedOption;
  }, [state.answers]);

  const setAnalysisStatus = useCallback((status: AnalysisStatus) => {
    setState((current) => ({ ...current, analysisStatus: status }));
  }, []);

  const generateReport = useCallback(() => {
    setState((current) => {
      const report = generateMockReport(current);
      return {
        ...current,
        reportGenerated: true,
        analysisStatus: "complete",
        report,
      };
    });
  }, []);

  const resetAssessment = useCallback(() => {
    setState(defaultState);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AssessmentContextValue>(
    () => ({
      state,
      hasHydrated,
      setWebsiteUrl,
      setStartupName,
      setLinkedInUrl,
      setStartupNotes,
      setUploadedFiles,
      setAnswer,
      setAnalysisStatus,
      generateReport,
      resetAssessment,
      getAnswerForQuestion,
    }),
    [
      state,
      hasHydrated,
      setWebsiteUrl,
      setStartupName,
      setLinkedInUrl,
      setStartupNotes,
      setUploadedFiles,
      setAnswer,
      setAnalysisStatus,
      generateReport,
      resetAssessment,
      getAnswerForQuestion,
    ]
  );

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within AssessmentProvider");
  }
  return context;
}

/* ─── Mock Report Generation ─────────────────────────────────── */

function generateMockReport(state: AssessmentState): AssessmentReport {
  const answers = state.answers;
  const q2 = answers.find((a) => a.questionId === 2)?.selectedOption ?? "";
  const q3 = answers.find((a) => a.questionId === 3)?.selectedOption ?? "";
  const q5 = answers.find((a) => a.questionId === 5)?.selectedOption ?? "";
  const q6 = answers.find((a) => a.questionId === 6)?.selectedOption ?? "";
  const q8 = answers.find((a) => a.questionId === 8)?.selectedOption ?? "";

  // Determine base score from answers
  let baseScore = 45;
  if (q2.includes("More than 10") || q2.includes("without a clear system")) baseScore += 10;
  else if (q2.includes("4 to 10")) baseScore += 5;
  if (q3.includes("Yes")) baseScore += 5;
  if (q6.includes("VC") || q6.includes("Angel")) baseScore += 15;
  else if (q6.includes("Grants") || q6.includes("Revenue")) baseScore += 10;
  if (q5.includes("Founder profile") || q5.includes("Pitch deck")) baseScore -= 5;
  if (q8.includes("This week")) baseScore += 5;

  const readinessScore = Math.min(92, Math.max(38, baseScore + Math.floor(Math.random() * 12)));

  // Subscores derived from readinessScore with variance
  const subscores = {
    founderCredibility: Math.min(95, readinessScore + Math.floor(Math.random() * 10 - 3)),
    startupClarity: Math.min(94, readinessScore + Math.floor(Math.random() * 12 - 5)),
    tractionProof: Math.min(90, readinessScore + Math.floor(Math.random() * 14 - 8)),
    marketFit: Math.min(93, readinessScore + Math.floor(Math.random() * 10 - 2)),
    applicationReadiness: Math.min(88, readinessScore + Math.floor(Math.random() * 16 - 10)),
    opportunityFit: Math.min(91, readinessScore + Math.floor(Math.random() * 10 - 3)),
  };

  const verdicts = [
    "Promising but under positioned",
    "Strong founder signal, weak application story",
    "Clear idea, unclear proof",
    "Good startup, wrong application strategy",
    "Not ready to apply yet, but fixable",
  ];
  const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];

  const weaknesses: import("./assessment-types").Weakness[] = [
    {
      title: "Website does not explain who this is for",
      whyItHurts: "Programs scan your homepage in under 8 seconds. If the target customer is not clear, they assume you do not know either.",
      quickHint: "Add one sentence on your homepage explaining exactly who benefits and how.",
    },
    {
      title: "Traction story is under specified",
      whyItHurts: "Accelerators and investors need proof the market wants what you are building. Vague metrics signal risk.",
      quickHint: "Lead with the most impressive metric: users, revenue, waitlist, or pilot engagement. Be specific.",
    },
    {
      title: "Founder profile lacks domain signal",
      whyItHurts: "Selection committees invest in founders who have unfair advantages. Your background should scream why you are the one.",
      quickHint: "Highlight one past win, relevant expertise, or unique insight that makes you the obvious founder for this problem.",
    },
  ];

  const founderAssessment = `Your founder profile shows genuine intent, but the narrative is fragmented. Selection committees look for clarity of purpose, relevant experience, and proof of execution. Strengthening your LinkedIn headline and founder bio with one sharp positioning statement would significantly improve first impressions.`;

  const startupAssessment = `The startup idea has merit, but the story is not yet tight enough for competitive applications. The problem is interesting, but the solution framing and differentiation need sharpening. Focus on making the "why now" and "why you" sections impossible to ignore.`;

  const websiteAssessment = state.websiteUrl
    ? `We reviewed the submitted website. The positioning is ${readinessScore > 60 ? "decent" : "underdeveloped"}. Key gaps: unclear target audience, weak call to action, and minimal proof points. A focused rewrite of the above-the-fold copy would improve conversion and program perception.`
    : `No website was submitted for analysis. Most accelerators check your site before interviews. Adding a clear homepage that explains the problem, solution, and traction in under 30 seconds is strongly recommended.`;

  return {
    readinessScore,
    verdict,
    subscores,
    weaknesses,
    founderAssessment,
    startupAssessment,
    websiteAssessment,
    missingProofPoints: [
      "Specific traction metric (users, revenue, or pilots)",
      "Clear target customer definition",
      "Competitive differentiation statement",
      "Team credibility proof point",
      "Go-to-market timeline",
    ],
    opportunityCategories: [
      "Pre-seed accelerators",
      "Government innovation grants",
      "B2B SaaS startup programs",
      "Student founder fellowships",
      "Revenue-based financing",
    ],
    lockedMatchesPreview: [
      { name: "Y Combinator W26", reason: "Stage fit is strong, but traction proof needs tightening" },
      { name: "Antler India", reason: "Founder background matches, idea framing needs sharpening" },
      { name: "Google for Startups", reason: "Good technical fit, application story could be stronger" },
    ],
  };
}
