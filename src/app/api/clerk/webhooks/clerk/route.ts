import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logError(err, "Clerk Webhook Verification");
    return new Response("Error: Invalid webhook signature", {
      status: 400,
    });
  }

  // Handle the event
  const eventType = evt.type;

  console.log(`Received webhook event: ${eventType}`);

  // Handle user creation
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses && email_addresses[0]?.email_address;

    if (!primaryEmail) {
      return NextResponse.json(
        { error: "No email address found for user" },
        { status: 400 }
      );
    }

    try {
      // Check if user already exists in Supabase
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (!existingUser) {
        // Insert new user to Supabase
        await supabase.from("users").insert({
          id: id,
          email: primaryEmail,
          first_name: first_name || null,
          last_name: last_name || null,
          avatar_url: image_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        console.log(`Created user in Supabase: ${id}`);
      }
    } catch (error) {
      logError(error, "Creating User in Supabase");
      return NextResponse.json(
        { error: "Error creating user" },
        { status: 500 }
      );
    }
  }

  // Handle user deletion
  if (eventType === "user.deleted") {
    // Safely extract the ID with type checking
    const userData = evt.data as unknown as { id: string };
    const userId = userData.id;

    if (!userId) {
      console.error("No user ID found in delete event");
      return NextResponse.json(
        { error: "No user ID found in delete event" },
        { status: 400 }
      );
    }

    try {
      // Delete user from Supabase
      await supabase.from("users").delete().eq("id", String(userId));
      console.log(`Deleted user in Supabase: ${userId}`);
    } catch (error) {
      logError(error, "Deleting User in Supabase");
      return NextResponse.json(
        { error: "Error deleting user" },
        { status: 500 }
      );
    }
  }

  // Handle user update
  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses && email_addresses[0]?.email_address;

    try {
      await supabase
        .from("users")
        .update({
          email: primaryEmail,
          first_name: first_name || null,
          last_name: last_name || null,
          avatar_url: image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      console.log(`Updated user in Supabase: ${id}`);
    } catch (error) {
      logError(error, "Updating User in Supabase");
      return NextResponse.json(
        { error: "Error updating user" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
