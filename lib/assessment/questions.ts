import type { GrillSession, MentorQuestion } from "./types.ts";

const MENTOR_QUESTIONS: readonly MentorQuestion[] = [
  {
    id: "stage",
    prompt: "Where is the product today: idea, prototype, private beta, or live?",
    whyItMatters: "Stage sets the evidence bar for every other funding-readiness signal.",
    placeholder: "Example: Live for six months with a paid pilot…",
  },
  {
    id: "traction",
    prompt: "What traction can you prove today?",
    whyItMatters: "Investors separate activity from evidence such as users, revenue, retention, or pilots.",
    placeholder: "Share numbers, dates, and what can be verified…",
  },
  {
    id: "founder-fit",
    prompt: "Why are you or this team unusually suited to solve this problem?",
    whyItMatters: "Founder-market fit supports credibility before the company has extensive operating history.",
    placeholder: "Relevant experience, access, insight, or lived problem…",
  },
  {
    id: "differentiation",
    prompt: "What would a customer use instead, and why would they switch to you?",
    whyItMatters: "A concrete alternative makes differentiation testable instead of aspirational.",
    placeholder: "Name the current workaround or competitor and the switching reason…",
  },
  {
    id: "funding-outcome",
    prompt: "What will the next round fund, and what milestone should it unlock?",
    whyItMatters: "A specific use of funds connects capital to measurable company progress.",
    placeholder: "Example: ₹50 lakh for 12 months to reach 30 paid teams…",
  },
];

export function selectMentorQuestions(session: GrillSession): MentorQuestion[] {
  const skipped = new Set(session.skippedQuestionIds);

  return MENTOR_QUESTIONS.filter(
    (question) => !session.answers[question.id] && !skipped.has(question.id),
  ).slice(0, 5);
}

export function nextMentorQuestion(session: GrillSession): MentorQuestion | null {
  return selectMentorQuestions(session)[0] ?? null;
}
