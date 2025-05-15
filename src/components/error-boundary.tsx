"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Error caught by error boundary:", error);
      setError(error.error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-6">
            We apologize for the inconvenience. An unexpected error occurred.
          </p>
          {error && (
            <div className="bg-muted p-3 rounded-md mb-4 overflow-auto max-h-32">
              <code className="text-sm">{error.message}</code>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
            <Button onClick={() => (window.location.href = "/")}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
