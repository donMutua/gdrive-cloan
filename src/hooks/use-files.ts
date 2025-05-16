"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FileType } from "@/types/file-system";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { formatFileSize } from "@/lib/validations";

// Type for create file request
interface CreateFileRequest {
  name: string;
  type: string;
  size: number;
  key: string;
  url?: string;
  folderId: string | null;
}

// Type for rename file request
interface RenameFileRequest {
  id: string;
  name: string;
}

// Type for move file request
interface MoveFileRequest {
  id: string;
  targetFolderId: string | null;
}

// Function to fetch files
const fetchFiles = async (userId: string): Promise<FileType[]> => {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Error fetching files: ${error.message}`);
  }

  // Map from database format to application format
  return data.map((file) => ({
    id: file.id,
    name: file.name,
    type: file.type as FileType["type"],
    size: formatFileSize(file.size),
    url: file.url,
    createdAt: file.created_at,
    modifiedAt: file.modified_at,
    parentId: file.folder_id,
  }));
};

// Function to create a file (record in database after upload)
const createFile = async (
  userId: string,
  fileData: CreateFileRequest
): Promise<FileType> => {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("files")
    .insert({
      name: fileData.name,
      type: fileData.type,
      size: fileData.size,
      key: fileData.key,
      url: fileData.url,
      folder_id: fileData.folderId,
      user_id: userId,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Error creating file: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type as FileType["type"],
    size: formatFileSize(data.size),
    url: data.url,
    createdAt: data.created_at,
    modifiedAt: data.modified_at,
    parentId: data.folder_id,
  };
};

// Function to rename a file by calling the API endpoint
const renameFileApi = async (
  renameData: RenameFileRequest
): Promise<FileType> => {
  const response = await fetch(`/api/files/${renameData.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: renameData.name }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: `Error renaming file: ${response.statusText}` }));
    throw new Error(
      errorData.error || `Error renaming file: ${response.statusText}`
    );
  }
  // The API returns data in FileType format already
  return await response.json();
};

// Function to delete a file by calling the API endpoint
const deleteFileApi = async (fileId: string): Promise<void> => {
  const response = await fetch(`/api/files/${fileId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: `Error deleting file: ${response.statusText}` }));
    throw new Error(
      errorData.error || `Error deleting file: ${response.statusText}`
    );
  }
  // API returns { message: "File deleted successfully" } on success, no need to parse body for void return
};

// Function to move a file by calling the API endpoint
const moveFileApi = async (moveData: MoveFileRequest): Promise<FileType> => {
  const response = await fetch(`/api/files/${moveData.id}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetFolderId: moveData.targetFolderId }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: `Error moving file: ${response.statusText}` }));
    throw new Error(
      errorData.error || `Error moving file: ${response.statusText}`
    );
  }
  // The API returns data in FileType format already
  return await response.json();
};

// Custom hook to get files
export function useFiles(userId: string) {
  const queryClient = useQueryClient();

  // Get files query
  const filesQuery = useQuery({
    queryKey: ["files", userId],
    queryFn: () => fetchFiles(userId),
    enabled: !!userId,
  });

  // Create file mutation
  const createFileMutation = useMutation({
    mutationFn: (fileData: CreateFileRequest) => createFile(userId, fileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", userId] });
    },
  });

  // Rename file mutation
  const renameFileMutation = useMutation({
    mutationFn: renameFileApi, // Use the API calling function
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", userId] });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: deleteFileApi, // Use the API calling function
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", userId] });
    },
  });

  // Move file mutation
  const moveFileMutation = useMutation({
    mutationFn: moveFileApi, // Use the API calling function
    onMutate: async (movedFileData: MoveFileRequest) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["files", userId] });

      // Snapshot the previous value
      const previousFiles = queryClient.getQueryData<FileType[]>([
        "files",
        userId,
      ]);

      // Optimistically update to the new state
      if (previousFiles) {
        queryClient.setQueryData<FileType[]>(["files", userId], (oldFiles) =>
          (oldFiles || []).map((file) =>
            file.id === movedFileData.id
              ? {
                  ...file,
                  parentId: movedFileData.targetFolderId,
                  modifiedAt: new Date().toISOString(), // Update modifiedAt optimistically
                }
              : file
          )
        );
      }

      // Return a context object with the snapshotted value
      return { previousFiles };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, movedFileData, context) => {
      if (context?.previousFiles) {
        queryClient.setQueryData<FileType[]>(
          ["files", userId],
          context.previousFiles
        );
      }
      // Optionally, log the error or show a notification to the user
      console.error("Error moving file, rolled back:", err);
    },
    // Always refetch after error or success to ensure data consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["files", userId] });
    },
  });

  return {
    files: filesQuery.data || [],
    isLoading: filesQuery.isLoading,
    isError: filesQuery.isError,
    error: filesQuery.error,

    // Mutations
    createFile: createFileMutation.mutate,
    isCreating: createFileMutation.isPending,

    renameFile: renameFileMutation.mutate,
    isRenaming: renameFileMutation.isPending,

    deleteFile: deleteFileMutation.mutate,
    isDeleting: deleteFileMutation.isPending,

    moveFile: moveFileMutation.mutate,
    isMoving: moveFileMutation.isPending,

    // Get files for a specific folder
    getFilesForFolder: (folderId: string | null) => {
      return (filesQuery.data || []).filter(
        (file) => file.parentId === folderId
      );
    },

    // Get a specific file by ID
    getFileById: (id: string) => {
      return filesQuery.data?.find((file) => file.id === id) || null;
    },
  };
}
