import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { uploadToCloudinary, getFileType } from "@/lib/cloudinary";
import { isValidFileName, isValidFileSize } from "@/lib/validations";
import { logError } from "@/lib/error-logger";

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    // Use supabase for server-side operations
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string | null;

    // Validate the file
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file name
    if (!isValidFileName(file.name)) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    // Validate file size
    if (!isValidFileSize(file.size, MAX_FILE_SIZE)) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // If folder ID is provided, check if it exists and belongs to the user
    if (folderId) {
      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .select("id")
        .eq("id", folderId)
        .eq("user_id", userId)
        .single();

      if (folderError && folderError.code !== "PGRST116") {
        logError(folderError, "POST /api/upload (folder check)");
        return NextResponse.json(
          { error: "Failed to verify folder" },
          { status: 500 }
        );
      }

      if (!folderData) {
        return NextResponse.json(
          { error: "Folder not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Check for duplicate file name in the same folder
    let query = supabase
      .from("files")
      .select("id")
      .eq("name", file.name)
      .eq("user_id", userId);

    // Handle null/string folder_id type safely
    if (folderId) {
      query = query.eq("folder_id", folderId);
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

    // Convert the file to array buffer
    const buffer = await file.arrayBuffer();

    // Generate a unique folder path in Cloudinary
    const folderPath = `cloudio/${userId}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      Buffer.from(buffer),
      folderPath
    );

    // Determine the file type
    const fileType = getFileType(file.name);

    // Create file record in the database
    const { data, error } = await supabase
      .from("files")
      .insert({
        name: file.name,
        type: fileType,
        size: file.size,
        key: uploadResult.public_id,
        url: uploadResult.secure_url,
        folder_id: folderId || null,
        user_id: userId,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      logError(error, "POST /api/upload");
      return NextResponse.json(
        { error: "Failed to create file record" },
        { status: 500 }
      );
    }

    // Format the response
    const fileResponse = {
      id: data.id,
      name: data.name,
      type: data.type,
      size: data.size,
      url: data.url,
      createdAt: data.created_at,
      modifiedAt: data.modified_at,
      parentId: data.folder_id,
    };

    return NextResponse.json(fileResponse, { status: 201 });
  } catch (error) {
    logError(error, "POST /api/upload");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
