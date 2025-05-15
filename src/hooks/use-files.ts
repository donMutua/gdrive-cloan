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

// Function to rename a file
const renameFile = async (fileData: RenameFileRequest): Promise<FileType> => {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("files")
    .update({
      name: fileData.name,
      modified_at: new Date().toISOString(),
    })
    .eq("id", fileData.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Error renaming file: ${error.message}`);
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

// Function to delete a file
const deleteFile = async (fileId: string): Promise<void> => {
  const supabase = getSupabaseBrowserClient();

  // First get the file to get the key for storage deletion
  const { error: fetchError } = await supabase
    .from("files")
    .select("key")
    .eq("id", fileId)
    .single();

  if (fetchError) {
    throw new Error(
      `Error fetching file before deletion: ${fetchError.message}`
    );
  }

  // Delete the file record
  const { error } = await supabase.from("files").delete().eq("id", fileId);

  if (error) {
    throw new Error(`Error deleting file: ${error.message}`);
  }

  // Note: In a real implementation, you'd also delete the file from storage
  // This would typically be handled by a server function or API route
  // Example: await deleteFromCloudinary(fileData.key);
};

// Function to move a file
const moveFile = async (moveData: MoveFileRequest): Promise<FileType> => {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("files")
    .update({
      folder_id: moveData.targetFolderId,
      modified_at: new Date().toISOString(),
    })
    .eq("id", moveData.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Error moving file: ${error.message}`);
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
    mutationFn: renameFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", userId] });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", userId] });
    },
  });

  // Move file mutation
  const moveFileMutation = useMutation({
    mutationFn: moveFile,
    onSuccess: () => {
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
