import { prisma } from "@/lib/db/client";

type TrackInput = {
  position: number;
  title: string;
  previewUrl?: string | null;
  duration?: number | null;
  spotifyId?: string | null;
};

export function serializeAlbumTracks(
  tracks: Array<{
    id: string;
    position: number;
    title: string;
    previewUrl: string | null;
    duration: number | null;
  }>,
) {
  return tracks.map((track) => ({
    id: track.id,
    position: track.position,
    title: track.title,
    previewUrl: track.previewUrl,
    duration: track.duration,
  }));
}

export async function persistAlbumTracks(albumId: string, tracks: TrackInput[]) {
  return Promise.all(
    tracks.map((track) =>
      prisma.track.upsert({
        where: {
          albumId_position: { albumId, position: track.position },
        },
        update: {
          title: track.title,
          previewUrl: track.previewUrl ?? null,
          duration: track.duration ?? null,
          spotifyId: track.spotifyId ?? null,
        },
        create: {
          albumId,
          position: track.position,
          title: track.title,
          previewUrl: track.previewUrl ?? null,
          duration: track.duration ?? null,
          spotifyId: track.spotifyId ?? null,
        },
      }),
    ),
  );
}
