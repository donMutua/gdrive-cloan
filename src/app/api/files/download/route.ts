import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { generateSignedUrl } from "@/lib/cloudinary";
import { logError } from "@/lib/error-logger";

// Updated interface to use Promise for params
interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/files/[id]/download - Generate a download URL for a file
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    // Use supabase for server-side operations
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the file
    const { data, error } = await supabase
      .from("files")
      .select("name, key, url")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      logError(error, `GET /api/files/${id}/download`);
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 }
      );
    }

    // Generate a signed URL for download (expires in 1 hour)
    let downloadUrl = data.url;

    // If we have a Cloudinary key, generate a signed URL
    if (data.key && data.key.startsWith("cloudio/")) {
      downloadUrl = generateSignedUrl(data.key, 3600); // 1 hour expiration
    }

    return NextResponse.json({
      name: data.name,
      url: downloadUrl,
    });
  } catch (error) {
    logError(error, `GET /api/files/[id]/download`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
