export interface FileType {
  id: string;
  name: string;
  type:
    | "image"
    | "document"
    | "spreadsheet"
    | "pdf"
    | "code"
    | "word"
    | "other";
  size: string;
  url?: string;
  createdAt: string;
  modifiedAt: string;
  parentId: string | null;
}

export interface FolderType {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt: string;
  parentId: string | null;
}
