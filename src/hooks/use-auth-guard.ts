import { useAuth } from "@clerk/nextjs";

export function useAuthGuard() {
  const { userId, isLoaded, isSignedIn } = useAuth();

  const isAuthenticated = isLoaded && isSignedIn && !!userId;

  return {
    isAuthenticated,
    isLoading: !isLoaded,
    userId: userId as string,
  };
}
