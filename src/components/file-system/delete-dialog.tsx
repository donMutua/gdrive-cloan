"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useState } from "react";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: "file" | "folder";
  itemId?: string;
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  itemId,
}: DeleteDialogProps) {
  useAuthGuard(); // Called for its auth-guarding side effect
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!itemId) {
      // If no itemId is provided, just call the callback (for backward compatibility)
      onConfirm();
      onClose();
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // Call API to delete item
      const endpoint =
        itemType === "file" ? `/api/files/${itemId}` : `/api/folders/${itemId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete ${itemType}`);
      }

      // Call the callback
      onConfirm();

      // Close dialog
      onClose();
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      setError(
        error instanceof Error ? error.message : `Failed to delete ${itemType}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the {itemType}{" "}
            <span className="font-medium">{itemName}</span>. This action cannot
            be undone.
            {error && (
              <div className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
