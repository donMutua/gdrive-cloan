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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, FolderIcon, Home } from "lucide-react";
import type { FolderType } from "@/types/file-system";

interface MoveToFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (folderId: string | null) => void;
  folders: FolderType[];
  currentFolderId: string | null;
  fileId: string | null;
}

export function MoveToFolderDialog({
  isOpen,
  onClose,
  onMove,
  folders,
  currentFolderId,
  fileId,
}: MoveToFolderDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<
    { id: string | null; name: string }[]
  >([{ id: null, name: "My Drive" }]);
  const [currentViewFolderId, setCurrentViewFolderId] = useState<string | null>(
    null
  );

  // Reset selection when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(null);
      setFolderPath([{ id: null, name: "My Drive" }]);
      setCurrentViewFolderId(null);
    }
  }, [isOpen]);

  // Get folders for the current view
  const filteredFolders = folders.filter(
    (folder) => folder.parentId === currentViewFolderId
  );

  // Navigate to a folder
  const handleFolderClick = (folder: FolderType) => {
    setCurrentViewFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
  };

  // Navigate using breadcrumbs
  const handleBreadcrumbClick = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentViewFolderId(newPath[newPath.length - 1].id);
  };

  // Select a folder for moving
  const handleSelectFolder = (folderId: string | null) => {
    // Don't allow moving to the current folder
    if (folderId !== currentFolderId) {
      setSelectedFolderId(folderId);
    }
  };

  // Handle the move action
  const handleMove = () => {
    if (fileId && selectedFolderId !== undefined) {
      onMove(selectedFolderId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Move to folder</DialogTitle>
          <DialogDescription>Select a destination folder</DialogDescription>
        </DialogHeader>

        {/* Breadcrumbs */}
        <div className="flex items-center space-x-1 text-sm overflow-x-auto py-2 border-b">
          {folderPath.map((crumb, index) => (
            <div key={index} className="flex items-center shrink-0">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground" />
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleBreadcrumbClick(index)}
              >
                {index === 0 ? (
                  <Home className="h-3 w-3 mr-1" />
                ) : (
                  <FolderIcon className="h-3 w-3 mr-1" />
                )}
                {crumb.name}
              </Button>
            </div>
          ))}
        </div>

        <ScrollArea className="h-[300px] pr-4">
          {/* Root folder option */}
          <div
            className={`flex items-center p-2 rounded-md cursor-pointer ${
              selectedFolderId === null ? "bg-accent" : "hover:bg-accent/50"
            } ${currentFolderId === null ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => currentFolderId !== null && handleSelectFolder(null)}
          >
            <Home className="h-5 w-5 mr-2 text-primary" />
            <span>My Drive</span>
          </div>

          {/* Folder list */}
          {filteredFolders.map((folder) => (
            <div
              key={folder.id}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                selectedFolderId === folder.id
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              } ${currentFolderId === folder.id ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div
                className="flex items-center flex-1"
                onClick={() =>
                  currentFolderId !== folder.id && handleSelectFolder(folder.id)
                }
              >
                <FolderIcon className="h-5 w-5 mr-2 text-primary" />
                <span>{folder.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleFolderClick(folder)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {filteredFolders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No folders found
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={
              selectedFolderId === undefined ||
              selectedFolderId === currentFolderId
            }
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
