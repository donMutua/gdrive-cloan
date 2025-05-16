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
  FileText,
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
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSearch } from "@/hooks/use-search";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const { getFullName, getAvatarUrl } = useUserProfile();
  const {
    searchQuery,
    setSearchQuery,
    results,
    isLoading: isSearching,
  } = useSearch();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const fullName = getFullName();
  const avatarUrl = getAvatarUrl();
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
        <div
          className={`relative hidden md:flex items-center transition-all ${isSearchOpen ? "w-[600px]" : "w-[300px]"}`}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search files and folders"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
          />
          {isSearchOpen && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-md mt-1 z-50 max-h-[400px] overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center">
                  <span className="text-muted-foreground">Searching...</span>
                </div>
              ) : (
                <>
                  {results && results.total > 0 ? (
                    <div className="p-2">
                      {results.folders.length > 0 && (
                        <div>
                          <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                            FOLDERS
                          </h4>
                          {results.folders.map((folder) => (
                            <div
                              key={folder.id}
                              className="p-2 hover:bg-accent rounded-md cursor-pointer"
                              onClick={() => {
                                // Navigate to folder
                                router.push(`/dashboard/folders/${folder.id}`);
                                setIsSearchOpen(false);
                                setSearchQuery("");
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <FolderPlus className="h-4 w-4 text-muted-foreground" />
                                <span>{folder.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {results.files.length > 0 && (
                        <div>
                          <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                            FILES
                          </h4>
                          {results.files.map((file) => (
                            <div
                              key={file.id}
                              className="p-2 hover:bg-accent rounded-md cursor-pointer"
                              onClick={() => {
                                // Preview file
                                router.push(`/dashboard/files/${file.id}`);
                                setIsSearchOpen(false);
                                setSearchQuery("");
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>{file.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center">
                      <span className="text-muted-foreground">
                        No results found
                      </span>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}
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
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
