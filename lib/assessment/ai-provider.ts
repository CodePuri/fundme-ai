import type { StructuredEvidenceRecord } from "./evidence-model";
import type { ActionItem, DimensionId, Finding, FundingReadinessReport } from "./types";

export type AiSynthesisResult = {
  provider: "gemini" | "groq" | "none";
  model: string;
  synthesizedAt: string;
  latencyMs: number;
  status: "success" | "degraded" | "disabled";
  error?: string;
  extractedHighlights?: string[];
  detectedContradictions?: string[];
};

export type AiStructuredOutput = {
  founderReview?: {
    credibility?: string;
    founderMarketFit?: string;
    profilePositioning?: string;
  };
  startupReview?: {
    problem?: string;
    solution?: string;
    market?: string;
    differentiation?: string;
    traction?: string;
    fundingNarrative?: string;
  };
  deckReviewSummary?: string;
  deckFindings?: string[];
  dimensionExplanations?: Partial<Record<DimensionId, string>>;
  synthesizedFindings?: Array<{
    id: string;
    type: "strength" | "red-flag" | "contradiction" | "unsupported-claim" | "missing-evidence";
    severity: "low" | "medium" | "high";
    dimension: DimensionId;
    explanation: string;
    action: string;
  }>;
  tailoredActions?: Array<{
    horizon: "fix-now" | "fix-next" | "improve-later";
    title: string;
    detail: string;
  }>;
  extractedHighlights?: string[];
  detectedContradictions?: string[];
};

function getAiConfig(): {
  provider: "gemini" | "groq" | null;
  apiKey: string;
  model: string;
} {
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";
  const groqKey = process.env.GROQ_API_KEY || "";
  const preferredProvider = (process.env.AI_PRIMARY_PROVIDER || "").toLowerCase();

  if (preferredProvider === "gemini" && geminiKey) {
    return { provider: "gemini", apiKey: geminiKey, model: "gemini-2.0-flash" };
  }
  if (preferredProvider === "groq" && groqKey) {
    return { provider: "groq", apiKey: groqKey, model: "openai/gpt-oss-120b" };
  }

  if (geminiKey) {
    return { provider: "gemini", apiKey: geminiKey, model: "gemini-2.0-flash" };
  }
  if (groqKey) {
    return { provider: "groq", apiKey: groqKey, model: "openai/gpt-oss-120b" };
  }

  return { provider: null, apiKey: "", model: "none" };
}

function buildSystemPrompt(): string {
  return `You are the FundMe AI Assessment Intelligence Engine.
You synthesize evidence-backed startup diagnostics for founders seeking accelerator admission and early-stage capital.

RULES:
1. Ground all feedback strictly in the submitted founder, website, pitch deck, and answer evidence.
2. Never invent metrics, team members, or claims not present in the sources.
3. Be candid, analytical, highly specific, and constructive.
4. Separate what is proven from what is missing or ambiguous.
5. Return ONLY a valid JSON object matching the requested schema. No markdown wrapping, no text outside JSON.`;
}

function buildUserPrompt(evidence: StructuredEvidenceRecord, report: FundingReadinessReport): string {
  return JSON.stringify({
    task: "Synthesize personalized evidence analysis and actionable guidance for this startup diagnosis.",
    evidenceSummary: {
      founder: {
        name: evidence.founder.name,
        role: evidence.founder.role,
        linkedIn: evidence.founder.linkedInUrl,
        profileText: evidence.founder.profileText,
        experienceSignals: evidence.founder.signals,
      },
      startup: {
        name: evidence.startup.name,
        websiteUrl: evidence.startup.websiteUrl,
        title: evidence.startup.websiteTitle,
        description: evidence.startup.websiteDescription,
        extractedTextSnippet: (evidence.startup.pitchDescription || "").slice(0, 1500),
        websiteSignals: evidence.startup.websiteSignals,
      },
      pitchDeck: {
        attached: evidence.pitchDeck.attached,
        filename: evidence.pitchDeck.filename,
        pageCount: evidence.pitchDeck.pageCount,
        detectedSections: evidence.pitchDeck.detectedSections,
        slidesSnippet: evidence.pitchDeck.extractedSnippet.slice(0, 2000),
      },
      questionAnswers: evidence.answers,
    },
    deterministicScores: {
      readinessScore: report.readinessScore,
      verdict: report.verdict,
      strongestDimension: report.strongestDimension,
      weakestDimension: report.weakestDimension,
      dimensions: report.dimensions.map((d) => ({
        id: d.id,
        label: d.label,
        score: d.score,
        deterministicExplanation: d.explanation,
      })),
    },
    requiredJsonSchema: {
      founderReview: {
        credibility: "Specific assessment of founder background and execution evidence",
        founderMarketFit: "Specific assessment of why this founder is positioned for this problem",
        profilePositioning: "Actionable positioning advice for the founder profile",
      },
      startupReview: {
        problem: "Analysis of problem clarity based on website and deck claims",
        solution: "Analysis of product solution and value proposition",
        market: "Analysis of target market segment and opportunity",
        differentiation: "Analysis of competitive advantage and switching rationale",
        traction: "Analysis of verifiable customer / revenue proof and timing",
        fundingNarrative: "Analysis of the funding ask, milestone linkage, and runway",
      },
      deckReviewSummary: "Concise summary of pitch deck structure, strengths, and missing slides",
      deckFindings: ["Specific bullet point observation from the deck", "Another deck finding"],
      dimensionExplanations: {
        "founder-credibility": "Tailored 1-2 sentence evidence explanation",
        "founder-market-fit": "Tailored 1-2 sentence evidence explanation",
        "problem-clarity": "Tailored 1-2 sentence evidence explanation",
        "solution-clarity": "Tailored 1-2 sentence evidence explanation",
        "market-clarity": "Tailored 1-2 sentence evidence explanation",
        "differentiation": "Tailored 1-2 sentence evidence explanation",
        "product-maturity": "Tailored 1-2 sentence evidence explanation",
        "traction-proof": "Tailored 1-2 sentence evidence explanation",
        "funding-narrative": "Tailored 1-2 sentence evidence explanation",
        "pitch-deck-readiness": "Tailored 1-2 sentence evidence explanation",
      },
      synthesizedFindings: [
        {
          id: "custom-finding-id",
          type: "strength",
          severity: "low",
          dimension: "founder-credibility",
          explanation: "Clear explanation citing the exact evidence or gap",
          action: "Concrete action for the founder to resolve or prove it",
        },
      ],
      tailoredActions: [
        {
          horizon: "fix-now",
          title: "Immediate action title",
          detail: "Specific guidance referencing submitted evidence",
        },
        {
          horizon: "fix-next",
          title: "Next milestone action title",
          detail: "Concrete next step",
        },
        {
          horizon: "improve-later",
          title: "Strategic refinement title",
          detail: "Longer term improvement",
        },
      ],
      extractedHighlights: ["Direct factual claim extracted from sources"],
      detectedContradictions: ["Any conflict between claims or none if clean"],
    },
  });
}

async function callGeminiApi(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  signal: AbortSignal
): Promise<AiStructuredOutput> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return JSON.parse(rawText) as AiStructuredOutput;
}

async function callGroqApi(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  signal: AbortSignal
): Promise<AiStructuredOutput> {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content || "";
  return JSON.parse(rawText) as AiStructuredOutput;
}

export async function synthesizeAssessmentWithAi(
  evidence: StructuredEvidenceRecord,
  deterministicReport: FundingReadinessReport
): Promise<{ report: FundingReadinessReport; aiMetadata: AiSynthesisResult }> {
  const startTime = Date.now();
  const config = getAiConfig();

  if (!config.provider || !config.apiKey) {
    return {
      report: deterministicReport,
      aiMetadata: {
        provider: "none",
        model: "deterministic-baseline",
        synthesizedAt: new Date().toISOString(),
        latencyMs: 0,
        status: "disabled",
        error: "No AI provider API key configured in server environment.",
      },
    };
  }

  try {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(evidence, deterministicReport);
    const signal = AbortSignal.timeout(12000);

    let structuredOutput: AiStructuredOutput;
    if (config.provider === "gemini") {
      structuredOutput = await callGeminiApi(config.apiKey, config.model, systemPrompt, userPrompt, signal);
    } else {
      structuredOutput = await callGroqApi(config.apiKey, config.model, systemPrompt, userPrompt, signal);
    }

    const latencyMs = Date.now() - startTime;

    // Merge AI enhancements while preserving 100% deterministic numeric scores
    const mergedReport: FundingReadinessReport = {
      ...deterministicReport,
      founderReview: {
        credibility:
          structuredOutput.founderReview?.credibility || deterministicReport.founderReview.credibility,
        founderMarketFit:
          structuredOutput.founderReview?.founderMarketFit ||
          deterministicReport.founderReview.founderMarketFit,
        profilePositioning:
          structuredOutput.founderReview?.profilePositioning ||
          deterministicReport.founderReview.profilePositioning,
      },
      startupReview: {
        problem: structuredOutput.startupReview?.problem || deterministicReport.startupReview.problem,
        solution: structuredOutput.startupReview?.solution || deterministicReport.startupReview.solution,
        market: structuredOutput.startupReview?.market || deterministicReport.startupReview.market,
        differentiation:
          structuredOutput.startupReview?.differentiation ||
          deterministicReport.startupReview.differentiation,
        traction: structuredOutput.startupReview?.traction || deterministicReport.startupReview.traction,
        fundingNarrative:
          structuredOutput.startupReview?.fundingNarrative ||
          deterministicReport.startupReview.fundingNarrative,
      },
      deckReview: {
        status: deterministicReport.deckReview.status,
        summary:
          structuredOutput.deckReviewSummary || deterministicReport.deckReview.summary,
        findings:
          structuredOutput.deckFindings && structuredOutput.deckFindings.length > 0
            ? structuredOutput.deckFindings
            : deterministicReport.deckReview.findings,
      },
      dimensions: deterministicReport.dimensions.map((dim) => {
        const tailoredExplanation = structuredOutput.dimensionExplanations?.[dim.id];
        return {
          ...dim,
          explanation: tailoredExplanation || dim.explanation,
        };
      }),
      findings: mergeFindings(deterministicReport.findings, structuredOutput.synthesizedFindings),
      actions: mergeActions(deterministicReport.actions, structuredOutput.tailoredActions),
    };

    const aiMetadata: AiSynthesisResult = {
      provider: config.provider,
      model: config.model,
      synthesizedAt: new Date().toISOString(),
      latencyMs,
      status: "success",
      extractedHighlights: structuredOutput.extractedHighlights,
      detectedContradictions: structuredOutput.detectedContradictions,
    };

    return { report: mergedReport, aiMetadata };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    console.warn(`[AI Provider] ${config.provider} synthesis failed:`, err?.message || err);

    return {
      report: deterministicReport,
      aiMetadata: {
        provider: config.provider,
        model: config.model,
        synthesizedAt: new Date().toISOString(),
        latencyMs,
        status: "degraded",
        error: err?.message || "AI synthesis call failed or timed out.",
      },
    };
  }
}

const VALID_DIMENSIONS = new Set<DimensionId>([
  "founder-credibility",
  "founder-market-fit",
  "problem-clarity",
  "solution-clarity",
  "market-clarity",
  "differentiation",
  "product-maturity",
  "traction-proof",
  "funding-narrative",
  "pitch-deck-readiness",
]);

function normalizeFindingType(type: string): Finding["type"] {
  const t = (type || "").toLowerCase().trim();
  if (t === "strength") return "strength";
  if (t === "contradiction") return "contradiction";
  if (t === "red-flag" || t === "redflag") return "red-flag";
  if (t === "unsupported-claim" || t === "unsupported") return "unsupported-claim";
  return "missing-evidence";
}

function normalizeSeverity(severity: string): Finding["severity"] {
  const s = (severity || "").toLowerCase().trim();
  if (s === "high" || s === "critical") return "high";
  if (s === "low") return "low";
  return "medium";
}

function mergeFindings(
  deterministic: Finding[],
  aiFindings?: AiStructuredOutput["synthesizedFindings"]
): Finding[] {
  if (!aiFindings || aiFindings.length === 0) return deterministic;

  const validAiFindings: Finding[] = aiFindings
    .filter((f) => f && f.id && f.explanation && f.action && f.dimension && VALID_DIMENSIONS.has(f.dimension as DimensionId))
    .map((f) => ({
      id: f.id,
      type: normalizeFindingType(f.type),
      severity: normalizeSeverity(f.severity),
      dimension: f.dimension as DimensionId,
      explanation: f.explanation,
      evidenceIds: [],
      action: f.action,
    }));

  const combined = [...validAiFindings, ...deterministic];
  const seen = new Set<string>();
  return combined.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}

function mergeActions(
  deterministic: ActionItem[],
  aiActions?: AiStructuredOutput["tailoredActions"]
): ActionItem[] {
  if (!aiActions || aiActions.length === 0) return deterministic;

  const validAiActions: ActionItem[] = aiActions
    .filter((a) => a && a.title && a.detail && a.horizon)
    .map((a) => ({
      horizon: a.horizon,
      title: a.title,
      detail: a.detail,
    }));

  return validAiActions.length >= 3 ? validAiActions : deterministic;
}
