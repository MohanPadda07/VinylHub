import { NextRequest, NextResponse } from "next/server";
import { searchDiscogsVinyl } from "@/lib/integrations/discogs";
import type { MusicSearchResponse } from "@/lib/integrations/music-types";
import { searchSpotify } from "@/lib/integrations/spotify";

export const runtime = "nodejs";

const validTypes = new Set(["all", "vinyl", "album", "artist", "track", "label"]);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim() ?? "";
  const requestedType = searchParams.get("type")?.trim() ?? "all";
  const cursor = searchParams.get("cursor")?.trim();
  const page = Math.max(1, Number.parseInt(cursor ?? "1", 10) || 1);
  const offset = (page - 1) * 8;
  const type = validTypes.has(requestedType)
    ? (requestedType as MusicSearchResponse["type"])
    : "all";

  const emptyResults = {
    vinylReleases: [],
    albums: [],
    artists: [],
    tracks: [],
    labels: [],
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
  const shouldSearchDiscogsLabels = type === "label";
  const shouldSearchSpotify = type === "all" || ["album", "artist", "track"].includes(type);

  const [discogsResult, spotifyResult] = await Promise.allSettled([
    shouldSearchDiscogs || shouldSearchDiscogsLabels
      ? searchDiscogsVinyl(query, {
          page,
          type: shouldSearchDiscogsLabels ? "label" : "release",
        })
      : Promise.resolve([]),
    shouldSearchSpotify
      ? searchSpotify(query, { offset })
      : Promise.resolve({ albums: [], artists: [], tracks: [] }),
  ]);

  const discogsItems =
    discogsResult.status === "fulfilled" ? discogsResult.value : [];

  const labels: import("@/lib/integrations/music-types").LabelSearchResult[] =
    shouldSearchDiscogsLabels
      ? discogsItems.map((item) => ({
          id: item.id,
          source: "discogs" as const,
          name: item.artist === "Various artists" ? item.title : item.artist,
          imageUrl: item.imageUrl,
          externalUrl: item.externalUrl,
        }))
      : [];

  const vinylReleases = shouldSearchDiscogsLabels ? [] : discogsItems;

  const response: MusicSearchResponse = {
    query,
    type,
    nextCursor: String(page + 1),
    results: {
      vinylReleases,
      labels,
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
