import { cn } from "@/lib/utils";

interface FileIconProps {
  className?: string;
  size?: "small" | "large" | "default";
}

export function SpreadsheetIcon({
  className,
  size = "default",
}: FileIconProps) {
  const sizeClass = size === "large" ? "w-20 h-20" : "w-10 h-10";

  return (
    <div
      className={cn("flex items-center justify-center", sizeClass, className)}
    >
      <div className="bg-[#0F9D58] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">grid_on</span>
      </div>
    </div>
  );
}

export function PDFIcon({ className, size = "default" }: FileIconProps) {
  const sizeClass = size === "large" ? "w-20 h-20" : "w-10 h-10";

  return (
    <div
      className={cn("flex items-center justify-center", sizeClass, className)}
    >
      <div className="bg-[#DB4437] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">picture_as_pdf</span>
      </div>
    </div>
  );
}

export function DocIcon({ className, size = "default" }: FileIconProps) {
  const sizeClass = size === "large" ? "w-20 h-20" : "w-10 h-10";

  return (
    <div
      className={cn("flex items-center justify-center", sizeClass, className)}
    >
      <div className="bg-[#4285F4] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">article</span>
      </div>
    </div>
  );
}

export function WordIcon({ className, size = "default" }: FileIconProps) {
  const sizeClass = size === "large" ? "w-20 h-20" : "w-10 h-10";

  return (
    <div
      className={cn("flex items-center justify-center", sizeClass, className)}
    >
      <div className="bg-[#4285F4] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">description</span>
      </div>
    </div>
  );
}

export function ImageIcon({ className, size = "default" }: FileIconProps) {
  const sizeClass = size === "large" ? "w-20 h-20" : "w-10 h-10";

  return (
    <div
      className={cn("flex items-center justify-center", sizeClass, className)}
    >
      <div className="bg-[#DB4437] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">image</span>
      </div>
    </div>
  );
}

export function CodeIcon({ className, size = "default" }: FileIconProps) {
  const sizeClass = size === "large" ? "w-20 h-20" : "w-10 h-10";

  return (
    <div
      className={cn("flex items-center justify-center", sizeClass, className)}
    >
      <div className="bg-[#4285F4] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">code</span>
      </div>
    </div>
  );
}

export function GenericFileIcon({
  className,
  size = "default",
}: FileIconProps) {
  const sizeClass = size === "large" ? "w-20 h-20" : "w-10 h-10";

  return (
    <div
      className={cn("flex items-center justify-center", sizeClass, className)}
    >
      <div className="bg-[#9E9E9E] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">insert_drive_file</span>
      </div>
    </div>
  );
}

export function FolderIcon({ className, size = "default" }: FileIconProps) {
  const sizeClass = size === "large" ? "w-20 h-20" : "w-10 h-10";

  return (
    <div
      className={cn("flex items-center justify-center", sizeClass, className)}
    >
      <div className="bg-[#FBBC04] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">folder</span>
      </div>
    </div>
  );
}

/**
 * Helper function to get the appropriate icon based on file type
 * @param type File type
 * @param size Icon size (small or large)
 * @returns The appropriate icon component
 */
export function getFileIcon(type: string, size: "small" | "large" = "small") {
  switch (type) {
    case "image":
      return <ImageIcon size={size} />;
    case "document":
      return <DocIcon size={size} />;
    case "spreadsheet":
      return <SpreadsheetIcon size={size} />;
    case "pdf":
      return <PDFIcon size={size} />;
    case "code":
      return <CodeIcon size={size} />;
    case "word":
      return <WordIcon size={size} />;
    default:
      return <GenericFileIcon size={size} />;
  }
}
