import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const [topAlbums, topArtists, recentActivity] = await Promise.all([
    prisma.album.findMany({
      orderBy: { communityRating: "desc" },
      take: 6,
      include: { artist: true },
      where: { communityRating: { not: null } },
    }),
    prisma.artist.findMany({
      take: 6,
      orderBy: { albums: { _count: "desc" } },
      include: { _count: { select: { albums: true } } },
    }),
    prisma.activity.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const collectionAdds = await prisma.collectionItem.groupBy({
    by: ["vinylReleaseId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 6,
  });

  const trendingReleases = collectionAdds.length
    ? await prisma.vinylRelease.findMany({
        where: { id: { in: collectionAdds.map((c) => c.vinylReleaseId) } },
        include: { album: { include: { artist: true } } },
      })
    : [];

  const activityUsers = recentActivity.length
    ? await prisma.user.findMany({
        where: { id: { in: recentActivity.map((a) => a.userId) } },
        select: { id: true, displayName: true, username: true, imageUrl: true },
      })
    : [];
  const activityUserMap = Object.fromEntries(activityUsers.map((u) => [u.id, u]));

  return NextResponse.json({
    albums: topAlbums.map((a) => ({
      title: a.title,
      slug: a.slug,
      coverUrl: a.coverUrl,
      artist: a.artist.name,
      rating: a.communityRating,
    })),
    artists: topArtists.map((a) => ({
      name: a.name,
      slug: a.slug,
      imageUrl: a.imageUrl,
      albumCount: a._count.albums,
    })),
    trending: trendingReleases.map((r) => ({
      title: r.title,
      albumSlug: r.album.slug,
      artist: r.album.artist.name,
      coverUrl: r.album.coverUrl,
    })),
    activity: recentActivity.map((a) => ({
      id: a.id,
      type: a.type,
      user: activityUserMap[a.userId] ?? { displayName: "User", username: "user" },
      createdAt: a.createdAt.toISOString(),
      metadata: a.metadata,
    })),
  });
}
