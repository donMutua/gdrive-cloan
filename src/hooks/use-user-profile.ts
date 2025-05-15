"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/nextjs";
import { logError } from "@/lib/error-logger";

interface ProfileResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

// Function to fetch user profile
const fetchUserProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await fetch("/api/user/profile");
    if (!response.ok) {
      throw new Error(`Error fetching profile: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logError(error, "useUserProfile.fetchUserProfile");
    throw error;
  }
};

// Function to update user profile
const updateUserProfile = async (
  data: UpdateProfileRequest
): Promise<ProfileResponse> => {
  try {
    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error updating profile: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logError(error, "useUserProfile.updateUserProfile");
    throw error;
  }
};

export function useUserProfile() {
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const queryClient = useQueryClient();

  // Get user profile query
  const profileQuery = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: fetchUserProfile,
    enabled: !!userId && isAuthLoaded && isUserLoaded,
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });

  // Function to get user's full name
  const getFullName = () => {
    if (profileQuery.data) {
      const { firstName, lastName } = profileQuery.data;
      if (firstName && lastName) return `${firstName} ${lastName}`;
      if (firstName) return firstName;
      if (lastName) return lastName;
    }

    // Fallback to clerk user data
    if (user) {
      if (user.firstName && user.lastName)
        return `${user.firstName} ${user.lastName}`;
      if (user.firstName) return user.firstName;
      if (user.lastName) return user.lastName;
      if (user.username) return user.username;
    }

    // Last fallback
    return "User";
  };

  // Function to get user's avatar URL
  const getAvatarUrl = () => {
    if (profileQuery.data && profileQuery.data.avatarUrl) {
      return profileQuery.data.avatarUrl;
    }

    // Fallback to clerk user data
    if (user && user.imageUrl) {
      return user.imageUrl;
    }

    // Default avatar
    return "/noprofilepic.png";
  };

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,

    // Update profile
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,

    // Helper functions
    getFullName,
    getAvatarUrl,

    // Clerk user data for fallback
    user,
  };
}
