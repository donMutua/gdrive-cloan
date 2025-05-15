"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { UserSync } from "../auth/user-sync";
import DashboardContent from "@/components/file-system/dashboard-content";

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <UserSync>
        <DashboardContent />
      </UserSync>
    </ErrorBoundary>
  );
}
