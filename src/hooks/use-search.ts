"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useDebounce } from "@/hooks/use-debounce";
import { logError } from "@/lib/error-logger";
import type { FileType, FolderType } from "@/types/file-system";

interface SearchResult {
  folders: (FolderType & { type: "folder" })[];
  files: (FileType & { itemType: "file" })[];
  total: number;
}

// Function to search files and folders
const searchItems = async (query: string): Promise<SearchResult> => {
  try {
    if (!query || query.length < 2) {
      return { folders: [], files: [], total: 0 };
    }

    const response = await fetch(
      `/api/search?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error(`Error searching: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logError(error, "useSearch.searchItems");
    throw error;
  }
};

export function useSearch() {
  const { userId, isLoaded } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Search query
  const searchQueryResult = useQuery({
    queryKey: ["search", userId, debouncedQuery],
    queryFn: () => searchItems(debouncedQuery),
    enabled: !!userId && isLoaded && debouncedQuery.length >= 2,
  });

  return {
    searchQuery,
    setSearchQuery,
    results: searchQueryResult.data,
    isLoading: searchQueryResult.isLoading,
    isError: searchQueryResult.isError,
    error: searchQueryResult.error,
  };
}
