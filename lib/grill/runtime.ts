export type RuntimeMode = "demo" | "live";

type RuntimeEnvironment = {
  FUNDME_RUNTIME_MODE?: string;
  VERCEL_ENV?: string;
};

export class LiveRuntimeConfigurationError extends Error {
  constructor() {
    super(
      "Live runtime is not configured. Clerk, Supabase, AI, storage, and entitlement adapters must be configured explicitly.",
    );
    this.name = "LiveRuntimeConfigurationError";
  }
}

export function resolveRuntimeMode(
  configuredMode: string | undefined,
  vercelEnvironment: string | undefined,
): RuntimeMode {
  if (configuredMode !== undefined && configuredMode !== "demo" && configuredMode !== "live") {
    throw new Error(`Invalid FUNDME_RUNTIME_MODE: ${configuredMode}`);
  }
  if (configuredMode === "demo" || configuredMode === "live") return configuredMode;
  return vercelEnvironment === "production" ? "live" : "demo";
}

export function createServerRuntime(environment?: RuntimeEnvironment) {
  const source = environment ?? {
    FUNDME_RUNTIME_MODE: process.env.FUNDME_RUNTIME_MODE,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };
  const mode = resolveRuntimeMode(
    source.FUNDME_RUNTIME_MODE,
    source.VERCEL_ENV,
  );
  if (mode === "live") throw new LiveRuntimeConfigurationError();
  return { mode } as const;
}
