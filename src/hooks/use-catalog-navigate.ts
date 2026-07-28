"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  SpotifyAlbumResult,
  SpotifyArtistResult,
  VinylReleaseSearchResult,
} from "@/lib/integrations/music-types";

type ResolveInput =
  | { type: "vinyl"; data: VinylReleaseSearchResult }
  | { type: "album"; data: SpotifyAlbumResult }
  | { type: "artist"; data: SpotifyArtistResult };

export function useCatalogNavigate() {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(false);

  async function navigate(input: ResolveInput) {
    setIsResolving(true);
    try {
      const response = await fetch("/api/catalog/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error("Failed to resolve catalog entry");

      const result = (await response.json()) as {
        albumSlug?: string;
        artistSlug?: string;
      };

      if (input.type === "artist" && result.artistSlug) {
        router.push(`/artists/${result.artistSlug}`);
      } else if (result.albumSlug) {
        router.push(`/albums/${result.albumSlug}`);
      }
    } finally {
      setIsResolving(false);
    }
  }

  return { navigate, isResolving };
}
