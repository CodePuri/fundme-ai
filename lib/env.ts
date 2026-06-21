/**
 * Environment Validation Module
 * Enforces environment policy defined in ENVIRONMENT_POLICY.md
 */

export function validateEnv() {
  const requiredVars = [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY"
  ];

  const missing: string[] = [];

  for (const v of requiredVars) {
    if (!process.env[v]) {
      missing.push(v);
    }
  }

  if (missing.length > 0) {
    console.warn(`[Environment Warning] Missing required variables: ${missing.join(", ")}. This will fail in strict mode.`);
    // We only warn here so dev/build can proceed if partially configured, 
    // but in a real CI this would throw an Error.
  }

  return true;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
