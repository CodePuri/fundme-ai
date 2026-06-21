/**
 * Error Monitoring Shell
 * Status: Pending external provider selection (e.g. Sentry).
 */

export function logError(error: Error | unknown, context?: Record<string, any>) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Error Monitor]`, error, context);
  }
  // TODO: Send to monitoring service in production
}

export function withErrorMonitor<T>(fn: () => T, context?: Record<string, any>): T {
  try {
    return fn();
  } catch (error) {
    logError(error, context);
    throw error;
  }
}
