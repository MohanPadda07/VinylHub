import type {
  SpotifyAlbumResult,
  SpotifyArtistResult,
  VinylReleaseSearchResult,
} from "@/lib/integrations/music-types";
import { persistDiscogsRelease } from "@/features/collection/collection-service";
import { prisma } from "@/lib/db/client";
import { stableSlug } from "@/lib/slug";

export type CatalogResolveInput =
  | { type: "vinyl"; data: VinylReleaseSearchResult }
  | { type: "album"; data: SpotifyAlbumResult }
  | { type: "artist"; data: SpotifyArtistResult };

export type CatalogResolveResult = {
  albumSlug?: string;
  artistSlug?: string;
  vinylReleaseId?: string;
};

export async function resolveCatalogEntry(
  input: CatalogResolveInput,
): Promise<CatalogResolveResult> {
  if (input.type === "vinyl") {
    const release = await persistDiscogsRelease(input.data);
    const vinyl = await prisma.vinylRelease.findUnique({
      where: { id: release.id },
      include: { album: { include: { artist: true } } },
    });
    return {
      albumSlug: vinyl?.album.slug,
      artistSlug: vinyl?.album.artist.slug,
      vinylReleaseId: release.id,
    };
  }

  if (input.type === "album") {
    const { data } = input;
    const year = data.releaseDate
      ? Number.parseInt(data.releaseDate.slice(0, 4), 10)
      : null;
    const artistSlug = stableSlug(data.artist);
    const albumSlug = stableSlug(data.artist, data.title, year ?? data.id);

    const artist = await prisma.artist.upsert({
      where: { slug: artistSlug },
      update: { imageUrl: data.imageUrl, spotifyId: data.id },
      create: {
        name: data.artist,
        slug: artistSlug,
        imageUrl: data.imageUrl,
        spotifyId: data.id,
      },
    });

    const album = await prisma.album.upsert({
      where: { slug: albumSlug },
      update: {
        coverUrl: data.imageUrl,
        year: Number.isFinite(year) ? year : null,
        spotifyId: data.id,
      },
      create: {
        title: data.title,
        slug: albumSlug,
        year: Number.isFinite(year) ? year : null,
        coverUrl: data.imageUrl,
        spotifyId: data.id,
        artistId: artist.id,
      },
    });

    return { albumSlug: album.slug, artistSlug: artist.slug };
  }

  const { data } = input;
  const artistSlug = stableSlug(data.name);

  const artist = await prisma.artist.upsert({
    where: { slug: artistSlug },
    update: {
      imageUrl: data.imageUrl,
      genres: data.genres,
      spotifyId: data.id,
    },
    create: {
      name: data.name,
      slug: artistSlug,
      imageUrl: data.imageUrl,
      genres: data.genres,
      spotifyId: data.id,
    },
  });

  return { artistSlug: artist.slug };
}
