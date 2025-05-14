"use client";

import { FolderPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateFolder: () => void;
  onUploadFile: () => void;
}

export function EmptyState({ onCreateFolder, onUploadFile }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-primary/10 rounded-full p-6 mb-4">
        <FolderPlus className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">No files yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Get started by creating a new folder or uploading a file
      </p>
      <div className="flex gap-4">
        <Button onClick={onCreateFolder}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Create Folder
        </Button>
        <Button variant="outline" onClick={onUploadFile}>
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>
    </div>
  );
}
