"use client";
import {
  Search,
  Menu,
  Grid,
  List,
  Filter,
  SortAsc,
  LogOut,
  User,
  Settings,
  Plus,
  FolderPlus,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";

interface TopbarProps {
  onToggleSidebar: () => void;
  onViewChange: (view: "grid" | "list") => void;
  currentView: "grid" | "list";
  onCreateFolder: () => void;
  onUploadFile: () => void;
}

export function Topbar({
  onToggleSidebar,
  onViewChange,
  currentView,
  onCreateFolder,
  onUploadFile,
}: TopbarProps) {
  return (
    <div className="h-16 border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
        >
          <Menu size={20} />
        </Button>
        <div className="md:hidden">
          <Logo className="ml-2" />
        </div>
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search files and folders"
            className="pl-10 w-[300px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* New button for desktop */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
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

        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-none ${
              currentView === "grid" ? "bg-accent" : ""
            }`}
            onClick={() => onViewChange("grid")}
          >
            <Grid size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-none ${
              currentView === "list" ? "bg-accent" : ""
            }`}
            onClick={() => onViewChange("list")}
          >
            <List size={18} />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Filter size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuItem>Images</DropdownMenuItem>
            <DropdownMenuItem>Documents</DropdownMenuItem>
            <DropdownMenuItem>Videos</DropdownMenuItem>
            <DropdownMenuItem>Audio</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <SortAsc size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuItem>Name</DropdownMenuItem>
            <DropdownMenuItem>Date modified</DropdownMenuItem>
            <DropdownMenuItem>Size</DropdownMenuItem>
            <DropdownMenuItem>Type</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/noprofilepic.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
