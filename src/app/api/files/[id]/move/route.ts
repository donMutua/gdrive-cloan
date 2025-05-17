import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";
import { formatFileSize } from "@/lib/validations";

// Use the exact signature expected by Next.js for App Router handlers
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const { id } = params; // Access id through context.params
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { targetFolderId } = await request.json();

    // Check if the file exists and belongs to the user
    const { data: fileData, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fileError) {
      if (fileError.code === "PGRST116") {
        return NextResponse.json(
          { error: "File not found or access denied" },
          { status: 404 }
        );
      }

      logError(fileError, `POST /api/files/${id}/move`);
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 }
      );
    }

    // If the target folder is the same as the current parent folder_id, do nothing
    if (fileData.folder_id === targetFolderId) {
      // Return the current file data, formatted like the GET endpoint
      const currentFile = {
        id: fileData.id,
        name: fileData.name,
        type: fileData.type,
        size: formatFileSize(fileData.size),
        url: fileData.url,
        createdAt: fileData.created_at,
        modifiedAt: fileData.modified_at,
        parentId: fileData.folder_id,
      };
      return NextResponse.json(currentFile);
    }

    // If target folder ID is provided, check if it exists and belongs to the user
    // A file can also be moved to the root (targetFolderId = null)
    if (targetFolderId !== null) {
      const { error: targetFolderError } = await supabase
        .from("folders")
        .select("id")
        .eq("id", targetFolderId)
        .eq("user_id", userId)
        .single();

      if (targetFolderError) {
        if (targetFolderError.code === "PGRST116") {
          return NextResponse.json(
            { error: "Target folder not found or access denied" },
            { status: 404 }
          );
        }

        logError(
          targetFolderError,
          `POST /api/files/${id}/move (target folder check)`
        );
        return NextResponse.json(
          { error: "Failed to fetch target folder" },
          { status: 500 }
        );
      }
    }

    // Check for duplicate file name in the target location
    let duplicateFileCheckQuery = supabase
      .from("files")
      .select("id")
      .eq("name", fileData.name) // Check against the original file's name
      .eq("user_id", userId)
      .neq("id", id); // Exclude the file being moved itself

    if (targetFolderId) {
      duplicateFileCheckQuery = duplicateFileCheckQuery.eq(
        "folder_id",
        targetFolderId
      );
    } else {
      duplicateFileCheckQuery = duplicateFileCheckQuery.is("folder_id", null);
    }
    const { data: existingFile } = await duplicateFileCheckQuery.maybeSingle(); // Use maybeSingle as it might not exist

    if (existingFile) {
      return NextResponse.json(
        {
          error: "A file with this name already exists in the target location",
        },
        { status: 409 }
      );
    }

    // Move the file
    const { data, error } = await supabase
      .from("files")
      .update({
        folder_id: targetFolderId,
        modified_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      logError(error, `POST /api/files/${id}/move`);
      return NextResponse.json(
        { error: "Failed to move file" },
        { status: 500 }
      );
    }

    // Format the response
    const movedFile = {
      id: data.id,
      name: data.name,
      type: data.type,
      size: formatFileSize(data.size), // Format size
      url: data.url,
      createdAt: data.created_at,
      modifiedAt: data.modified_at,
      parentId: data.folder_id,
    };

    return NextResponse.json(movedFile);
  } catch (error) {
    // params might not be in scope here if an error occurred before its declaration.
    // It's safer to access it from the function arguments if needed, or handle potential undefined.
    logError(
      error,
      `POST /api/files/${params?.id || "[unknown_id]"}/move (Outer Catch)`
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
