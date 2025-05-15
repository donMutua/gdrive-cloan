"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
import { DragDropZone } from "@/components/file-system/drag-drop-zone";

// Add these imports at the top
import { MoveCopyDialog } from "@/components/file-system/move-copy-dialog";
import { FileSystemDndContext } from "@/components/file-system/dnd-context";
import { DraggableItem } from "@/components/file-system/draggable-item";
import { DroppableFolder } from "@/components/file-system/droppable-folder";

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

  // Add these state variables inside the Dashboard component
  const [isMoveCopyDialogOpen, setIsMoveCopyDialogOpen] = useState(false);
  const [itemToMoveCopy, setItemToMoveCopy] = useState<{
    id: string;
    name: string;
    type: "file" | "folder";
    mode: "move" | "copy";
  } | null>(null);

  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle file upload - directly trigger file input
  const handleUploadFile = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      handleFilesUpload(filesArray);
    }
  };

  // Add a new function to handle file uploads
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

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Update the state for file upload dialog
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false);

  // Add these handler functions inside the Dashboard component

  // Handle move/copy menu click
  const handleMoveCopyClick = (
    id: string,
    type: "file" | "folder",
    mode: "move" | "copy"
  ) => {
    const item =
      type === "file"
        ? files.find((f) => f.id === id)
        : folders.find((f) => f.id === id);

    if (item) {
      setItemToMoveCopy({ id, name: item.name, type, mode });
      setIsMoveCopyDialogOpen(true);
    }
  };

  // Handle move/copy action
  const handleMoveCopy = (targetFolderId: string | null) => {
    if (!itemToMoveCopy) return;

    if (itemToMoveCopy.mode === "move") {
      // Move the item
      if (itemToMoveCopy.type === "file") {
        setFiles(
          files.map((file) =>
            file.id === itemToMoveCopy.id
              ? { ...file, parentId: targetFolderId }
              : file
          )
        );
      } else {
        // Check if we're trying to move a folder into itself or its descendants
        const isValidMove = !isDescendantFolder(
          itemToMoveCopy.id,
          targetFolderId
        );

        if (isValidMove) {
          setFolders(
            folders.map((folder) =>
              folder.id === itemToMoveCopy.id
                ? { ...folder, parentId: targetFolderId }
                : folder
            )
          );
        }
      }
    } else {
      // Copy the item
      if (itemToMoveCopy.type === "file") {
        const fileToCopy = files.find((f) => f.id === itemToMoveCopy.id);
        if (fileToCopy) {
          const newFile: FileType = {
            ...fileToCopy,
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `Copy of ${fileToCopy.name}`,
            parentId: targetFolderId,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
          };
          setFiles([...files, newFile]);
        }
      } else {
        const folderToCopy = folders.find((f) => f.id === itemToMoveCopy.id);
        if (folderToCopy) {
          // Create a map of old folder IDs to new folder IDs
          const folderIdMap = new Map<string, string>();

          // Copy the folder
          const newFolderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          folderIdMap.set(folderToCopy.id, newFolderId);

          const newFolder: FolderType = {
            ...folderToCopy,
            id: newFolderId,
            name: `Copy of ${folderToCopy.name}`,
            parentId: targetFolderId,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
          };

          // Find all subfolders and files
          const subfolders = findAllDescendantFolders(folderToCopy.id);
          const newSubfolders = subfolders.map((subfolder) => {
            const newSubfolderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 5)}`;
            folderIdMap.set(subfolder.id, newSubfolderId);

            return {
              ...subfolder,
              id: newSubfolderId,
              parentId:
                subfolder.parentId === folderToCopy.id
                  ? newFolderId
                  : folderIdMap.get(subfolder.parentId as string),
              createdAt: new Date().toISOString(),
              modifiedAt: new Date().toISOString(),
            };
          });

          // Find all files in the folder and subfolders
          const filesToCopy = files.filter(
            (file) =>
              file.parentId === folderToCopy.id ||
              subfolders.some((sf) => sf.id === file.parentId)
          );

          const newFiles = filesToCopy.map((file) => ({
            ...file,
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 5)}`,
            parentId:
              file.parentId === folderToCopy.id
                ? newFolderId
                : folderIdMap.get(file.parentId as string),
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
          }));

          setFolders([...folders, newFolder, ...newSubfolders]);
          setFiles([...files, ...newFiles]);
        }
      }
    }
  };

  // Helper function to check if a folder is a descendant of another folder
  const isDescendantFolder = (
    folderId: string,
    targetFolderId: string | null
  ): boolean => {
    if (targetFolderId === null) return false;
    if (folderId === targetFolderId) return true;

    const targetFolder = folders.find((f) => f.id === targetFolderId);
    if (!targetFolder) return false;

    return isDescendantFolder(folderId, targetFolder.parentId);
  };

  // Helper function to find all descendant folders
  const findAllDescendantFolders = (parentId: string): FolderType[] => {
    const directChildren = folders.filter((f) => f.parentId === parentId);
    const descendants = [...directChildren];

    directChildren.forEach((child) => {
      descendants.push(...findAllDescendantFolders(child.id));
    });

    return descendants;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Sidebar - hidden on mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out md:block`}
      >
        <Sidebar
          onCreateFolder={() => setIsCreateFolderDialogOpen(true)}
          onUploadFile={handleUploadFile}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onViewChange={setView}
          currentView={view}
          onCreateFolder={() => setIsCreateFolderDialogOpen(true)}
          onUploadFile={handleUploadFile}
        />

        <FileSystemDndContext
          files={files}
          folders={folders}
          currentView={view}
          onMoveItem={(itemId, itemType, targetFolderId, showDialog = true) => {
            if (showDialog) {
              // Show dialog for menu-initiated moves
              handleMoveCopyClick(itemId, itemType, "move");
            } else {
              // Direct move for drag and drop without dialog
              if (itemType === "file") {
                setFiles(
                  files.map((file) =>
                    file.id === itemId
                      ? { ...file, parentId: targetFolderId }
                      : file
                  )
                );
              } else {
                // Check if we're trying to move a folder into itself or its descendants
                const isValidMove = !isDescendantFolder(itemId, targetFolderId);

                if (isValidMove) {
                  setFolders(
                    folders.map((folder) =>
                      folder.id === itemId
                        ? { ...folder, parentId: targetFolderId }
                        : folder
                    )
                  );
                }
              }
            }
          }}
          onPreviewFile={handleFilePreview}
          onDeleteItem={handleDeleteClick}
          onRenameItem={handleRenameClick}
          onMoveItemMenu={(id, type) => handleMoveCopyClick(id, type, "move")}
          onCopyItem={(id, type) => handleMoveCopyClick(id, type, "copy")}
        >
          <DragDropZone
            onFilesDrop={handleFilesUpload}
            className="flex-1 overflow-y-auto"
          >
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
                  onUploadFile={handleUploadFile}
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
                      <DroppableFolder key={folder.id} id={folder.id}>
                        <DraggableItem
                          id={folder.id}
                          data={folder}
                          type="folder"
                        >
                          <FolderCard
                            folder={folder}
                            view={view}
                            onOpen={handleOpenFolder}
                            onDelete={(id) => handleDeleteClick(id, "folder")}
                            onRename={(id) => handleRenameClick(id, "folder")}
                            onMove={(id) =>
                              handleMoveCopyClick(id, "folder", "move")
                            }
                            onCopy={(id) =>
                              handleMoveCopyClick(id, "folder", "copy")
                            }
                          />
                        </DraggableItem>
                      </DroppableFolder>
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
                      <DraggableItem
                        key={file.id}
                        id={file.id}
                        data={file}
                        type="file"
                      >
                        <FileCard
                          file={file}
                          view={view}
                          onPreview={handleFilePreview}
                          onDelete={(id) => handleDeleteClick(id, "file")}
                          onRename={(id) => handleRenameClick(id, "file")}
                          onMove={(id) =>
                            handleMoveCopyClick(id, "file", "move")
                          }
                          onCopy={(id) =>
                            handleMoveCopyClick(id, "file", "copy")
                          }
                        />
                      </DraggableItem>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </DragDropZone>
        </FileSystemDndContext>
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
      <MoveCopyDialog
        isOpen={isMoveCopyDialogOpen}
        onClose={() => setIsMoveCopyDialogOpen(false)}
        onMove={handleMoveCopy}
        folders={folders}
        currentFolderId={currentFolder}
        itemName={itemToMoveCopy?.name || ""}
        itemType={itemToMoveCopy?.type || "file"}
        mode={itemToMoveCopy?.mode || "move"}
      />
    </div>
  );
}
