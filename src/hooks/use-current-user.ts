import { useQuery } from "@tanstack/react-query";

export type AppUser = {
  id: string;
  username: string;
  displayName: string;
  imageUrl: string | null;
  bio: string | null;
  role: "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
  reputation: number;
  level: number;
  favoriteGenres: string[];
  favoriteArtists: string[];
  createdAt: string;
};

async function fetchCurrentUser(): Promise<AppUser> {
  const response = await fetch("/api/me");

  if (!response.ok) {
    throw new Error("Failed to load user");
  }

  return response.json();
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function isStaffRole(role?: AppUser["role"]) {
  return role === "ADMIN" || role === "MODERATOR" || role === "SUPER_ADMIN";
}
