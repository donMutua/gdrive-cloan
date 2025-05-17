import type { FileType, FolderType } from "@/types/file-system";

// Generate a random date within the last 30 days
const generateDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date.toISOString();
};

// Generate dummy folders
export const generateDummyFolders = (): FolderType[] => {
  return [
    {
      id: "folder-1",
      name: "Documents",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
    {
      id: "folder-2",
      name: "Images",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
    {
      id: "folder-3",
      name: "Projects",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
    {
      id: "folder-4",
      name: "Work",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: "folder-1",
    },
    {
      id: "folder-5",
      name: "Personal",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: "folder-1",
    },
  ];
};

// Generate dummy files
export const generateDummyFiles = (): FileType[] => {
  return [
    {
      id: "file-1",
      name: "Project Proposal.pdf",
      type: "pdf",
      size: "2.4 MB",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
    {
      id: "file-2",
      name: "Budget 2023.xlsx",
      type: "spreadsheet",
      size: "1.8 MB",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
    {
      id: "file-3",
      name: "Meeting Notes.docx",
      type: "word",
      size: "568 KB",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
    {
      id: "file-4",
      name: "Profile Picture.jpg",
      type: "image",
      size: "1.2 MB",
      url: "/noprofilepic.png",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: "folder-2",
    },
    {
      id: "file-5",
      name: "App Screenshot.png",
      type: "image",
      size: "3.5 MB",
      url: "/abstract-profile.png",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: "folder-2",
    },
    {
      id: "file-6",
      name: "index.js",
      type: "code",
      size: "12 KB",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: "folder-3",
    },
    {
      id: "file-7",
      name: "Resume.pdf",
      type: "pdf",
      size: "845 KB",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: "folder-5",
    },
    {
      id: "file-8",
      name: "2024 Budget.xlsx",
      type: "spreadsheet",
      size: "1.2 MB",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
    {
      id: "file-9",
      name: "AA FRONTEND.pdf",
      type: "pdf",
      size: "3.7 MB",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
    {
      id: "file-10",
      name: "AgriboraIntro",
      type: "document",
      size: "245 KB",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
    {
      id: "file-11",
      name: "BED 4110 - CAT 2",
      type: "document",
      size: "320 KB",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
    {
      id: "file-12",
      name: "BED1104-INTRODUCTION",
      type: "document",
      size: "450 KB",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
    {
      id: "file-13",
      name: "Benirprofile.docx",
      type: "word",
      size: "1.1 MB",
      createdAt: generateDate(),
      modifiedAt: generateDate(),
      parentId: null,
    },
  ];
};
