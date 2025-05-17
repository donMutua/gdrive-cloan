import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { isValidFileName } from "@/lib/validations";
import { logError } from "@/lib/error-logger";

// Updated interface to use Promise for params
interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/folders/[id] - Get a specific folder
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    // Use supabase for server-side operations
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the folder
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 }
        );
      }

      logError(error, `GET /api/folders/${id}`);
      return NextResponse.json(
        { error: "Failed to fetch folder" },
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
    logError(error, `GET /api/folders/[id]`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/folders/[id] - Update a folder (rename)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    // Use supabase for server-side operations
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { name } = await request.json();

    // Validate the folder name
    if (!name || !isValidFileName(name)) {
      return NextResponse.json(
        { error: "Invalid folder name" },
        { status: 400 }
      );
    }

    // First check if the folder exists and belongs to the user
    const { data: folderData, error: folderError } = await supabase
      .from("folders")
      .select("parent_id")
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

      logError(folderError, `PATCH /api/folders/${id}`);
      return NextResponse.json(
        { error: "Failed to fetch folder" },
        { status: 500 }
      );
    }

    // Check for duplicate folder name in the same parent
    let query = supabase
      .from("folders")
      .select("id")
      .eq("name", name)
      .eq("user_id", userId)
      .neq("id", id);

    // Conditionally add parent_id filter
    if (folderData.parent_id === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", folderData.parent_id);
    }

    const { data: existingFolder } = await query.single();

    if (existingFolder) {
      return NextResponse.json(
        { error: "A folder with this name already exists in this location" },
        { status: 409 }
      );
    }

    // Update the folder
    const { data, error } = await supabase
      .from("folders")
      .update({
        name,
        modified_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      logError(error, `PATCH /api/folders/${id}`);
      return NextResponse.json(
        { error: "Failed to update folder" },
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
    logError(error, `PATCH /api/folders/[id]`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/folders/[id] - Delete a folder
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    // Use supabase for server-side operations
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First check if the folder exists and belongs to the user
    const { error: folderError } = await supabase
      .from("folders")
      .select("id")
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

      logError(folderError, `DELETE /api/folders/${id}`);
      return NextResponse.json(
        { error: "Failed to fetch folder" },
        { status: 500 }
      );
    }

    // Delete all files within the folder
    // Note: In a production app with nested folders, you'd need a recursive
    // deletion function to handle subfolders and their files
    const { error: filesError } = await supabase
      .from("files")
      .delete()
      .eq("folder_id", id)
      .eq("user_id", userId);

    if (filesError) {
      logError(filesError, `DELETE /api/folders/${id} (files deletion)`);
      return NextResponse.json(
        { error: "Failed to delete files in folder" },
        { status: 500 }
      );
    }

    // Delete the folder
    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      logError(error, `DELETE /api/folders/${id}`);
      return NextResponse.json(
        { error: "Failed to delete folder" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Folder deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    logError(error, `DELETE /api/folders/[id]`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
