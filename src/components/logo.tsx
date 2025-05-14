import { CloudIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center justify-center bg-primary rounded-md p-1">
        <CloudIcon className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="font-bold text-xl">CloudIO</span>
    </div>
  );
}
