import { create } from "zustand";
import type { FileType } from "@/types/file-system";

type ViewMode = "grid" | "list";
type SortBy = "name" | "date" | "size" | "type";
type SortOrder = "asc" | "desc";

interface FileStoreState {
  // View states
  currentView: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  sidebarOpen: boolean;
  currentFolderId: string | null;
  breadcrumbs: { id: string | null; name: string }[];

  // Dialog states
  isCreateFolderDialogOpen: boolean;
  isFileUploadDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isRenameDialogOpen: boolean;
  isFilePreviewOpen: boolean;
  isMoveCopyDialogOpen: boolean;

  // Selected items
  selectedFile: FileType | null;
  itemToRename: { id: string; name: string; type: "file" | "folder" } | null;
  itemToDelete: { id: string; name: string; type: "file" | "folder" } | null;
  itemToMoveCopy: {
    id: string;
    name: string;
    type: "file" | "folder";
    mode: "move" | "copy";
  } | null;

  // Actions
  setCurrentView: (view: ViewMode) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentFolder: (folderId: string | null, folderName?: string) => void;
  setBreadcrumbs: (breadcrumbs: { id: string | null; name: string }[]) => void;
  addBreadcrumb: (id: string | null, name: string) => void;
  navigateToBreadcrumb: (index: number) => void;

  // Dialog actions
  openCreateFolderDialog: () => void;
  closeCreateFolderDialog: () => void;
  openFileUploadDialog: () => void;
  closeFileUploadDialog: () => void;
  openDeleteDialog: (id: string, name: string, type: "file" | "folder") => void;
  closeDeleteDialog: () => void;
  openRenameDialog: (id: string, name: string, type: "file" | "folder") => void;
  closeRenameDialog: () => void;
  setSelectedFile: (file: FileType | null) => void;
  openFilePreview: (file: FileType) => void;
  closeFilePreview: () => void;
  openMoveCopyDialog: (
    id: string,
    name: string,
    type: "file" | "folder",
    mode: "move" | "copy"
  ) => void;
  closeMoveCopyDialog: () => void;
}

export const useFileStore = create<FileStoreState>((set) => ({
  // View states
  currentView: "grid",
  sortBy: "name",
  sortOrder: "asc",
  searchQuery: "",
  sidebarOpen: true,
  currentFolderId: null,
  breadcrumbs: [{ id: null, name: "My Drive" }],

  // Dialog states
  isCreateFolderDialogOpen: false,
  isFileUploadDialogOpen: false,
  isDeleteDialogOpen: false,
  isRenameDialogOpen: false,
  isFilePreviewOpen: false,
  isMoveCopyDialogOpen: false,

  // Selected items
  selectedFile: null,
  itemToRename: null,
  itemToDelete: null,
  itemToMoveCopy: null,

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setCurrentFolder: (folderId, folderName) => {
    if (folderId === null) {
      set({
        currentFolderId: null,
        breadcrumbs: [{ id: null, name: "My Drive" }],
      });
    } else if (folderName) {
      set((state) => ({
        currentFolderId: folderId,
        breadcrumbs: [...state.breadcrumbs, { id: folderId, name: folderName }],
      }));
    } else {
      set({ currentFolderId: folderId });
    }
  },

  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

  addBreadcrumb: (id, name) =>
    set((state) => ({
      breadcrumbs: [...state.breadcrumbs, { id, name }],
    })),

  navigateToBreadcrumb: (index) =>
    set((state) => {
      const newBreadcrumbs = state.breadcrumbs.slice(0, index + 1);
      return {
        breadcrumbs: newBreadcrumbs,
        currentFolderId: newBreadcrumbs[newBreadcrumbs.length - 1].id,
      };
    }),

  // Dialog actions
  openCreateFolderDialog: () => set({ isCreateFolderDialogOpen: true }),
  closeCreateFolderDialog: () => set({ isCreateFolderDialogOpen: false }),

  openFileUploadDialog: () => set({ isFileUploadDialogOpen: true }),
  closeFileUploadDialog: () => set({ isFileUploadDialogOpen: false }),

  openDeleteDialog: (id, name, type) =>
    set({
      isDeleteDialogOpen: true,
      itemToDelete: { id, name, type },
    }),
  closeDeleteDialog: () =>
    set({ isDeleteDialogOpen: false, itemToDelete: null }),

  openRenameDialog: (id, name, type) =>
    set({
      isRenameDialogOpen: true,
      itemToRename: { id, name, type },
    }),
  closeRenameDialog: () =>
    set({ isRenameDialogOpen: false, itemToRename: null }),

  setSelectedFile: (file) => set({ selectedFile: file }),
  openFilePreview: (file) =>
    set({ selectedFile: file, isFilePreviewOpen: true }),
  closeFilePreview: () => set({ isFilePreviewOpen: false }),

  openMoveCopyDialog: (id, name, type, mode) =>
    set({
      isMoveCopyDialogOpen: true,
      itemToMoveCopy: { id, name, type, mode },
    }),
  closeMoveCopyDialog: () =>
    set({ isMoveCopyDialogOpen: false, itemToMoveCopy: null }),
}));
