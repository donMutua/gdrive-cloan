import { cn } from "@/lib/utils";

interface FileIconProps {
  className?: string;
}

export function SpreadsheetIcon({ className }: FileIconProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="bg-[#0F9D58] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">grid_on</span>
      </div>
    </div>
  );
}

export function PDFIcon({ className }: FileIconProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="bg-[#DB4437] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">picture_as_pdf</span>
      </div>
    </div>
  );
}

export function DocIcon({ className }: FileIconProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="bg-[#4285F4] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">article</span>
      </div>
    </div>
  );
}

export function WordIcon({ className }: FileIconProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="bg-[#4285F4] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">description</span>
      </div>
    </div>
  );
}

export function ImageIcon({ className }: FileIconProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="bg-[#DB4437] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">image</span>
      </div>
    </div>
  );
}

export function CodeIcon({ className }: FileIconProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="bg-[#4285F4] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">code</span>
      </div>
    </div>
  );
}

export function GenericFileIcon({ className }: FileIconProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="bg-[#9E9E9E] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">insert_drive_file</span>
      </div>
    </div>
  );
}

export function FolderIcon({ className }: FileIconProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="bg-[#FBBC04] text-white w-full h-full flex items-center justify-center rounded-sm">
        <span className="material-icons">folder</span>
      </div>
    </div>
  );
}
