import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Get the current user ID from Clerk
 * @returns User ID string or null if not authenticated
 */
export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId;
}

/**
 * Get the current user ID or throw an error if not authenticated
 * @returns User ID string
 * @throws Error if not authenticated
 */
export function requireAuth() {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

/**
 * Get the current user details
 * @returns Promise with user details or null if not authenticated
 */
export async function getCurrentUserDetails() {
  const user = await currentUser();
  return user;
}
