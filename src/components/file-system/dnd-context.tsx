"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { FileType, FolderType } from "@/types/file-system";
import { FileCard } from "./file-card";
import { FolderCard } from "./folder-card";

type DraggableItem = {
  id: string;
  type: "file" | "folder";
  data: FileType | FolderType;
};

type FileSystemDndContextProps = {
  children: React.ReactNode;
  onMoveItem: (
    itemId: string,
    itemType: "file" | "folder",
    targetFolderId: string | null,
    showDialog?: boolean
  ) => void;
  files: FileType[];
  folders: FolderType[];
  currentView: "grid" | "list";
  onPreviewFile: (file: FileType) => void;
  onDeleteItem: (id: string, type: "file" | "folder") => void;
  onRenameItem: (id: string, type: "file" | "folder") => void;
  onMoveItemMenu: (id: string, type: "file" | "folder") => void;
  onCopyItem: (id: string, type: "file" | "folder") => void;
};

// Create a context to track active droppable folders
const DroppableFoldersContext = createContext<string[]>([]);

export function useDroppableFolders() {
  return useContext(DroppableFoldersContext);
}

export function FileSystemDndContext({
  children,
  onMoveItem,
  folders,
  currentView,
  onPreviewFile,
  onDeleteItem,
  onRenameItem,
  onMoveItemMenu,
  onCopyItem,
}: FileSystemDndContextProps) {
  const [activeItem, setActiveItem] = useState<DraggableItem | null>(null);
  const [droppableFolders, setDroppableFolders] = useState<string[]>([]);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { id, data } = event.active.data.current as {
      id: string;
      data: FileType | FolderType;
      type: "file" | "folder";
    };

    // Set the active item
    setActiveItem({
      id,
      type: "parentId" in data ? "file" : "folder",
      data,
    });

    // Find all folder IDs to use as drop targets
    const folderIds = folders.map((folder) => folder.id);
    setDroppableFolders(folderIds);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;

    // If dropped over a folder
    if (over && activeItem) {
      const targetFolderId = over.id as string;
      onMoveItem(activeItem.id, activeItem.type, targetFolderId, false); // Pass false to not show dialog
    }

    // Reset state
    setActiveItem(null);
    setDroppableFolders([]);
  };

  // Handle drag cancel
  const handleDragCancel = () => {
    setActiveItem(null);
    setDroppableFolders([]);
  };

  return (
    <DroppableFoldersContext.Provider value={droppableFolders}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}

        {/* Drag overlay - shows what's being dragged */}
        <DragOverlay adjustScale style={{ transformOrigin: "0 0" }}>
          {activeItem && activeItem.type === "file" && (
            <div className="opacity-80">
              <FileCard
                file={activeItem.data as FileType}
                view={currentView}
                onPreview={onPreviewFile}
                onDelete={(id) => onDeleteItem(id, "file")}
                onRename={(id) => onRenameItem(id, "file")}
                onMove={(id) => onMoveItemMenu(id, "file")}
                onCopy={(id) => onCopyItem(id, "file")}
              />
            </div>
          )}
          {activeItem && activeItem.type === "folder" && (
            <div className="opacity-80">
              <FolderCard
                folder={activeItem.data as FolderType}
                view={currentView}
                onOpen={() => {}}
                onDelete={(id) => onDeleteItem(id, "folder")}
                onRename={(id) => onRenameItem(id, "folder")}
                onMove={(id) => onMoveItemMenu(id, "folder")}
                onCopy={(id) => onCopyItem(id, "folder")}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </DroppableFoldersContext.Provider>
  );
}
