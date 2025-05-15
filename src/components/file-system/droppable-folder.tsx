"use client";

import type React from "react";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useDroppableFolders } from "./dnd-context";

interface DroppableFolderProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function DroppableFolder({
  id,
  children,
  className,
}: DroppableFolderProps) {
  const droppableFolders = useDroppableFolders();
  const isDroppable = droppableFolders.includes(id);

  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: !isDroppable,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        isDroppable && "transition-all duration-200",
        isOver &&
          isDroppable &&
          "scale-105 ring-2 ring-primary ring-offset-2 bg-primary/5 shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
