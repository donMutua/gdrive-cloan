"use client";

import type React from "react";
import { useState } from "react";
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
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploadDialog } from "@/components/file-system/file-upload-dialog";
import { DragDropZone } from "@/components/file-system/drag-drop-zone";
import { MoveCopyDialog } from "@/components/file-system/move-copy-dialog";
import { FileSystemDndContext } from "@/components/file-system/dnd-context";
import { DraggableItem } from "@/components/file-system/draggable-item";
import { DroppableFolder } from "@/components/file-system/droppable-folder";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to fetch data from the API
const fetchFileSystemAPI = async (folderId: string | null) => {
  const queryPath = folderId ? `?parentId=${folderId}` : "";

  try {
    // Check for raw response format first
    const filesRes = await fetch(`/api/files${queryPath}`);
    const foldersRes = await fetch(`/api/folders${queryPath}`);

    if (!filesRes.ok)
      throw new Error(`Files API error: ${filesRes.statusText}`);
    if (!foldersRes.ok)
      throw new Error(`Folders API error: ${foldersRes.statusText}`);

    const filesData = await filesRes.json();
    const foldersData = await foldersRes.json();

    // Check if we're getting array or object with files/folders property
    const files = Array.isArray(filesData) ? filesData : filesData.files || [];
    const folders = Array.isArray(foldersData)
      ? foldersData
      : foldersData.folders || [];

    console.log("Fetched files:", files);
    console.log("Fetched folders:", folders);

    return { files, folders };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  // const [files, setFiles] = useState<FileType[]>([]); // Replaced by react-query
  // const [folders, setFolders] = useState<FolderType[]>([]); // Replaced by react-query
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
  const [isMoveCopyDialogOpen, setIsMoveCopyDialogOpen] = useState(false);
  const [itemToMoveCopy, setItemToMoveCopy] = useState<{
    id: string;
    name: string;
    type: "file" | "folder";
    mode: "move" | "copy";
  } | null>(null);
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false);
  const [initialFilesForUpload, setInitialFilesForUpload] = useState<File[]>(
    []
  );

  // const fileInputRef = useRef<HTMLInputElement>(null); // To be removed if hidden input is removed

  const queryClient = useQueryClient();

  // Fetching data with React Query
  const {
    data: fileSystemData,
    isLoading: isLoadingFileSystem,
    error: fileSystemError,
  } = useQuery({
    queryKey: ["fileSystem", currentFolder],
    queryFn: () => fetchFileSystemAPI(currentFolder),
  });

  const files: FileType[] = fileSystemData?.files || [];
  const folders: FolderType[] = fileSystemData?.folders || [];

  // Assuming API returns items already filtered by parentId (currentFolder)
  const filteredFiles = files;
  const filteredFolders = folders;

  const isEmpty = filteredFiles.length === 0 && filteredFolders.length === 0;

  const handleOpenFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      setCurrentFolder(folderId);
      setBreadcrumbs([...breadcrumbs, { id: folderId, name: folder.name }]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const handleFilePreview = (file: FileType) => {
    setSelectedFile(file);
    setIsFilePreviewOpen(true);
  };

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

  // Called by RenameDialog's onRename prop after successful API call in dialog
  const handleRenameSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["fileSystem", currentFolder] });
    // Optionally, could also invalidate a query for the specific item if needed elsewhere
  };

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

  // Called by DeleteDialog's onConfirm prop after successful API call in dialog
  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["fileSystem", currentFolder] });
  };

  // Called by CreateFolderDialog's onCreate prop after successful API call in dialog
  const handleCreateFolderSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["fileSystem", currentFolder] });
  };

  // Triggers the FileUploadDialog
  const handleUploadFileTrigger = () => {
    setInitialFilesForUpload([]); // Clear any previous selection for dialog
    setIsFileUploadDialogOpen(true);
  };

  // Called by FileUploadDialog's onUpload prop after successful API call in dialog
  const handleFileUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["fileSystem", currentFolder] });
    // Dialog will handle its own closing and state reset.
    // Clear initialFilesForUpload if they were used by the dialog
    setInitialFilesForUpload([]);
  };

  // Handler for DragDropZone to open FileUploadDialog with dropped files
  const handleDroppedFilesForUploadDialog = (droppedFiles: File[]) => {
    setInitialFilesForUpload(droppedFiles);
    setIsFileUploadDialogOpen(true);
  };

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

  const handleMoveCopy = () => {
    if (!itemToMoveCopy) return;
    console.warn(
      "handleMoveCopy needs to be implemented with API calls and useMutation."
    );
    // This function should use useMutation to call the backend API for move/copy.
    // On success, it should invalidate queries:
    // queryClient.invalidateQueries({ queryKey: ['fileSystem', currentFolder] });
    // if (targetFolderId !== currentFolder) {
    //   queryClient.invalidateQueries({ queryKey: ['fileSystem', targetFolderId] });
    // }
    // For now, just closing the dialog.
    setIsMoveCopyDialogOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Hidden file input removed, uploads handled by FileUploadDialog */}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out md:block`}
      >
        <Sidebar
          onCreateFolder={() => setIsCreateFolderDialogOpen(true)}
          onUploadFile={handleUploadFileTrigger}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onViewChange={setView}
          currentView={view}
          onCreateFolder={() => setIsCreateFolderDialogOpen(true)}
          onUploadFile={handleUploadFileTrigger}
        />

        <FileSystemDndContext
          files={files}
          folders={folders}
          currentView={view}
          onMoveItem={(itemId, itemType, targetFolderId, showDialog = true) => {
            if (showDialog) {
              handleMoveCopyClick(itemId, itemType, "move");
            } else {
              // This is for drag-and-drop move.
              // Needs to use a mutation.
              console.warn(
                "Drag and drop move needs API integration with useMutation."
              );
              // Example: moveItemMutation.mutate({ itemId, itemType, targetFolderId });
              // On success of mutation:
              // queryClient.invalidateQueries({ queryKey: ['fileSystem', currentFolder] });
              // queryClient.invalidateQueries({ queryKey: ['fileSystem', targetFolderId] });
            }
          }}
          onPreviewFile={handleFilePreview}
          onDeleteItem={handleDeleteClick}
          onRenameItem={handleRenameClick}
          onMoveItemMenu={(id, type) => handleMoveCopyClick(id, type, "move")}
          onCopyItem={(id, type) => handleMoveCopyClick(id, type, "copy")}
        >
          <DragDropZone
            onFilesDrop={handleDroppedFilesForUploadDialog}
            className="flex-1 overflow-y-auto"
          >
            <main className="p-4">
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

              {isLoadingFileSystem && (
                <div className="mt-8">
                  <h2 className="text-lg font-medium mb-4">
                    <Skeleton className="h-6 w-32" />
                  </h2>
                  <div
                    className={
                      view === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        : "space-y-1"
                    }
                  >
                    {[...Array(5)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className={view === "grid" ? "h-48" : "h-16"}
                      />
                    ))}
                  </div>
                </div>
              )}

              {fileSystemError && (
                <p className="text-destructive mt-4">
                  Error loading data: {fileSystemError.message}
                </p>
              )}

              {!isLoadingFileSystem && !fileSystemError && isEmpty && (
                <EmptyState
                  onCreateFolder={() => setIsCreateFolderDialogOpen(true)}
                  onUploadFile={handleUploadFileTrigger}
                />
              )}

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
        onRename={handleRenameSuccess} // Changed
        currentName={itemToRename?.name || ""}
        itemType={itemToRename?.type || "file"}
        itemId={itemToRename?.id}
      />

      <CreateFolderDialog
        isOpen={isCreateFolderDialogOpen}
        onClose={() => setIsCreateFolderDialogOpen(false)}
        onCreate={handleCreateFolderSuccess} // Changed
        parentId={currentFolder}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteSuccess} // Changed
        itemName={itemToDelete?.name || ""}
        itemType={itemToDelete?.type || "file"}
      />

      <FileUploadDialog
        isOpen={isFileUploadDialogOpen}
        onClose={() => setIsFileUploadDialogOpen(false)}
        onUpload={handleFileUploadSuccess} // Changed
        currentFolderId={currentFolder}
        initialFiles={initialFilesForUpload} // Added
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
