import type { MusicBrainzReleaseGroup } from "@/lib/services/music/types";
import { withCache } from "@/lib/services/music/cache";

const MUSICBRAINZ_BASE_URL = "https://musicbrainz.org/ws/2";
const USER_AGENT =
  process.env.MUSICBRAINZ_USER_AGENT ?? "VinylHub/0.1.0 (local@vinylhub.dev)";

type MbArtistCredit = {
  name?: string;
  artist?: { name?: string };
};

type MbReleaseGroup = {
  id?: string;
  title?: string;
  "first-release-date"?: string;
  "artist-credit"?: MbArtistCredit[];
  tags?: Array<{ name?: string; count?: number }>;
};

type MbSearchResponse = {
  "release-groups"?: MbReleaseGroup[];
};

async function musicBrainzFetch<T>(
  path: string,
  searchParams: Record<string, string>,
): Promise<T | null> {
  const url = new URL(path, MUSICBRAINZ_BASE_URL);
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("fmt", "json");

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function artistName(credits?: MbArtistCredit[]) {
  if (!credits?.length) return "Unknown artist";
  return (
    credits
      .map((credit) => credit.name || credit.artist?.name)
      .filter(Boolean)
      .join(", ") || "Unknown artist"
  );
}

/**
 * Lookup a release-group by album + artist. MusicBrainz is metadata-only
 * (no audio previews) and is used to enrich genres/year when Discogs/Spotify
 * are incomplete.
 */
export async function searchReleaseGroup(
  title: string,
  artist: string,
): Promise<MusicBrainzReleaseGroup | null> {
  const cacheKey = `mb:rg:${artist.toLowerCase()}:${title.toLowerCase()}`;

  return withCache(cacheKey, async () => {
    const payload = await musicBrainzFetch<MbSearchResponse>("/release-group", {
      query: `releasegroup:"${title}" AND artist:"${artist}"`,
      limit: "5",
    });

    const group = payload?.["release-groups"]?.[0];
    if (!group?.id) return null;

    const yearRaw = group["first-release-date"]?.slice(0, 4);
    const year = yearRaw ? Number.parseInt(yearRaw, 10) : null;

    return {
      id: group.id,
      title: group.title ?? title,
      artist: artistName(group["artist-credit"]),
      year: Number.isFinite(year) ? year : null,
      genres: (group.tags ?? [])
        .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
        .map((tag) => tag.name)
        .filter((name): name is string => Boolean(name))
        .slice(0, 8),
    };
  });
}
