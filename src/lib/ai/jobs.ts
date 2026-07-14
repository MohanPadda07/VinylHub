import { z } from "zod";

export const aiJobRequestSchema = z.object({
  type: z.enum([
    "album_summary",
    "debate_summary",
    "recommendation_explanation",
    "genre_explainer",
    "listening_roadmap",
  ]),
  targetType: z.enum(["album", "artist", "genre", "debate", "user"]),
  targetId: z.string().min(1),
});

export type AIJobRequest = z.infer<typeof aiJobRequestSchema>;
