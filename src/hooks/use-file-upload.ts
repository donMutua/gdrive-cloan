"use client";

import { useState } from "react";
import { getFileType } from "@/lib/cloudinary";
import { isValidFileName, isValidFileSize } from "@/lib/validations";
import { useFiles } from "./use-files";

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface UploadOptions {
  folderId: string | null;
  userId: string;
}

interface UploadProgress {
  [key: string]: number; // key is file name, value is progress percentage
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const { createFile } = useFiles("placeholder"); // We'll pass the real userId when calling uploadFiles

  const uploadFiles = async (files: File[], options: UploadOptions) => {
    const { folderId, userId } = options;
    const errors: string[] = [];
    setIsUploading(true);
    setUploadErrors([]);

    // Initialize progress for each file
    const initialProgress: UploadProgress = {};
    Array.from(files).forEach((file) => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);

    try {
      // Process each file
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file name
        if (!isValidFileName(file.name)) {
          errors.push(`Invalid file name: ${file.name}`);
          return;
        }

        // Validate file size
        if (!isValidFileSize(file.size, MAX_FILE_SIZE)) {
          errors.push(`File too large: ${file.name}. Maximum size is 10MB.`);
          return;
        }

        try {
          // In a real app, we would upload to Cloudinary here
          // For now, we'll simulate a file upload
          await simulateFileUpload(file.name, (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: progress,
            }));
          });

          // Create file record in database
          const fileType = getFileType(file.name);
          const fileUrl =
            fileType === "image" ? "/noprofilepic.png" : undefined;

          await createFile({
            name: file.name,
            type: fileType,
            size: file.size,
            key: `${userId}/${Date.now()}-${file.name}`, // Generate a key for storage
            url: fileUrl,
            folderId,
          });
        } catch (error) {
          errors.push(
            `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      });

      await Promise.all(uploadPromises);

      if (errors.length > 0) {
        setUploadErrors(errors);
        return { success: false, errors };
      }

      return { success: true };
    } finally {
      setIsUploading(false);
      // Reset progress
      setUploadProgress({});
    }
  };

  // Helper to simulate file upload progress
  const simulateFileUpload = async (
    fileName: string,
    progressCallback: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        progressCallback(progress);

        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 300); // Simulate network latency
    });
  };

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
    uploadErrors,
    clearErrors: () => setUploadErrors([]),
  };
}
