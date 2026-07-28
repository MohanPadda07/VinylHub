import {
  getDiscogsRelease,
  getDiscogsReleaseTracks,
  searchDiscogsVinyl,
} from "@/lib/integrations/discogs";
import type { DiscogsAlbumTrack } from "@/lib/services/music/types";
import { withCache } from "@/lib/services/music/cache";

export async function searchVinyl(query: string) {
  return withCache(`discogs:search:${query.toLowerCase()}`, () =>
    searchDiscogsVinyl(query),
  );
}

export async function getRelease(discogsId: string) {
  return withCache(`discogs:release:${discogsId}`, () =>
    getDiscogsRelease(discogsId),
  );
}

export async function getReleaseTracks(
  discogsId: string,
): Promise<DiscogsAlbumTrack[]> {
  return withCache(`discogs:tracks:${discogsId}`, async () => {
    const tracks = await getDiscogsReleaseTracks(discogsId);
    return tracks.map((track) => ({
      position: track.position,
      title: track.title,
      duration: track.duration,
    }));
  });
}
