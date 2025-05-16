import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";

interface Params {
  params: {
    id: string;
  };
}

// POST /api/files/[id]/copy - Copy a file to a different folder
export async function POST(request: NextRequest, { params }: Params) {
  // Use supabase for server-side operations
  const supabase = getSupabaseServerClient();

  try {
    const { userId } = await auth();
    const { id } = await params;

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

      logError(fileError, `POST /api/files/${id}/copy`);
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 }
      );
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

        logError(targetFolderError, `POST /api/files/${id}/copy`);
        return NextResponse.json(
          { error: "Failed to fetch target folder" },
          { status: 500 }
        );
      }
    }

    // Generate new file name for the copy
    // Append " (copy)" to the original file name, or " (copy N)" if copies already exist
    let newFileName = `${fileData.name} (copy)`;

    // Check if a file with this name already exists in the target folder
    const { data: existingCopies } = await supabase
      .from("files")
      .select("name")
      .eq("user_id", userId)
      .is("folder_id", targetFolderId)
      .ilike("name", `${fileData.name} (copy%)`);

    if (existingCopies && existingCopies.length > 0) {
      // Find the highest copy number
      let highestCopyNumber = 1;

      for (const copy of existingCopies) {
        const match = copy.name.match(/\(copy(\s+(\d+))?\)$/);
        if (match) {
          const copyNumber = match[2] ? parseInt(match[2], 10) : 1;
          highestCopyNumber = Math.max(highestCopyNumber, copyNumber + 1);
        }
      }

      newFileName = `${fileData.name} (copy ${highestCopyNumber})`;
    }

    // Create the copy
    const { data, error } = await supabase
      .from("files")
      .insert({
        name: newFileName,
        type: fileData.type,
        size: fileData.size,
        key: fileData.key,
        url: fileData.url,
        folder_id: targetFolderId,
        user_id: userId,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      logError(error, `POST /api/files/${id}/copy`);
      return NextResponse.json(
        { error: "Failed to copy file" },
        { status: 500 }
      );
    }

    // Format the response
    const file = {
      id: data.id,
      name: data.name,
      type: data.type,
      size: data.size,
      url: data.url,
      createdAt: data.created_at,
      modifiedAt: data.modified_at,
      parentId: data.folder_id,
    };

    return NextResponse.json(file);
  } catch (error) {
    logError(error, `POST /api/files/[id]/copy`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
