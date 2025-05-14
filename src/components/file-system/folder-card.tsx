"use client";

import { MoreVertical, Pencil, Trash2, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FolderType } from "@/types/file-system";
import { FolderIcon } from "./file-type-icons";

interface FolderCardProps {
  folder: FolderType;
  view: "grid" | "list";
  onOpen: (folderId: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
}

export function FolderCard({
  folder,
  view,
  onOpen,
  onDelete,
  onRename,
}: FolderCardProps) {
  if (view === "grid") {
    return (
      <div
        className="bg-card border rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
        onClick={() => onOpen(folder.id)}
      >
        <div className="flex items-center justify-center h-32 bg-muted rounded-t-md">
          <FolderIcon className="w-20 h-20" />
        </div>
        <div className="p-3 flex items-start justify-between">
          <div className="truncate">
            <div className="font-medium truncate">{folder.name}</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(folder.modifiedAt), {
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
                  onRename(folder.id);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Make a copy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(folder.id);
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
      onClick={() => onOpen(folder.id)}
    >
      <div className="mr-3">
        <FolderIcon className="w-10 h-10" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{folder.name}</div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(folder.modifiedAt), {
            addSuffix: true,
          })}
        </div>
      </div>
      <div className="text-sm text-muted-foreground w-24 text-right hidden md:block">
        --
      </div>
      <div className="text-sm text-muted-foreground w-32 text-right hidden lg:block">
        {new Date(folder.modifiedAt).toLocaleDateString()}
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
              onRename(folder.id);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy className="mr-2 h-4 w-4" />
            Make a copy
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(folder.id);
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
