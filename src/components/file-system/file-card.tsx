"use client";

import {
  MoreVertical,
  Download,
  Pencil,
  Trash2,
  Info,
  Copy,
  FolderIcon as FolderCopy,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FileType } from "@/types/file-system";
import {
  SpreadsheetIcon,
  PDFIcon,
  DocIcon,
  WordIcon,
  ImageIcon,
  CodeIcon,
  GenericFileIcon,
} from "@/components/file-system/file-type-icons";
import { useState } from "react";
import Image from "next/image";

interface FileCardProps {
  file: FileType;
  view: "grid" | "list";
  onPreview: (file: FileType) => void;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
  onMove: (id: string) => void;
  onCopy: (id: string) => void;
}

export function FileCard({
  file,
  view,
  onPreview,
  onDelete,
  onRename,
  onMove,
  onCopy,
}: FileCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Render the appropriate icon based on file type
  const renderFileIcon = (size: "small" | "large" = "small") => {
    const sizeClass = size === "large" ? "w-20 h-20" : "w-10 h-10";

    switch (file.type) {
      case "image":
        return <ImageIcon className={sizeClass} />;
      case "document":
        return <DocIcon className={sizeClass} />;
      case "spreadsheet":
        return <SpreadsheetIcon className={sizeClass} />;
      case "pdf":
        return <PDFIcon className={sizeClass} />;
      case "code":
        return <CodeIcon className={sizeClass} />;
      case "word":
        return <WordIcon className={sizeClass} />;
      default:
        return <GenericFileIcon className={sizeClass} />;
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);

    try {
      // Call the download API endpoint
      const response = await fetch(`/api/files/${file.id}/download`);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const data = await response.json();

      // Create a link to trigger the download
      const a = document.createElement("a");
      a.href = data.url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      // You could add error notification here
    } finally {
      setIsDownloading(false);
    }
  };

  const getFilePreview = () => {
    if (file.type === "image" && file.url) {
      return (
        <div className="relative w-full pt-[100%]">
          <Image
            src={file.url || "/placeholder.svg"}
            alt={file.name}
            fill
            className="object-cover rounded-t-md"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-32 bg-muted rounded-t-md">
        {renderFileIcon("large")}
      </div>
    );
  };

  if (view === "grid") {
    return (
      <div
        className="bg-card border rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
        onClick={() => onPreview(file)}
      >
        {getFilePreview()}
        <div className="p-3 flex items-start justify-between">
          <div className="truncate">
            <div className="font-medium truncate">{file.name}</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(file.modifiedAt), {
                addSuffix: true,
              })}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="opacity-0 group-hover:opacity-100 focus:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(file);
                }}
              >
                <Info className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(file.id);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(file.id);
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Make a copy
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(file.id);
                }}
              >
                <FolderCopy className="mr-2 h-4 w-4" />
                Move to
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer group"
      onClick={() => onPreview(file)}
    >
      <div className="mr-3">{renderFileIcon("small")}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{file.name}</div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(file.modifiedAt), { addSuffix: true })}
        </div>
      </div>
      <div className="text-sm text-muted-foreground w-24 text-right hidden md:block">
        {file.size}
      </div>
      <div className="text-sm text-muted-foreground w-32 text-right hidden lg:block">
        {new Date(file.modifiedAt).toLocaleDateString()}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className="ml-2 opacity-0 group-hover:opacity-100 focus:opacity-100">
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onPreview(file);
            }}
          >
            <Info className="mr-2 h-4 w-4" />
            Preview
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload} disabled={isDownloading}>
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onRename(file.id);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onCopy(file.id);
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Make a copy
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onMove(file.id);
            }}
          >
            <FolderCopy className="mr-2 h-4 w-4" />
            Move to
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.id);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
