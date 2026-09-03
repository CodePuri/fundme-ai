const STAGING_SUPABASE_HOST = "nnzdplkjizwgsalizijd.supabase.co";

function configurationError(message) {
  return new Error(`Refusing to run write-capable integration tests: ${message}`);
}

export function assertStagingIntegrationEnvironment() {
  if (process.env.FUNDME_TEST_TARGET !== "staging") {
    throw configurationError("set FUNDME_TEST_TARGET=staging through the staging integration test command.");
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw configurationError("SUPABASE_URL is required and must point to the staging project.");
  }

  let hostname;
  try {
    hostname = new URL(supabaseUrl).hostname;
  } catch {
    throw configurationError("SUPABASE_URL is not a valid URL.");
  }

  if (hostname !== STAGING_SUPABASE_HOST) {
    throw configurationError(`SUPABASE_URL resolves to ${hostname}, not the FundMe staging project.`);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw configurationError("SUPABASE_SERVICE_ROLE_KEY is required for the staging integration suite.");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw configurationError("NEXT_PUBLIC_SUPABASE_ANON_KEY is required for the staging security checks.");
  }

  return { supabaseUrl };
}
