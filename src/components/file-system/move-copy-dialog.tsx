"use client";

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
import { FolderIcon } from "./file-type-icons";
import { ChevronRight } from "lucide-react";
import type { FolderType } from "@/types/file-system";

interface MoveCopyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetFolderId: string | null) => void;
  folders: FolderType[];
  currentFolderId: string | null;
  itemName: string;
  itemType: "file" | "folder";
  mode: "move" | "copy";
}

export function MoveCopyDialog({
  isOpen,
  onClose,
  onMove,
  folders,
  currentFolderId,
  itemName,
  itemType,
  mode,
}: MoveCopyDialogProps) {
  const [, setSelectedFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string | null; name: string }[]
  >([{ id: null, name: "My Drive" }]);

  // Reset selected folder when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(null);
      setBreadcrumbs([{ id: null, name: "My Drive" }]);
    }
  }, [isOpen]);

  // Get folders for the current view
  const getFoldersForView = (parentId: string | null) => {
    return folders.filter((folder) => folder.parentId === parentId);
  };

  // Handle folder navigation
  const handleFolderClick = (folder: FolderType) => {
    setSelectedFolderId(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setSelectedFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  // Get current view folders
  const currentViewFolders = getFoldersForView(
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "move" ? "Move" : "Copy"} {itemType}
          </DialogTitle>
          <DialogDescription>
            Select a destination folder to {mode === "move" ? "move" : "copy"}{" "}
            <span className="font-medium">{itemName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-2 border-b">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                )}
                <Button
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {crumb.name}
                </Button>
              </div>
            ))}
          </div>

          {/* Folder list */}
          <div className="max-h-[300px] overflow-y-auto">
            {currentViewFolders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No folders found
              </div>
            ) : (
              <div className="space-y-1">
                {currentViewFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => handleFolderClick(folder)}
                  >
                    <div className="mr-3">
                      <FolderIcon className="w-8 h-8" />
                    </div>
                    <div className="font-medium">{folder.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const targetId = breadcrumbs[breadcrumbs.length - 1].id;
              // Don't allow moving to the same folder
              if (mode === "move" && targetId === currentFolderId) {
                return;
              }
              onMove(targetId);
              onClose();
            }}
          >
            {mode === "move" ? "Move here" : "Copy here"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
