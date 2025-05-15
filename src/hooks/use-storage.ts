"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { logError } from "@/lib/error-logger";

interface StorageStats {
  storageUsed: number;
  storageLimit: number;
  storagePercentage: number;
  formattedStorageUsed: string;
  formattedStorageLimit: string;
  fileCount: number;
  folderCount: number;
  typeDistribution: {
    type: string;
    size: number;
    formattedSize: string;
    percentage: number;
  }[];
}

// Function to fetch storage stats
const fetchStorage = async (): Promise<StorageStats> => {
  try {
    const response = await fetch("/api/storage");
    if (!response.ok) {
      throw new Error(`Error fetching storage: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logError(error, "useStorage.fetchStorage");
    throw error;
  }
};

export function useStorage() {
  const { userId, isLoaded } = useAuth();

  // Get storage stats query
  const storageQuery = useQuery({
    queryKey: ["storage", userId],
    queryFn: fetchStorage,
    enabled: !!userId && isLoaded,
    // Refresh every 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });

  // Get formatted storage percentage
  const getStoragePercentageFormatted = () => {
    if (storageQuery.data) {
      return `${storageQuery.data.storagePercentage}%`;
    }
    return "0%";
  };

  // Get storage color based on percentage
  const getStorageColor = () => {
    if (!storageQuery.data) return "bg-primary";

    const percentage = storageQuery.data.storagePercentage;
    if (percentage < 50) return "bg-primary";
    if (percentage < 80) return "bg-amber-500";
    return "bg-destructive";
  };

  return {
    storage: storageQuery.data,
    isLoading: storageQuery.isLoading,
    isError: storageQuery.isError,
    error: storageQuery.error,

    // Helper functions
    getStoragePercentageFormatted,
    getStorageColor,
  };
}
