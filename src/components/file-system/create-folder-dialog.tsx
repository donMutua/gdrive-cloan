"use client";

import type React from "react";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import type { FolderType } from "@/types/file-system";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newFolder: FolderType) => void;
  parentId: string | null;
}

export function CreateFolderDialog({
  isOpen,
  onClose,
  onCreate,
  parentId,
}: CreateFolderDialogProps) {
  useAuthGuard(); // Called for its auth-guarding side effect
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Call API to create folder
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          parentId: parentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create folder");
      }

      // Get created folder data
      const newFolder: FolderType = await response.json();

      // Call the callback with the folder data
      onCreate(newFolder);

      // Reset form and close dialog
      setName("");
      onClose();
    } catch (error) {
      console.error("Error creating folder:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create folder"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setName("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new folder</DialogTitle>
          <DialogDescription>
            Enter a name for your new folder.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder name</Label>
              <Input
                id="folder-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="My Folder"
                autoFocus
                disabled={isCreating}
              />
              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !name.trim()}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
