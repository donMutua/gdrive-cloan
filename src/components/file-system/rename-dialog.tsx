"use client";

import type React from "react";

import { useState, useEffect } from "react";
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

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
  itemType: "file" | "folder";
  itemId?: string;
}

export function RenameDialog({
  isOpen,
  onClose,
  onRename,
  currentName,
  itemType,
  itemId,
}: RenameDialogProps) {
  useAuthGuard(); // Called for its auth-guarding side effect
  const [name, setName] = useState(currentName);
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError(null);
    }
  }, [isOpen, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(
        `${itemType === "file" ? "File" : "Folder"} name cannot be empty`
      );
      return;
    }

    if (name.trim() === currentName) {
      onClose();
      return;
    }

    setIsRenaming(true);
    setError(null);

    try {
      // Call API to rename item
      if (!itemId) {
        // If no itemId is provided, just call the callback (for backward compatibility)
        onRename(name.trim());
        onClose();
        return;
      }

      const endpoint =
        itemType === "file" ? `/api/files/${itemId}` : `/api/folders/${itemId}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to rename ${itemType}`);
      }

      // Consume the response body, e.g., if it contains the updated item data (though not used here)
      await response.json();

      // Call the callback with the new name
      onRename(name.trim());

      // Close dialog
      onClose();
    } catch (error) {
      console.error(`Error renaming ${itemType}:`, error);
      setError(
        error instanceof Error ? error.message : `Failed to rename ${itemType}`
      );
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename {itemType}</DialogTitle>
          <DialogDescription>
            Enter a new name for this {itemType}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                autoFocus
                disabled={isRenaming}
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
              onClick={onClose}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isRenaming || !name.trim() || name.trim() === currentName
              }
            >
              {isRenaming ? "Renaming..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
