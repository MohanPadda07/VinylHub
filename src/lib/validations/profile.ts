import { z } from "zod";

export const profileOnboardingSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(80),
  bio: z.string().max(280).optional(),
  favoriteGenres: z.array(z.string()).max(12).default([]),
  favoriteArtists: z.array(z.string()).max(20).default([]),
});

export type ProfileOnboardingInput = z.infer<typeof profileOnboardingSchema>;
