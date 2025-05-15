import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { formatFileSize } from "@/lib/validations";
import { logError } from "@/lib/error-logger";

// GET /api/search?query=... - Search for files and folders
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search query
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Search for folders
    const { data: folders, error: foldersError } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", userId)
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(20);

    if (foldersError) {
      logError(foldersError, "GET /api/search (folders)");
      return NextResponse.json(
        { error: "Failed to search folders" },
        { status: 500 }
      );
    }

    // Search for files
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(30);

    if (filesError) {
      logError(filesError, "GET /api/search (files)");
      return NextResponse.json(
        { error: "Failed to search files" },
        { status: 500 }
      );
    }

    // Format the results
    const formattedFolders = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      createdAt: folder.created_at,
      modifiedAt: folder.modified_at,
      parentId: folder.parent_id,
      type: "folder" as const,
    }));

    const formattedFiles = files.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: formatFileSize(file.size),
      url: file.url,
      createdAt: file.created_at,
      modifiedAt: file.modified_at,
      parentId: file.folder_id,
      itemType: "file" as const,
    }));

    // Combine results
    const results = {
      folders: formattedFolders,
      files: formattedFiles,
      total: formattedFolders.length + formattedFiles.length,
    };

    return NextResponse.json(results);
  } catch (error) {
    logError(error, "GET /api/search");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
