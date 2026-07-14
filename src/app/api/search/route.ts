import { NextRequest, NextResponse } from "next/server";
import { searchDiscogsVinyl } from "@/lib/integrations/discogs";
import type { MusicSearchResponse } from "@/lib/integrations/music-types";
import { searchSpotify } from "@/lib/integrations/spotify";

export const runtime = "nodejs";

const validTypes = new Set(["all", "vinyl", "album", "artist", "track"]);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim() ?? "";
  const requestedType = searchParams.get("type")?.trim() ?? "all";
  const type = validTypes.has(requestedType)
    ? (requestedType as MusicSearchResponse["type"])
    : "all";

  const emptyResults = {
    vinylReleases: [],
    albums: [],
    artists: [],
    tracks: [],
  };

  if (!query) {
    return NextResponse.json<MusicSearchResponse>({
      query,
      type,
      results: emptyResults,
      sources: {
        discogs: { available: Boolean(process.env.DISCOGS_USER_TOKEN) },
        spotify: {
          available: Boolean(
            process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET,
          ),
        },
      },
    });
  }

  const shouldSearchDiscogs = type === "all" || type === "vinyl";
  const shouldSearchSpotify = type === "all" || type !== "vinyl";

  const [discogsResult, spotifyResult] = await Promise.allSettled([
    shouldSearchDiscogs ? searchDiscogsVinyl(query) : Promise.resolve([]),
    shouldSearchSpotify
      ? searchSpotify(query)
      : Promise.resolve({ albums: [], artists: [], tracks: [] }),
  ]);

  const response: MusicSearchResponse = {
    query,
    type,
    results: {
      vinylReleases:
        discogsResult.status === "fulfilled" ? discogsResult.value : [],
      albums: spotifyResult.status === "fulfilled" ? spotifyResult.value.albums : [],
      artists:
        spotifyResult.status === "fulfilled" ? spotifyResult.value.artists : [],
      tracks: spotifyResult.status === "fulfilled" ? spotifyResult.value.tracks : [],
    },
    sources: {
      discogs:
        discogsResult.status === "fulfilled"
          ? { available: shouldSearchDiscogs }
          : {
              available: false,
              error:
                discogsResult.reason instanceof Error
                  ? discogsResult.reason.message
                  : "Discogs search failed.",
            },
      spotify:
        spotifyResult.status === "fulfilled"
          ? { available: shouldSearchSpotify }
          : {
              available: false,
              error:
                spotifyResult.reason instanceof Error
                  ? spotifyResult.reason.message
                  : "Spotify search failed.",
            },
    },
  };

  return NextResponse.json(response);
}
