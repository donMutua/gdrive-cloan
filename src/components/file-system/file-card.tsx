"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  MoreVertical,
  Download,
  Pencil,
  Trash2,
  Info,
  Copy,
  FolderIcon as FolderMove,
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
} from "./file-type-icons";

interface FileCardProps {
  file: FileType;
  view: "grid" | "list";
  onPreview: (file: FileType) => void;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
  onMove: (id: string) => void;
}

export function FileCard({
  file,
  view,
  onPreview,
  onDelete,
  onRename,
  onMove,
}: FileCardProps) {
  // Setup draggable with dnd-kit
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: file.id,
      data: {
        type: "file",
        file,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.2 : 1,
  };

  const getFileIcon = (size: "small" | "large" = "small") => {
    const className = size === "small" ? "w-10 h-10" : "w-20 h-20";

    switch (file.type) {
      case "image":
        return <ImageIcon className={className} />;
      case "document":
        return <DocIcon className={className} />;
      case "spreadsheet":
        return <SpreadsheetIcon className={className} />;
      case "pdf":
        return <PDFIcon className={className} />;
      case "code":
        return <CodeIcon className={className} />;
      case "word":
        return <WordIcon className={className} />;
      default:
        return <GenericFileIcon className={className} />;
    }
  };

  const getFilePreview = () => {
    if (file.type === "image" && file.url) {
      return (
        <div className="relative w-full pt-[100%]">
          <img
            src={file.url || "/placeholder.svg"}
            alt={file.name}
            className="absolute inset-0 w-full h-full object-cover rounded-t-md"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-32 bg-muted rounded-t-md">
        {getFileIcon("large")}
      </div>
    );
  };

  if (view === "grid") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="bg-card border rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer group touch-none"
        onClick={() => !isDragging && onPreview(file)}
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
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download
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
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Make a copy
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(file.id);
                }}
              >
                <FolderMove className="mr-2 h-4 w-4" />
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

  // List view implementation
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer group touch-none"
      onClick={() => !isDragging && onPreview(file)}
    >
      <div className="mr-3">{getFileIcon("small")}</div>
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
          <DropdownMenuItem>
            <Download className="mr-2 h-4 w-4" />
            Download
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
          <DropdownMenuItem>
            <Copy className="mr-2 h-4 w-4" />
            Make a copy
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onMove(file.id);
            }}
          >
            <FolderMove className="mr-2 h-4 w-4" />
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
