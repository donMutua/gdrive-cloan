"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/lib/providers";
import { ErrorBoundary } from "@/components/error-boundary";

type ClientLayoutProps = {
  children: React.ReactNode;
};

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ClerkProvider>
      <ErrorBoundary>
        <Providers>{children}</Providers>
      </ErrorBoundary>
    </ClerkProvider>
  );
}
