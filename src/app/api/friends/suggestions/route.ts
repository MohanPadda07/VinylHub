import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const user = await requireCurrentAppUser();

  const myGenres = await prisma.collectionItem.findMany({
    where: { userId: user.id },
    include: {
      vinylRelease: {
        include: { album: { include: { genres: { include: { genre: true } } } } },
      },
    },
    take: 50,
  });

  const genreSet = new Set<string>();
  for (const item of myGenres) {
    item.vinylRelease.album.genres.forEach((g) => genreSet.add(g.genreId));
  }

  const suggestions = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      collectionItems: genreSet.size
        ? {
            some: {
              vinylRelease: {
                album: { genres: { some: { genreId: { in: [...genreSet] } } } },
              },
            },
          }
        : undefined,
    },
    select: {
      id: true,
      displayName: true,
      username: true,
      imageUrl: true,
      _count: { select: { collectionItems: true } },
    },
    take: 8,
  });

  return NextResponse.json({ suggestions });
}
