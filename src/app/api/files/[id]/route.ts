import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { isValidFileName } from "@/lib/validations";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { logError } from "@/lib/error-logger";
import { formatFileSize } from "@/lib/validations";

// Updated interface to use Promise for params
interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/files/[id] - Get a specific file
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      logError(error, `GET /api/files/${id}`);
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 }
      );
    }

    const file = {
      id: data.id,
      name: data.name,
      type: data.type,
      size: formatFileSize(data.size),
      url: data.url,
      createdAt: data.created_at,
      modifiedAt: data.modified_at,
      parentId: data.folder_id,
    };

    return NextResponse.json(file);
  } catch (error) {
    logError(error, `GET /api/files/[id]`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/files/[id] - Update a file (rename)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || !isValidFileName(name)) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const { data: fileData, error: fileError } = await supabase
      .from("files")
      .select("folder_id")
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
      logError(fileError, `PATCH /api/files/${id}`);
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 }
      );
    }

    // Fixed duplicate check with proper null handling
    let query = supabase
      .from("files")
      .select("id")
      .eq("name", name)
      .eq("user_id", userId)
      .neq("id", id);

    if (fileData.folder_id) {
      query = query.eq("folder_id", fileData.folder_id);
    } else {
      query = query.is("folder_id", null);
    }

    const { data: existingFile } = await query.single();

    if (existingFile) {
      return NextResponse.json(
        { error: "A file with this name already exists in this location" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("files")
      .update({
        name,
        modified_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      logError(error, `PATCH /api/files/${id}`);
      return NextResponse.json(
        { error: "Failed to update file" },
        { status: 500 }
      );
    }

    const file = {
      id: data.id,
      name: data.name,
      type: data.type,
      size: formatFileSize(data.size),
      url: data.url,
      createdAt: data.created_at,
      modifiedAt: data.modified_at,
      parentId: data.folder_id,
    };

    return NextResponse.json(file);
  } catch (error) {
    logError(error, `PATCH /api/files/[id]`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/files/[id] - Delete a file
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: fileData, error: fileError } = await supabase
      .from("files")
      .select("key")
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
      logError(fileError, `DELETE /api/files/${id}`);
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 }
      );
    }

    try {
      if (fileData.key && fileData.key.startsWith("cloudio/")) {
        await deleteFromCloudinary(fileData.key);
      }
    } catch (storageError) {
      logError(storageError, `DELETE /api/files/${id} (storage deletion)`);
    }

    const { error } = await supabase
      .from("files")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      logError(error, `DELETE /api/files/${id}`);
      return NextResponse.json(
        { error: "Failed to delete file" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    logError(error, `DELETE /api/files/[id]`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
