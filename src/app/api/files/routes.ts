import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";
import { formatFileSize } from "@/lib/validations";

// GET /api/files - Get all files for the current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    // Use supabase for server-side operations
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get("parentId");

    // Build the query
    let query = supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    // Add folder filter if provided
    if (parentId) {
      // If parentId is present in the query
      if (parentId === "null") {
        query = query.is("folder_id", null);
      } else {
        query = query.eq("folder_id", parentId);
      }
    } else {
      // If parentId is NOT present, fetch root files
      query = query.is("folder_id", null);
    }

    const { data, error } = await query;

    if (error) {
      logError(error, "GET /api/files");
      return NextResponse.json(
        { error: "Failed to fetch files" },
        { status: 500 }
      );
    }

    // Format the response
    const files = data.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: formatFileSize(file.size),
      url: file.url,
      createdAt: file.created_at,
      modifiedAt: file.modified_at,
      parentId: file.folder_id,
    }));

    return NextResponse.json(files);
  } catch (error) {
    logError(error, "GET /api/files");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
