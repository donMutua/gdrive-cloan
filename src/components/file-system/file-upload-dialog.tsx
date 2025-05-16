"use client";

import type React from "react"; // Add useEffect

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuthGuard } from "@/hooks/use-auth-guard";

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  currentFolderId: string | null;
  initialFiles?: File[]; // Added prop for pre-selected files
}

export function FileUploadDialog({
  isOpen,
  onClose,
  onUpload,
  currentFolderId,
  initialFiles,
}: FileUploadDialogProps) {
  useAuthGuard(); // Called for its auth-guarding side effect
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialFiles && initialFiles.length > 0) {
        setSelectedFiles(initialFiles);
      } else {
        setSelectedFiles([]); // Reset if no initial files or dialog is simply opened
      }
      setUploadProgress({});
      setErrors([]);
      // Parent should clear initialFiles state after dialog uses them if needed
    }
  }, [isOpen, initialFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setErrors([]);

    // Initialize progress for each file
    const initialProgress: Record<string, number> = {};
    selectedFiles.forEach((file) => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);

    try {
      // Upload each file
      const uploadPromises = selectedFiles.map((file) => uploadFile(file));
      await Promise.all(uploadPromises);

      // If we get here, all uploads were successful
      onUpload(selectedFiles);
      setSelectedFiles([]);
      setUploadProgress({});
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      setErrors((prev) => [
        ...prev,
        error instanceof Error
          ? error.message
          : "An unknown error occurred during upload",
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (file: File): Promise<void> => {
    try {
      // Create a FormData instance
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolderId) {
        formData.append("folderId", currentFolderId);
      }

      // Since fetch doesn't directly support upload progress,
      // we'll simulate progress updates for better UX
      const updateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          if (progress > 95) {
            clearInterval(interval);
            return;
          }
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress,
          }));
        }, 100);

        return () => clearInterval(interval);
      };

      // Start progress simulation
      const stopProgressUpdates = updateProgress();

      // Perform the actual upload
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      // Stop progress simulation
      stopProgressUpdates();

      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to upload ${file.name}`);
      }

      // Set progress to 100% when done
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: 100,
      }));

      // Wait a moment to show the completed progress
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Return the file data from the response
      return await response.json();
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
      ]);
      throw error;
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFiles([]);
      setUploadProgress({});
      setErrors([]);
      onClose();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            {currentFolderId
              ? "Upload files to the current folder"
              : "Upload files to your drive"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {selectedFiles.length > 0 ? (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="truncate flex-1 mr-2">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    {!isUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {isUploading && (
                  <div className="mt-4">
                    {Object.entries(uploadProgress).map(
                      ([filename, progress]) => (
                        <div key={filename} className="mb-3">
                          <div className="flex justify-between mb-1 text-sm">
                            <span className="truncate">{filename}</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )
                    )}
                  </div>
                )}

                {errors.length > 0 && (
                  <div className="bg-destructive/10 p-3 rounded-md mt-2">
                    <h4 className="text-sm font-semibold text-destructive mb-1">
                      Upload Errors:
                    </h4>
                    <ul className="text-xs text-destructive">
                      {errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Click to upload</p>
                <p className="text-xs text-muted-foreground">
                  or drag and drop your files here
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <span className="flex items-center">
                  Uploading<span className="ml-2 animate-pulse">...</span>
                </span>
              ) : (
                <span className="flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
