"use client";

import type React from "react";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface DraggableItemProps {
  id: string;
  data: unknown;
  type: "file" | "folder";
  children: React.ReactNode;
  className?: string;
}

export function DraggableItem({
  id,
  data,
  type,
  children,
  className,
}: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: {
        id,
        data,
        type,
      },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn("touch-none", isDragging && "opacity-50", className)}
    >
      {children}
    </div>
  );
}
