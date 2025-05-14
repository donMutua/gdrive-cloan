"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { FileCard } from "@/components/file-system/file-card";
import { FolderCard } from "@/components/file-system/folder-card";
import { FilePreviewModal } from "@/components/file-system/file-preview-modal";
import { RenameDialog } from "@/components/file-system/rename-dialog";
import { CreateFolderDialog } from "@/components/file-system/create-folder-dialog";
import { DeleteDialog } from "@/components/file-system/delete-dialog";
import { EmptyState } from "@/components/file-system/empty-state";
import type { FileType, FolderType } from "@/types/file-system";
import { generateDummyFiles, generateDummyFolders } from "@/lib/dummy-data";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploadDialog } from "@/components/file-system/file-upload-dialog";
import { MoveToFolderDialog } from "@/components/file-system/move-to-folder-dialog";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{
    id: string;
    name: string;
    type: "file" | "folder";
  } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: "file" | "folder";
  } | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string | null; name: string }[]
  >([{ id: null, name: "My Drive" }]);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<string | null>(null);
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false);
  const [, setActiveId] = useState<string | null>(null);

  // Load dummy data
  useEffect(() => {
    setFiles(generateDummyFiles());
    setFolders(generateDummyFolders());
  }, []);

  // Filter files and folders based on current folder
  const filteredFiles = files.filter((file) => file.parentId === currentFolder);
  const filteredFolders = folders.filter(
    (folder) => folder.parentId === currentFolder
  );
  const isEmpty = filteredFiles.length === 0 && filteredFolders.length === 0;

  // Handle folder navigation
  const handleOpenFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      setCurrentFolder(folderId);
      setBreadcrumbs([...breadcrumbs, { id: folderId, name: folder.name }]);
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  // Handle file preview
  const handleFilePreview = (file: FileType) => {
    setSelectedFile(file);
    setIsFilePreviewOpen(true);
  };

  // Handle rename
  const handleRenameClick = (id: string, type: "file" | "folder") => {
    const item =
      type === "file"
        ? files.find((f) => f.id === id)
        : folders.find((f) => f.id === id);

    if (item) {
      setItemToRename({ id, name: item.name, type });
      setIsRenameDialogOpen(true);
    }
  };

  const handleRename = (newName: string) => {
    if (!itemToRename) return;

    if (itemToRename.type === "file") {
      setFiles(
        files.map((file) =>
          file.id === itemToRename.id ? { ...file, name: newName } : file
        )
      );
    } else {
      setFolders(
        folders.map((folder) =>
          folder.id === itemToRename.id ? { ...folder, name: newName } : folder
        )
      );
    }
  };

  // Handle delete
  const handleDeleteClick = (id: string, type: "file" | "folder") => {
    const item =
      type === "file"
        ? files.find((f) => f.id === id)
        : folders.find((f) => f.id === id);

    if (item) {
      setItemToDelete({ id, name: item.name, type });
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "file") {
      setFiles(files.filter((file) => file.id !== itemToDelete.id));
    } else {
      // Delete folder and all its contents
      const folderIdsToDelete = [itemToDelete.id];

      // Find all subfolders recursively
      const findSubfolders = (parentId: string) => {
        const subfolders = folders.filter((f) => f.parentId === parentId);
        subfolders.forEach((folder) => {
          folderIdsToDelete.push(folder.id);
          findSubfolders(folder.id);
        });
      };

      findSubfolders(itemToDelete.id);

      // Delete all folders and files in those folders
      setFolders(
        folders.filter((folder) => !folderIdsToDelete.includes(folder.id))
      );
      setFiles(
        files.filter(
          (file) => !folderIdsToDelete.includes(file.parentId as string)
        )
      );
    }
  };

  // Handle create folder
  const handleCreateFolder = (name: string) => {
    const newFolder: FolderType = {
      id: `folder-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      parentId: currentFolder,
    };

    setFolders([...folders, newFolder]);
  };

  // Handle file upload
  const handleFilesUpload = (files: File[]) => {
    const newFiles = files.map((file) => {
      // Determine file type
      let fileType: FileType["type"] = "other";
      const fileName = file.name.toLowerCase();

      if (file.type.startsWith("image/")) {
        fileType = "image";
      } else if (fileName.endsWith(".pdf")) {
        fileType = "pdf";
      } else if (
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls") ||
        fileName.endsWith(".csv")
      ) {
        fileType = "spreadsheet";
      } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
        fileType = "word";
      } else if (fileName.endsWith(".txt") || !fileName.includes(".")) {
        fileType = "document";
      } else if (
        fileName.endsWith(".js") ||
        fileName.endsWith(".ts") ||
        fileName.endsWith(".html") ||
        fileName.endsWith(".css") ||
        fileName.endsWith(".json")
      ) {
        fileType = "code";
      }

      // Create a dummy URL for images
      let url;
      if (fileType === "image") {
        url = "/abstract-geometric-shapes.png";
      }

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: fileType,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        url,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        parentId: currentFolder,
      };
    });

    setFiles([...files, ...newFiles]);
  };

  // Handle moving files to folders
  const handleMoveToFolder = (targetFolderId: string | null) => {
    if (!itemToMove) return;

    setFiles(
      files.map((file) =>
        file.id === itemToMove ? { ...file, parentId: targetFolderId } : file
      )
    );

    setIsMoveDialogOpen(false);
    setItemToMove(null);
  };

  // DnD event handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (over && active.id !== over.id) {
      const overId = over.id as string;
      // Extract the folder ID from the droppable ID (format: folder-{id})
      const targetFolderId = overId.startsWith("folder-")
        ? overId.substring(7)
        : null;

      if (targetFolderId) {
        // Move the file to the target folder
        setFiles(
          files.map((file) =>
            file.id === active.id ? { ...file, parentId: targetFolderId } : file
          )
        );
      }
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-background">
        {/* Sidebar - hidden on mobile */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out md:block`}
        >
          <Sidebar
            onCreateFolder={() => setIsCreateFolderDialogOpen(true)}
            onUploadFile={() => setIsFileUploadDialogOpen(true)}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onViewChange={setView}
            currentView={view}
            onCreateFolder={() => setIsCreateFolderDialogOpen(true)}
            onUploadFile={() => setIsFileUploadDialogOpen(true)}
          />

          <div className="flex-1 overflow-y-auto">
            <main className="p-4">
              {/* Breadcrumbs */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-4">
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

              {/* Empty state */}
              {isEmpty && (
                <EmptyState
                  onCreateFolder={() => setIsCreateFolderDialogOpen(true)}
                  onUploadFile={() => setIsFileUploadDialogOpen(true)}
                />
              )}

              {/* Folders */}
              {filteredFolders.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-4">Folders</h2>
                  <div
                    className={
                      view === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        : "space-y-1"
                    }
                  >
                    {filteredFolders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        view={view}
                        onOpen={handleOpenFolder}
                        onDelete={(id) => handleDeleteClick(id, "folder")}
                        onRename={(id) => handleRenameClick(id, "folder")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {filteredFiles.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Files</h2>
                  <div
                    className={
                      view === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        : "space-y-1"
                    }
                  >
                    {filteredFiles.map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        view={view}
                        onPreview={handleFilePreview}
                        onDelete={(id) => handleDeleteClick(id, "file")}
                        onRename={(id) => handleRenameClick(id, "file")}
                        onMove={(id) => {
                          setItemToMove(id);
                          setIsMoveDialogOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Modals */}
        <FilePreviewModal
          file={selectedFile}
          isOpen={isFilePreviewOpen}
          onClose={() => setIsFilePreviewOpen(false)}
          onDelete={(id) => {
            setIsFilePreviewOpen(false);
            handleDeleteClick(id, "file");
          }}
          onRename={(id) => {
            setIsFilePreviewOpen(false);
            handleRenameClick(id, "file");
          }}
        />

        <RenameDialog
          isOpen={isRenameDialogOpen}
          onClose={() => setIsRenameDialogOpen(false)}
          onRename={handleRename}
          currentName={itemToRename?.name || ""}
          itemType={itemToRename?.type || "file"}
        />

        <CreateFolderDialog
          isOpen={isCreateFolderDialogOpen}
          onClose={() => setIsCreateFolderDialogOpen(false)}
          onCreate={handleCreateFolder}
        />

        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          itemName={itemToDelete?.name || ""}
          itemType={itemToDelete?.type || "file"}
        />

        <FileUploadDialog
          isOpen={isFileUploadDialogOpen}
          onClose={() => setIsFileUploadDialogOpen(false)}
          onUpload={handleFilesUpload}
          currentFolderId={currentFolder}
        />

        <MoveToFolderDialog
          isOpen={isMoveDialogOpen}
          onClose={() => setIsMoveDialogOpen(false)}
          onMove={handleMoveToFolder}
          folders={folders}
          currentFolderId={currentFolder}
        />
      </div>
    </DndContext>
  );
}
