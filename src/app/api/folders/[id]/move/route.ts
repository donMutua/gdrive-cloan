import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";

interface Params {
  params: {
    id: string;
  };
}

// Function to check if a folder is a descendant of another folder
async function isDescendantFolder(
  folderId: string,
  targetFolderId: string | null,
  userId: string
): Promise<boolean> {
  if (targetFolderId === null) return false;
  if (folderId === targetFolderId) return true;

  // Use supabase for server-side operations
  const supabase = getSupabaseServerClient();

  // Get the target folder's parent
  const { data, error } = await supabase
    .from("folders")
    .select("parent_id")
    .eq("id", targetFolderId)
    .eq("user_id", userId)
    .single();

  if (error || !data || data.parent_id === null) return false;

  // Recursively check if the folder is a descendant
  return isDescendantFolder(folderId, data.parent_id, userId);
}

// POST /api/folders/[id]/move - Move a folder to a different parent
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    const { id } = params;
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { targetFolderId } = await request.json();

    // Check if the folder exists and belongs to the user
    const { data: folderData, error: folderError } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (folderError) {
      if (folderError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Folder not found or access denied" },
          { status: 404 }
        );
      }

      logError(folderError, `POST /api/folders/${id}/move`);
      return NextResponse.json(
        { error: "Failed to fetch folder" },
        { status: 500 }
      );
    }

    // If the target folder is the same as the current parent, do nothing
    if (folderData.parent_id === targetFolderId) {
      return NextResponse.json({
        id: folderData.id,
        name: folderData.name,
        createdAt: folderData.created_at,
        modifiedAt: folderData.modified_at,
        parentId: folderData.parent_id,
      });
    }

    // If target folder ID is provided, check if it exists and belongs to the user
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

        logError(targetFolderError, `POST /api/folders/${id}/move`);
        return NextResponse.json(
          { error: "Failed to fetch target folder" },
          { status: 500 }
        );
      }

      // Check if the target folder is a descendant of the folder being moved
      // This would create a circular dependency
      const isDescendant = await isDescendantFolder(id, targetFolderId, userId);
      if (isDescendant) {
        return NextResponse.json(
          { error: "Cannot move a folder into its own subdirectory" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate folder name in the target location
    const { data: existingFolder } = await supabase
      .from("folders")
      .select("id")
      .eq("name", folderData.name)
      .eq("user_id", userId)
      .is("parent_id", targetFolderId)
      .neq("id", id)
      .single();

    if (existingFolder) {
      return NextResponse.json(
        {
          error:
            "A folder with this name already exists in the target location",
        },
        { status: 409 }
      );
    }

    // Move the folder
    const { data, error } = await supabase
      .from("folders")
      .update({
        parent_id: targetFolderId,
        modified_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      logError(error, `POST /api/folders/${id}/move`);
      return NextResponse.json(
        { error: "Failed to move folder" },
        { status: 500 }
      );
    }

    // Format the response
    const folder = {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      modifiedAt: data.modified_at,
      parentId: data.parent_id,
    };

    return NextResponse.json(folder);
  } catch (error) {
    logError(error, `POST /api/folders/[id]/move`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
