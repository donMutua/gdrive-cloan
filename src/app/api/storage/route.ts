import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { formatFileSize } from "@/lib/validations";
import { logError } from "@/lib/error-logger";

// Default storage limit per user (10GB)
const DEFAULT_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024;

// GET /api/storage - Get storage usage information
export async function GET() {
  try {
    const { userId } = await auth();
    // Use supabase for server-side operations
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total storage used by the user
    const { data, error } = await supabase
      .from("files")
      .select("size")
      .eq("user_id", userId);

    if (error) {
      logError(error, "GET /api/storage");
      return NextResponse.json(
        { error: "Failed to fetch storage information" },
        { status: 500 }
      );
    }

    // Calculate total storage used
    const storageUsed = data.reduce((total, file) => total + file.size, 0);

    // Get file type distribution
    const { data: typeData, error: typeError } = await supabase
      .from("files")
      .select("type, size")
      .eq("user_id", userId);

    if (typeError) {
      logError(typeError, "GET /api/storage (type distribution)");
      return NextResponse.json(
        { error: "Failed to fetch storage type information" },
        { status: 500 }
      );
    }

    // Group by file type
    const typeDistribution: Record<string, number> = {};
    typeData.forEach((file) => {
      const type = file.type || "other";
      typeDistribution[type] = (typeDistribution[type] || 0) + file.size;
    });

    // Get total file count
    const fileCount = data.length;

    // Get total folder count
    const { count: folderCount, error: folderCountError } = await supabase
      .from("folders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (folderCountError) {
      logError(folderCountError, "GET /api/storage (folder count)");
      return NextResponse.json(
        { error: "Failed to fetch folder count" },
        { status: 500 }
      );
    }

    // Format the response
    const response = {
      storageUsed,
      storageLimit: DEFAULT_STORAGE_LIMIT,
      storagePercentage: Math.min(
        100,
        Math.round((storageUsed / DEFAULT_STORAGE_LIMIT) * 100)
      ),
      formattedStorageUsed: formatFileSize(storageUsed),
      formattedStorageLimit: formatFileSize(DEFAULT_STORAGE_LIMIT),
      fileCount,
      folderCount: folderCount || 0,
      typeDistribution: Object.entries(typeDistribution).map(
        ([type, size]) => ({
          type,
          size,
          formattedSize: formatFileSize(size),
          percentage: Math.round((size / storageUsed) * 100) || 0,
        })
      ),
    };

    return NextResponse.json(response);
  } catch (error) {
    logError(error, "GET /api/storage");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
