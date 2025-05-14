"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Trash2 } from "lucide-react";
import type { FileType } from "@/types/file-system";
import {
  SpreadsheetIcon,
  PDFIcon,
  DocIcon,
  WordIcon,
  ImageIcon,
  CodeIcon,
  GenericFileIcon,
} from "./file-type-icons";

interface FilePreviewModalProps {
  file: FileType | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
}

export function FilePreviewModal({
  file,
  isOpen,
  onClose,
  onDelete,
  onRename,
}: FilePreviewModalProps) {
  if (!file) return null;

  const getFileIcon = () => {
    switch (file.type) {
      case "image":
        return <ImageIcon className="w-8 h-8" />;
      case "document":
        return <DocIcon className="w-8 h-8" />;
      case "spreadsheet":
        return <SpreadsheetIcon className="w-8 h-8" />;
      case "pdf":
        return <PDFIcon className="w-8 h-8" />;
      case "code":
        return <CodeIcon className="w-8 h-8" />;
      case "word":
        return <WordIcon className="w-8 h-8" />;
      default:
        return <GenericFileIcon className="w-8 h-8" />;
    }
  };

  const renderPreview = () => {
    if (file.type === "image" && file.url) {
      return (
        <div className="flex justify-center p-4 bg-muted/50 rounded-md">
          <img
            src={file.url || "/placeholder.svg"}
            alt={file.name}
            className="max-h-[400px] max-w-full object-contain rounded-md shadow-sm"
          />
        </div>
      );
    }

    if (file.type === "pdf" && file.url) {
      return (
        <div className="flex justify-center p-4 h-[400px] bg-muted/50 rounded-md">
          <iframe
            src={file.url}
            className="w-full h-full border rounded-md shadow-sm"
            title={file.name}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-md my-4">
        <div className="mb-4">{getFileIcon()}</div>
        <p className="text-muted-foreground">Preview not available</p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon()}
            <span className="truncate">{file.name}</span>
          </DialogTitle>
        </DialogHeader>

        {renderPreview()}

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm font-medium">Type</p>
            <p className="text-sm text-muted-foreground capitalize">
              {file.type}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Size</p>
            <p className="text-sm text-muted-foreground">{file.size}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Created</p>
            <p className="text-sm text-muted-foreground">
              {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Modified</p>
            <p className="text-sm text-muted-foreground">
              {new Date(file.modifiedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onRename(file.id);
                onClose();
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(file.id);
              onClose();
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
