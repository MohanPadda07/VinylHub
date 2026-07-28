import type { DeezerPreview } from "@/lib/services/music/types";
import { withCache } from "@/lib/services/music/cache";

const DEEZER_BASE_URL = "https://api.deezer.com";
const USER_AGENT = process.env.MUSICBRAINZ_USER_AGENT ?? "VinylHub/0.1.0";

/** Soft rate limiter: Deezer allows ~50 requests / 5s. */
let lastRequestAt = 0;
const MIN_INTERVAL_MS = 110;

type DeezerArtist = { id?: number; name?: string };
type DeezerAlbum = {
  id?: number;
  title?: string;
  cover_medium?: string;
  cover_big?: string;
  cover_xl?: string;
};

type DeezerTrack = {
  id?: number;
  title?: string;
  title_short?: string;
  duration?: number;
  preview?: string;
  link?: string;
  artist?: DeezerArtist;
  album?: DeezerAlbum;
};

type DeezerSearchResponse = {
  data?: DeezerTrack[];
  error?: { type?: string; message?: string; code?: number };
};

type DeezerAlbumSearchItem = {
  id?: number;
  title?: string;
  cover_medium?: string;
  cover_big?: string;
  link?: string;
  artist?: DeezerArtist;
};

type DeezerAlbumSearchResponse = {
  data?: DeezerAlbumSearchItem[];
  error?: { type?: string; message?: string; code?: number };
};

type DeezerAlbumTracksResponse = {
  data?: DeezerTrack[];
  error?: { type?: string; message?: string; code?: number };
};

class DeezerRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DeezerRequestError";
    this.status = status;
  }
}

async function throttle() {
  const now = Date.now();
  const wait = MIN_INTERVAL_MS - (now - lastRequestAt);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastRequestAt = Date.now();
}

async function deezerFetch<T>(
  path: string,
  searchParams?: Record<string, string>,
  attempt = 0,
): Promise<T> {
  await throttle();

  const url = new URL(path, DEEZER_BASE_URL);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(12_000),
    });
  } catch (error) {
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      return deezerFetch<T>(path, searchParams, attempt + 1);
    }
    throw new DeezerRequestError(
      error instanceof Error ? error.message : "Deezer network failure",
      0,
    );
  }

  if (response.status === 429 && attempt < 3) {
    const retryAfter = Number(response.headers.get("retry-after") ?? "1");
    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(500, retryAfter * 1000)),
    );
    return deezerFetch<T>(path, searchParams, attempt + 1);
  }

  if (!response.ok) {
    throw new DeezerRequestError(
      `Deezer request failed with ${response.status}`,
      response.status,
    );
  }

  const payload = (await response.json()) as T & {
    error?: { message?: string; code?: number };
  };

  if (payload && typeof payload === "object" && "error" in payload && payload.error) {
    throw new DeezerRequestError(
      payload.error.message ?? "Deezer returned an error payload",
      payload.error.code ?? 400,
    );
  }

  return payload;
}

function toPreview(track: DeezerTrack | undefined): DeezerPreview | null {
  if (!track?.id || !track.preview?.trim()) {
    return null;
  }

  return {
    previewUrl: track.preview,
    deezerTrackId: String(track.id),
    albumCover:
      track.album?.cover_big ||
      track.album?.cover_xl ||
      track.album?.cover_medium,
    duration: typeof track.duration === "number" ? track.duration : 30,
    title: track.title_short || track.title || "Untitled",
    artist: track.artist?.name || "Unknown artist",
  };
}

function normalizeForMatch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .replace(/\b(feat|ft|featuring|remaster(ed)?|deluxe|edition|live|bonus)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreCandidate(
  track: DeezerTrack,
  title: string,
  artist: string,
): number {
  const targetTitle = normalizeForMatch(title);
  const targetArtist = normalizeForMatch(artist);
  const candidateTitle = normalizeForMatch(track.title_short || track.title || "");
  const candidateArtist = normalizeForMatch(track.artist?.name || "");

  if (!candidateTitle) return -1;

  let score = 0;
  if (candidateTitle === targetTitle) score += 100;
  else if (candidateTitle.includes(targetTitle) || targetTitle.includes(candidateTitle))
    score += 70;
  else {
    const targetTokens = new Set(targetTitle.split(" "));
    const overlap = candidateTitle
      .split(" ")
      .filter((token) => targetTokens.has(token)).length;
    score += overlap * 12;
  }

  if (candidateArtist === targetArtist) score += 40;
  else if (
    candidateArtist.includes(targetArtist) ||
    targetArtist.includes(candidateArtist)
  )
    score += 25;

  if (track.preview) score += 15;
  return score;
}

export async function searchTrack(
  title: string,
  artist: string,
): Promise<DeezerPreview | null> {
  const query = `artist:"${artist}" track:"${title}"`;
  const cacheKey = `deezer:track:${normalizeForMatch(artist)}:${normalizeForMatch(title)}`;

  return withCache(cacheKey, async () => {
    try {
      const payload = await deezerFetch<DeezerSearchResponse>("/search/track", {
        q: query,
        limit: "8",
      });

      const candidates = payload.data ?? [];
      if (candidates.length === 0) {
        // Broader fallback without strict field filters.
        const fallback = await deezerFetch<DeezerSearchResponse>("/search/track", {
          q: `${artist} ${title}`,
          limit: "8",
        });
        const ranked = [...(fallback.data ?? [])].sort(
          (a, b) => scoreCandidate(b, title, artist) - scoreCandidate(a, title, artist),
        );
        const best = ranked[0];
        if (!best || scoreCandidate(best, title, artist) < 40) return null;
        return toPreview(best);
      }

      const ranked = [...candidates].sort(
        (a, b) => scoreCandidate(b, title, artist) - scoreCandidate(a, title, artist),
      );
      const best = ranked[0];
      if (!best || scoreCandidate(best, title, artist) < 40) return null;
      return toPreview(best);
    } catch {
      return null;
    }
  });
}

export async function searchAlbum(title: string, artist: string) {
  const cacheKey = `deezer:album:${normalizeForMatch(artist)}:${normalizeForMatch(title)}`;

  return withCache(cacheKey, async () => {
    try {
      const payload = await deezerFetch<DeezerAlbumSearchResponse>("/search/album", {
        q: `artist:"${artist}" album:"${title}"`,
        limit: "5",
      });

      let albums = payload.data ?? [];
      if (albums.length === 0) {
        const fallback = await deezerFetch<DeezerAlbumSearchResponse>("/search/album", {
          q: `${artist} ${title}`,
          limit: "5",
        });
        albums = fallback.data ?? [];
      }

      const album = albums[0];
      if (!album?.id) return null;

      return {
        id: String(album.id),
        title: album.title ?? title,
        artist: album.artist?.name ?? artist,
        cover:
          album.cover_big || album.cover_medium || undefined,
        link: album.link,
      };
    } catch {
      return null;
    }
  });
}

export async function getAlbumTracks(deezerAlbumId: string): Promise<DeezerPreview[]> {
  const cacheKey = `deezer:album-tracks:${deezerAlbumId}`;

  return withCache(cacheKey, async () => {
    try {
      const payload = await deezerFetch<DeezerAlbumTracksResponse>(
        `/album/${deezerAlbumId}/tracks`,
        { limit: "100" },
      );

      return (payload.data ?? [])
        .map((track) => toPreview(track))
        .filter((track): track is DeezerPreview => Boolean(track));
    } catch {
      return [];
    }
  });
}

/**
 * Resolve a 30s preview for a track. Prefers album-scoped matches when available.
 */
export async function getPreview(
  trackTitle: string,
  artistName: string,
  albumTitle?: string,
): Promise<DeezerPreview | null> {
  if (!trackTitle.trim() || !artistName.trim()) {
    return null;
  }

  if (albumTitle?.trim()) {
    const album = await searchAlbum(albumTitle, artistName);
    if (album?.id) {
      const albumTracks = await getAlbumTracks(album.id);

      let best: DeezerPreview | null = null;
      let bestScore = -1;
      for (const candidate of albumTracks) {
        const score = scoreCandidate(
          {
            id: Number(candidate.deezerTrackId),
            title: candidate.title,
            artist: { name: candidate.artist },
            preview: candidate.previewUrl,
            duration: candidate.duration,
          },
          trackTitle,
          artistName,
        );
        if (score > bestScore) {
          bestScore = score;
          best = candidate;
        }
      }

      if (best && bestScore >= 50) {
        return {
          ...best,
          albumCover: best.albumCover ?? album.cover,
        };
      }
    }
  }

  return searchTrack(trackTitle, artistName);
}

export { DeezerRequestError };
