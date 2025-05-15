/**
 * Log errors in a standardized format
 * @param error Error object or message
 * @param context Optional context string
 */
export function logError(error: unknown, context?: string) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  const errorStack = error instanceof Error ? error.stack : "No stack trace";

  console.error(`[${context || "ERROR"}]`, errorMessage, errorStack);

  // In production, we can use a logging service
  // to send the error details to a monitoring service
  // For example, using Sentry or LogRocket
  if (process.env.NODE_ENV === "production") {
    // Example: Send to Sentry, LogRocket, etc.
    // Sentry.captureException(error);
  }
}
