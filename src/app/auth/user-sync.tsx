"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabase";

interface UserSyncProps {
  children: React.ReactNode;
}

export function UserSync({ children }: UserSyncProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSyncingUser, setIsSyncingUser] = useState(false);
  const supabaseClient = createClientComponentClient();

  useEffect(() => {
    if (isSignedIn && user) {
      const syncUserWithSupabase = async () => {
        try {
          setIsSyncingUser(true);
          const primaryEmail = user.primaryEmailAddress?.emailAddress;

          if (!primaryEmail) {
            console.error("User has no primary email address");
            setIsSyncingUser(false);
            return;
          }

          // Approach: Insert or update the user record using upsert
          const { error } = await supabaseClient.from("users").upsert(
            {
              id: user.id,
              email: primaryEmail,
              first_name: user.firstName || null,
              last_name: user.lastName || null,
              avatar_url: user.imageUrl || null,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "id", // Update on conflict of the id field
            }
          );

          if (error) {
            console.error("Error syncing user:", error);
          } else {
            console.log("User synchronized with Supabase");
          }
        } catch (error) {
          console.error("Error in user sync:", error);
        } finally {
          setIsSyncingUser(false);
        }
      };

      syncUserWithSupabase();
    }
  }, [isLoaded, isSignedIn, user, supabaseClient]);

  if (!isLoaded || isSyncingUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">
            {isSyncingUser ? "Syncing your account..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
