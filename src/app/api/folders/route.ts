import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { isValidFileName } from "@/lib/validations";
import { logError } from "@/lib/error-logger";

// GET /api/folders - Get all folders for the current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get("parentId");

    // Build the query
    let query = supabase
      .from("folders")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    // Add parent filter if provided
    if (parentId) {
      if (parentId === "null") {
        query = query.is("parent_id", null);
      } else {
        query = query.eq("parent_id", parentId);
      }
    }

    const { data, error } = await query;

    if (error) {
      logError(error, "GET /api/folders");
      return NextResponse.json(
        { error: "Failed to fetch folders" },
        { status: 500 }
      );
    }

    // Format the response
    const folders = data.map((folder) => ({
      id: folder.id,
      name: folder.name,
      createdAt: folder.created_at,
      modifiedAt: folder.modified_at,
      parentId: folder.parent_id,
    }));

    return NextResponse.json(folders);
  } catch (error) {
    logError(error, "GET /api/folders");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/folders - Create a new folder
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { name, parentId } = await request.json();

    // Validate the folder name
    if (!name || !isValidFileName(name)) {
      return NextResponse.json(
        { error: "Invalid folder name" },
        { status: 400 }
      );
    }

    // If parentId is provided, check if it exists and belongs to the user
    if (parentId) {
      const { data: parentFolder, error: parentError } = await supabase
        .from("folders")
        .select("id")
        .eq("id", parentId)
        .eq("user_id", userId)
        .single();

      if (parentError || !parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Check for duplicate folder name in the same parent
    const { data: existingFolder } = await supabase
      .from("folders")
      .select("id")
      .eq("name", name)
      .eq("user_id", userId)
      .is("parent_id", parentId || null)
      .single();

    if (existingFolder) {
      return NextResponse.json(
        { error: "A folder with this name already exists in this location" },
        { status: 409 }
      );
    }

    // Create the folder
    const { data, error } = await supabase
      .from("folders")
      .insert({
        name,
        parent_id: parentId || null,
        user_id: userId,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      logError(error, "POST /api/folders");
      return NextResponse.json(
        { error: "Failed to create folder" },
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

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    logError(error, "POST /api/folders");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
