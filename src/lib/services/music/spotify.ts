import {
  getSpotifyAlbumTracks as fetchSpotifyAlbumTracks,
  searchSpotify,
} from "@/lib/integrations/spotify";
import type { SpotifyAlbumTrack } from "@/lib/services/music/types";
import { withCache } from "@/lib/services/music/cache";

export async function search(query: string) {
  return withCache(`spotify:search:${query.toLowerCase()}`, () =>
    searchSpotify(query),
  );
}

export async function getAlbumTracks(
  spotifyAlbumId: string,
): Promise<SpotifyAlbumTrack[]> {
  return withCache(`spotify:album-tracks:${spotifyAlbumId}`, async () => {
    const tracks = await fetchSpotifyAlbumTracks(spotifyAlbumId);
    return tracks.map((track) => ({
      id: track.id,
      position: track.position,
      title: track.title,
      artist: track.artist,
      previewUrl: track.previewUrl,
      duration: track.duration,
      spotifyUrl: `https://open.spotify.com/track/${track.id}`,
    }));
  });
}

export async function findAlbumId(title: string, artist: string) {
  const result = await search(`${artist} ${title}`);
  const match = result.albums.find((album) => {
    const titleMatch = album.title.toLowerCase().includes(title.toLowerCase());
    const artistMatch = album.artist.toLowerCase().includes(artist.toLowerCase());
    return titleMatch && artistMatch;
  });

  return match?.id ?? result.albums[0]?.id ?? null;
}
