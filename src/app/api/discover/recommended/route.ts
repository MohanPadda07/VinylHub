import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/client";
import { getCollectionStats } from "@/features/collection/collection-service";

export async function GET() {
  const user = await requireCurrentAppUser();
  const stats = await getCollectionStats(user.id);

  const items = await prisma.collectionItem.findMany({
    where: { userId: user.id },
    include: {
      vinylRelease: {
        include: { album: { include: { genres: { include: { genre: true } } } } },
      },
    },
  });

  const genreCounts: Record<string, number> = {};
  for (const item of items) {
    for (const { genre } of item.vinylRelease.album.genres) {
      genreCounts[genre.name] = (genreCounts[genre.name] ?? 0) + 1;
    }
    for (const style of item.vinylRelease.album.styles) {
      genreCounts[style] = (genreCounts[style] ?? 0) + 1;
    }
  }

  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  const albums = topGenres.length
    ? await prisma.album.findMany({
        where: {
          OR: [
            { styles: { hasSome: topGenres } },
            { genres: { some: { genre: { name: { in: topGenres } } } } },
          ],
        },
        include: { artist: true },
        take: 8,
      })
    : await prisma.album.findMany({
        orderBy: { communityRating: "desc" },
        include: { artist: true },
        take: 8,
      });

  return NextResponse.json({
    albums: albums.map((a) => ({
      title: a.title,
      slug: a.slug,
      coverUrl: a.coverUrl,
      artist: a.artist.name,
      rating: a.communityRating,
    })),
    basedOnGenres: topGenres,
    collectionSize: stats.recordCount,
  });
}
