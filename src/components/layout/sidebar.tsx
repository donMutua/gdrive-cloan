"use client";

import Link from "next/link";
import {
  Home,
  FileText,
  Users,
  Settings,
  Clock,
  Star,
  Trash2,
  Plus,
  Upload,
  FolderPlus,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStorage } from "@/hooks/use-storage";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface SidebarProps {
  className?: string;
  onCreateFolder: () => void;
  onUploadFile: () => void;
}

export function Sidebar({
  className,
  onCreateFolder,
  onUploadFile,
}: SidebarProps) {
  const { storage, isLoading: isStorageLoading } = useStorage();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div
      className={cn(
        "w-64 h-screen bg-background border-r flex flex-col",
        className
      )}
    >
      <div className="p-4 border-b">
        <Logo />
      </div>
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-start gap-2">
              <Plus size={16} />
              New
              <ChevronRight size={16} className="ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuItem onClick={onCreateFolder}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onUploadFile}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <Home size={16} />
                    <span>Home</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Home</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/files">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <FileText size={16} />
                    <span>My Files</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">My Files</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/shared">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <Users size={16} />
                    <span>Shared</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Shared</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/settings">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h3 className="px-4 text-xs font-semibold text-muted-foreground mb-2">
            QUICK ACCESS
          </h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Clock size={16} />
              <span>Recent</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Star size={16} />
              <span>Starred</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Trash2 size={16} />
              <span>Trash</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground">
            STORAGE
          </h3>
          <span className="text-xs text-muted-foreground">
            {isStorageLoading
              ? "Loading..."
              : `${storage?.storagePercentage || 0}% full`}
          </span>
        </div>
        <div className="mb-2">
          <Progress value={storage?.storagePercentage || 0} className="h-2" />
        </div>
        <div className="text-xs text-muted-foreground">
          {isStorageLoading
            ? "Calculating storage..."
            : `${storage?.formattedStorageUsed || "0 B"} of ${storage?.formattedStorageLimit || "10 GB"} used`}
        </div>

        {/* Sign out button */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 mt-4"
          onClick={handleSignOut}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
