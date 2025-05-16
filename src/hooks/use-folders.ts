"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FolderType } from "@/types/file-system";
import { getSupabaseBrowserClient } from "@/lib/supabase";

// Type for create folder request
interface CreateFolderRequest {
  name: string;
  parentId: string | null;
}

// Type for rename folder request
interface RenameFolderRequest {
  id: string;
  name: string;
}

// Type for move folder request
interface MoveFolderRequest {
  id: string;
  targetFolderId: string | null;
}

// Function to fetch folders
const fetchFolders = async (userId: string): Promise<FolderType[]> => {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Error fetching folders: ${error.message}`);
  }

  // Map from database format to application format
  return data.map((folder) => ({
    id: folder.id,
    name: folder.name,
    createdAt: folder.created_at,
    modifiedAt: folder.modified_at,
    parentId: folder.parent_id,
  }));
};

// Function to create a folder
const createFolder = async (
  userId: string,
  folderData: CreateFolderRequest
): Promise<FolderType> => {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("folders")
    .insert({
      name: folderData.name,
      parent_id: folderData.parentId,
      user_id: userId,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Error creating folder: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    modifiedAt: data.modified_at,
    parentId: data.parent_id,
  };
};

// Function to rename a folder
const renameFolder = async (
  folderData: RenameFolderRequest
): Promise<FolderType> => {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("folders")
    .update({
      name: folderData.name,
      modified_at: new Date().toISOString(),
    })
    .eq("id", folderData.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Error renaming folder: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    modifiedAt: data.modified_at,
    parentId: data.parent_id,
  };
};

// Function to delete a folder
const deleteFolder = async (folderId: string): Promise<void> => {
  const supabase = getSupabaseBrowserClient();

  // First delete all files in the folder
  const { error: filesError } = await supabase
    .from("files")
    .delete()
    .eq("folder_id", folderId);

  if (filesError) {
    throw new Error(`Error deleting files in folder: ${filesError.message}`);
  }

  // Then delete the folder
  const { error } = await supabase.from("folders").delete().eq("id", folderId);

  if (error) {
    throw new Error(`Error deleting folder: ${error.message}`);
  }
};

// Function to move a folder by calling the API endpoint
const moveFolderApi = async (
  moveData: MoveFolderRequest
): Promise<FolderType> => {
  const response = await fetch(`/api/folders/${moveData.id}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetFolderId: moveData.targetFolderId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || `Error moving folder: ${response.statusText}`
    );
  }
  // The API returns data in the FolderType format already
  return await response.json();
};

// Custom hook to get folders
export function useFolders(userId: string) {
  const queryClient = useQueryClient();

  // Get folders query
  const foldersQuery = useQuery({
    queryKey: ["folders", userId],
    queryFn: () => fetchFolders(userId),
    enabled: !!userId,
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: (folderData: CreateFolderRequest) =>
      createFolder(userId, folderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", userId] });
    },
  });

  // Rename folder mutation
  const renameFolderMutation = useMutation({
    mutationFn: renameFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", userId] });
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", userId] });
      // Also invalidate files query since we may have deleted files
      queryClient.invalidateQueries({ queryKey: ["files", userId] });
    },
  });

  // Move folder mutation
  const moveFolderMutation = useMutation({
    mutationFn: moveFolderApi, // Use the new API calling function
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", userId] });
    },
  });

  // Helper function to check if a folder is a descendant of another
  const isDescendantFolder = (
    folderId: string,
    potentialDescendantId: string | null
  ): boolean => {
    // Check if potentialDescendantId is folderId or a descendant of folderId.
    // folderId is the folder being moved (the potential ancestor).
    // potentialDescendantId is the folder being considered as a destination.
    if (potentialDescendantId === null) return false; // Root cannot be a descendant in this context.
    if (folderId === potentialDescendantId) return true; // Moving into itself.

    const allFolders = foldersQuery.data || [];
    const potentialDescendantFolder = allFolders.find(
      (f) => f.id === potentialDescendantId
    );

    if (
      !potentialDescendantFolder ||
      potentialDescendantFolder.parentId === null
    ) {
      // Not found, or it's a root folder (and not folderId itself).
      return false;
    }
    // Recursively check if folderId is an ancestor of potentialDescendantFolder's parent.
    return isDescendantFolder(folderId, potentialDescendantFolder.parentId);
  };

  return {
    folders: foldersQuery.data || [],
    isLoading: foldersQuery.isLoading,
    isError: foldersQuery.isError,
    error: foldersQuery.error,

    // Mutations
    createFolder: createFolderMutation.mutate,
    isCreating: createFolderMutation.isPending,

    renameFolder: renameFolderMutation.mutate,
    isRenaming: renameFolderMutation.isPending,

    deleteFolder: deleteFolderMutation.mutate,
    isDeleting: deleteFolderMutation.isPending,

    moveFolder: moveFolderMutation.mutate,
    isMoving: moveFolderMutation.isPending,

    // Utility functions
    isDescendantFolder,

    // Get folders for a specific parent
    getFoldersForParent: (parentId: string | null) => {
      return (foldersQuery.data || []).filter(
        (folder) => folder.parentId === parentId
      );
    },
  };
}
