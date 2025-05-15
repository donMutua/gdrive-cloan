import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";

// GET /api/user/profile - Get user profile
export async function GET() {
  try {
    const { userId } = await auth();
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json(
        { error: "Unawait authorized" },
        { status: 401 }
      );
    }

    // Get the user's profile from your database
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // If user not found in the database, get from Clerk and create
      if (error.code === "PGRST116") {
        const user = await currentUser();

        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        // Create user in the database
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            id: userId,
            email: user.emailAddresses[0]?.emailAddress || "",
            first_name: user.firstName,
            last_name: user.lastName,
            avatar_url: user.imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("*")
          .single();

        if (createError) {
          logError(createError, "GET /api/user/profile (create user)");
          return NextResponse.json(
            { error: "Failed to create user profile" },
            { status: 500 }
          );
        }

        // Format the response
        return NextResponse.json({
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          avatarUrl: newUser.avatar_url,
          createdAt: newUser.created_at,
          updatedAt: newUser.updated_at,
        });
      }

      logError(error, "GET /api/user/profile");
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    // Format the response
    const profile = {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json(profile);
  } catch (error) {
    logError(error, "GET /api/user/profile");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    const supabase = getSupabaseServerClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, avatarUrl } = await request.json();

    if (firstName === "" && lastName === "") {
      return NextResponse.json(
        { error: "At least one field must be provided" },
        { status: 400 }
      );
    }

    // Update in Clerk
    try {
      const client = await clerkClient();
      await client.users.updateUser(userId, {
        firstName: firstName?.trim() || undefined,
        lastName: lastName?.trim() || undefined,
      });
    } catch (clerkError) {
      logError(clerkError, "PATCH /api/user/profile (clerk update)");
      return NextResponse.json(
        { error: "Failed to update user profile in auth service" },
        { status: 500 }
      );
    }

    // Update in your database
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (firstName !== undefined) {
      updateData.first_name = firstName;
    }

    if (lastName !== undefined) {
      updateData.last_name = lastName;
    }

    if (avatarUrl !== undefined) {
      updateData.avatar_url = avatarUrl;
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      logError(error, "PATCH /api/user/profile");
      return NextResponse.json(
        { error: "Failed to update user profile in database" },
        { status: 500 }
      );
    }

    // Format the response
    const profile = {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json(profile);
  } catch (error) {
    logError(error, "PATCH /api/user/profile");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
