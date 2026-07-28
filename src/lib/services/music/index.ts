import "server-only";

import { prisma } from "@/lib/db/client";
import {
  persistAlbumTracks,
  serializeAlbumTracks,
} from "@/lib/catalog/track-sync";
import { withCache } from "@/lib/services/music/cache";
import * as deezer from "@/lib/services/music/deezer";
import * as discogs from "@/lib/services/music/discogs";
import * as musicbrainz from "@/lib/services/music/musicbrainz";
import * as spotify from "@/lib/services/music/spotify";
import type {
  MusicServiceAlbumLookup,
  NormalizedAlbum,
  NormalizedTrack,
} from "@/lib/services/music/types";

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .replace(/\b(feat|ft|featuring|remaster(ed)?|deluxe|edition|live|bonus|version)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Title similarity for cross-source track matching.
 * Exact normalized match wins; otherwise token overlap is used.
 */
function titlesMatch(a: string, b: string) {
  const left = normalizeTitle(a);
  const right = normalizeTitle(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;

  const leftTokens = new Set(left.split(" "));
  const rightTokens = right.split(" ");
  const overlap = rightTokens.filter((token) => leftTokens.has(token)).length;
  return overlap >= Math.min(2, rightTokens.length);
}

async function loadAlbumRecord(id: string) {
  return prisma.album.findFirst({
    where: {
      OR: [{ slug: id }, { id }],
    },
    include: {
      artist: true,
      genres: { include: { genre: true } },
      tracks: { orderBy: { position: "asc" } },
      vinylReleases: {
        include: { label: true },
        orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
      },
    },
  });
}

async function ensureBaseTracks(
  album: NonNullable<Awaited<ReturnType<typeof loadAlbumRecord>>>,
) {
  if (album.tracks.length > 0) {
    return album.tracks;
  }

  const discogsId =
    album.discogsId ??
    album.vinylReleases.find((release) => release.discogsId)?.discogsId ??
    null;

  if (discogsId) {
    try {
      const discogsTracks = await discogs.getReleaseTracks(discogsId);
      if (discogsTracks.length > 0) {
        return persistAlbumTracks(
          album.id,
          discogsTracks.map((track) => ({
            position: track.position,
            title: track.title,
            duration: track.duration ?? null,
          })),
        );
      }
    } catch {
      // Fall through to Spotify.
    }
  }

  let spotifyId = album.spotifyId;
  if (!spotifyId) {
    try {
      spotifyId = await spotify.findAlbumId(album.title, album.artist.name);
      if (spotifyId) {
        await prisma.album.update({
          where: { id: album.id },
          data: { spotifyId },
        });
      }
    } catch {
      spotifyId = null;
    }
  }

  if (spotifyId) {
    try {
      const spotifyTracks = await spotify.getAlbumTracks(spotifyId);
      if (spotifyTracks.length > 0) {
        return persistAlbumTracks(
          album.id,
          spotifyTracks.map((track) => ({
            position: track.position,
            title: track.title,
            previewUrl: track.previewUrl ?? null,
            duration: track.duration ?? null,
            spotifyId: track.id,
          })),
        );
      }
    } catch {
      // No tracks available from Spotify either.
    }
  }

  return [];
}

async function enrichTracksWithPreviews(
  albumTitle: string,
  artistName: string,
  tracks: Array<{
    id: string;
    position: number;
    title: string;
    duration: number | null;
    previewUrl: string | null;
    spotifyId: string | null;
  }>,
): Promise<NormalizedTrack[]> {
  // Prefer album-level Deezer match so track order aligns better.
  const deezerAlbum = await deezer.searchAlbum(albumTitle, artistName);
  const deezerAlbumTracks = deezerAlbum?.id
    ? await deezer.getAlbumTracks(deezerAlbum.id)
    : [];

  let spotifyTracks: Awaited<ReturnType<typeof spotify.getAlbumTracks>> = [];
  try {
    const spotifyAlbumId = await spotify.findAlbumId(albumTitle, artistName);
    if (spotifyAlbumId) {
      spotifyTracks = await spotify.getAlbumTracks(spotifyAlbumId);
    }
  } catch {
    spotifyTracks = [];
  }

  const enriched: NormalizedTrack[] = [];

  for (const track of tracks) {
    const spotifyMatch =
      spotifyTracks.find(
        (candidate) =>
          candidate.position === track.position ||
          titlesMatch(candidate.title, track.title),
      ) ?? null;

    let previewUrl = track.previewUrl ?? spotifyMatch?.previewUrl ?? null;
    let deezerId: string | null = null;
    let albumCover: string | null = deezerAlbum?.cover ?? null;

    // Match Deezer album track by normalized title first, then position.
    const deezerMatch =
      deezerAlbumTracks.find((candidate) =>
        titlesMatch(candidate.title, track.title),
      ) ??
      deezerAlbumTracks[track.position - 1] ??
      null;

    if (deezerMatch?.previewUrl) {
      previewUrl = previewUrl ?? deezerMatch.previewUrl;
      deezerId = deezerMatch.deezerTrackId;
      albumCover = deezerMatch.albumCover ?? albumCover;
    } else if (!previewUrl) {
      // Per-track Deezer lookup when album-level matching misses.
      const preview = await deezer.getPreview(
        track.title,
        artistName,
        albumTitle,
      );
      if (preview) {
        previewUrl = preview.previewUrl;
        deezerId = preview.deezerTrackId;
        albumCover = preview.albumCover ?? albumCover;
      }
    } else if (!deezerId && deezerMatch) {
      deezerId = deezerMatch.deezerTrackId;
    }

    // Persist preview URL when we discovered a new one.
    if (previewUrl && previewUrl !== track.previewUrl) {
      try {
        await prisma.track.update({
          where: { id: track.id },
          data: { previewUrl },
        });
      } catch {
        // Persistence is best-effort; still return the enriched track.
      }
    }

    enriched.push({
      id: track.id,
      position: track.position,
      title: track.title,
      duration: track.duration ?? spotifyMatch?.duration ?? null,
      previewUrl,
      spotifyUrl:
        spotifyMatch?.spotifyUrl ??
        (track.spotifyId
          ? `https://open.spotify.com/track/${track.spotifyId}`
          : null),
      deezerId,
      albumCover,
    });
  }

  return enriched;
}

async function buildNormalizedAlbum(
  lookup: MusicServiceAlbumLookup,
): Promise<NormalizedAlbum | null> {
  const album = await loadAlbumRecord(lookup.id);
  if (!album) return null;

  const baseTracks = await ensureBaseTracks(album);
  const serialized = serializeAlbumTracks(baseTracks).map((track, index) => ({
    ...track,
    spotifyId: baseTracks[index]?.spotifyId ?? null,
  }));

  let tracks: NormalizedTrack[];
  let deezerUsed = false;

  if (lookup.skipPreviews) {
    tracks = serialized.map((track) => ({
      id: track.id,
      position: track.position,
      title: track.title,
      duration: track.duration,
      previewUrl: track.previewUrl,
      spotifyUrl: track.spotifyId
        ? `https://open.spotify.com/track/${track.spotifyId}`
        : null,
      deezerId: null,
      albumCover: album.coverUrl,
    }));
  } else {
    tracks = await enrichTracksWithPreviews(
      album.title,
      album.artist.name,
      serialized,
    );
    deezerUsed = tracks.some((track) => Boolean(track.deezerId || track.previewUrl));
  }

  let musicbrainzUsed = false;
  let genres = album.genres.map((entry) => entry.genre.name);
  let year = album.year;

  if (genres.length === 0 || !year) {
    const mb = await musicbrainz.searchReleaseGroup(
      album.title,
      album.artist.name,
    );
    if (mb) {
      musicbrainzUsed = true;
      if (genres.length === 0) genres = mb.genres;
      if (!year) year = mb.year;
    }
  }

  return {
    album: {
      id: album.id,
      slug: album.slug,
      title: album.title,
      discogsId: album.discogsId,
      spotifyId: album.spotifyId,
    },
    artist: {
      id: album.artist.id,
      slug: album.artist.slug,
      name: album.artist.name,
    },
    artwork: album.coverUrl,
    tracks,
    vinylReleases: album.vinylReleases.map((release) => ({
      id: release.id,
      title: release.title,
      discogsId: release.discogsId,
      country: release.country,
      format: release.format,
      catalogNumber: release.catalogNumber,
      releaseYear: release.releaseYear,
      marketValueCents: release.marketValueCents,
      labelName: release.label?.name ?? null,
    })),
    genres,
    year,
    sources: {
      discogs: Boolean(
        album.discogsId ||
          album.vinylReleases.some((release) => release.discogsId),
      ),
      musicbrainz: musicbrainzUsed,
      spotify: Boolean(album.spotifyId) || tracks.some((t) => Boolean(t.spotifyUrl)),
      deezer: deezerUsed,
    },
  };
}

export const musicService = {
  getAlbum(lookup: MusicServiceAlbumLookup) {
    const cacheKey = `music:album:${lookup.id}:${lookup.skipPreviews ? "bare" : "full"}`;
    return withCache(cacheKey, () => buildNormalizedAlbum(lookup), 10 * 60 * 1000);
  },
  deezer,
  discogs,
  musicbrainz,
  spotify,
};

export type { NormalizedAlbum, NormalizedTrack, DeezerPreview } from "@/lib/services/music/types";
