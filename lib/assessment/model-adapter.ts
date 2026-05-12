import type { StructuredReport } from "./schema";
import { buildSystemPrompt, buildUserPrompt, buildEmergencyFallback } from "./prompt";
import type { AnalysisRequest } from "./schema";
import { validateReport, sanitizeReport } from "./validate";

/* ─── Provider Configuration ── */

export type ProviderConfig = {
  name: string;
  apiKeyEnv: string;
  baseUrl: string;
  defaultModel: string;
};

export type ModelConfig = {
  provider: ProviderConfig;
  model: string;
};

/* ─── Available Providers ── */

export const PROVIDERS: Record<string, ProviderConfig> = {
  groq: {
    name: "groq",
    apiKeyEnv: "GROQ_API_KEY",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
  },
  openai: {
    name: "openai",
    apiKeyEnv: "OPENAI_API_KEY",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
  },
  anthropic: {
    name: "anthropic",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-sonnet-4-20250514",
  },
  xai: {
    name: "xai",
    apiKeyEnv: "XAI_API_KEY",
    baseUrl: "https://api.x.ai/v1",
    defaultModel: "grok-2-latest",
  },
};

/* ─── Load config from environment ── */

export function loadPrimaryConfig(): ModelConfig | null {
  return loadModelConfig("AI_PRIMARY_PROVIDER", "AI_PRIMARY_MODEL");
}

export function loadFallbackConfig(): ModelConfig | null {
  return loadModelConfig("AI_FALLBACK_PROVIDER", "AI_FALLBACK_MODEL");
}

function loadModelConfig(providerEnv: string, modelEnv: string): ModelConfig | null {
  const providerName = process.env[providerEnv]?.toLowerCase();
  if (!providerName) return null;

  const provider = PROVIDERS[providerName];
  if (!provider) return null;

  const model = process.env[modelEnv] || provider.defaultModel;

  const apiKey = process.env[provider.apiKeyEnv];
  if (!apiKey) return null;

  return { provider, model };
}

/* ─── Adapter Result ── */

export type AIResult = {
  success: boolean;
  report?: StructuredReport;
  error?: string;
  modelUsed: string;
  providerUsed: string;
};

/* ─── Call AI Model ── */

async function callOpenAICompatible(
  config: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
): Promise<AIResult> {
  const apiKey = process.env[config.provider.apiKeyEnv];
  if (!apiKey) {
    return { success: false, error: `Missing API key: ${config.provider.apiKeyEnv}`, modelUsed: config.model, providerUsed: config.provider.name };
  }

  try {
    const response = await fetch(`${config.provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      return {
        success: false,
        error: `API error ${response.status}: ${errorBody.slice(0, 200)}`,
        modelUsed: config.model,
        providerUsed: config.provider.name,
      };
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        error: "Empty response from model",
        modelUsed: config.model,
        providerUsed: config.provider.name,
      };
    }

    return {
      success: true,
      report: parseReportFromContent(content, config),
      modelUsed: config.model,
      providerUsed: config.provider.name,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      modelUsed: config.model,
      providerUsed: config.provider.name,
    };
  }
}

/* ─── Anthropic-specific call ── */

async function callAnthropic(
  config: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
): Promise<AIResult> {
  const apiKey = process.env[config.provider.apiKeyEnv];
  if (!apiKey) {
    return { success: false, error: `Missing API key: ${config.provider.apiKeyEnv}`, modelUsed: config.model, providerUsed: config.provider.name };
  }

  try {
    const response = await fetch(`${config.provider.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      return {
        success: false,
        error: `Anthropic API error ${response.status}: ${errorBody.slice(0, 200)}`,
        modelUsed: config.model,
        providerUsed: config.provider.name,
      };
    }

    const data = await response.json() as {
      content: Array<{ text: string }>;
    };

    const content = data.content?.[0]?.text;
    if (!content) {
      return {
        success: false,
        error: "Empty response from Anthropic model",
        modelUsed: config.model,
        providerUsed: config.provider.name,
      };
    }

    return {
      success: true,
      report: parseReportFromContent(content, config),
      modelUsed: config.model,
      providerUsed: config.provider.name,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      modelUsed: config.model,
      providerUsed: config.provider.name,
    };
  }
}

/* ─── Parse JSON from model response ── */

function parseReportFromContent(content: string, config: ModelConfig): StructuredReport {
  // Try to extract JSON from markdown code block first
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();

  try {
    const parsed = JSON.parse(jsonStr) as StructuredReport;

    // Fill in model info
    parsed.model = parsed.model || config.model;
    parsed.generatedAt = parsed.generatedAt || new Date().toISOString();

    return sanitizeReport(parsed);
  } catch {
    // If parsing fails, return emergency fallback with context
    const fallback = buildEmergencyFallback();
    fallback.model = config.model;
    fallback.scoreMeaning = "The analysis engine returned unparseable output. Please try again.";
    return fallback;
  }
}

/* ─── Main Analysis Entry Point ── */

export async function analyzeStartup(request: AnalysisRequest): Promise<StructuredReport> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(request);

  // Try primary model
  const primaryConfig = loadPrimaryConfig();
  if (primaryConfig) {
    const result = await callModel(primaryConfig, systemPrompt, userPrompt);
    if (result.success && result.report) {
      return result.report;
    }
  }

  // Try fallback model
  const fallbackConfig = loadFallbackConfig();
  if (fallbackConfig) {
    const result = await callModel(fallbackConfig, systemPrompt, userPrompt);
    if (result.success && result.report) {
      return result.report;
    }
  }

  // Emergency deterministic fallback
  const fallback = buildEmergencyFallback();
  fallback.generatedAt = new Date().toISOString();
  fallback.scoreMeaning = "The intelligence engine could not complete a full analysis at this time. This is a temporary issue — please try again. If the problem persists, your materials may be accessible for a manual review.";
  return fallback;
}

/* ─── Provider-agnostic call dispatcher ── */

async function callModel(
  config: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
): Promise<AIResult> {
  switch (config.provider.name) {
    case "anthropic":
      return callAnthropic(config, systemPrompt, userPrompt);
    default:
      return callOpenAICompatible(config, systemPrompt, userPrompt);
  }
}

/* ─── Get available providers from env ── */

export function getConfiguredProviders(): { primary: ModelConfig | null; fallback: ModelConfig | null } {
  return {
    primary: loadPrimaryConfig(),
    fallback: loadFallbackConfig(),
  };
}
