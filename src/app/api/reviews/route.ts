import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/client";

const createSchema = z.object({
  albumSlug: z.string(),
  rating: z.number().min(1).max(5),
  body: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const albumSlug = searchParams.get("albumSlug");

  if (!albumSlug) {
    return NextResponse.json({ error: "albumSlug required" }, { status: 400 });
  }

  const album = await prisma.album.findUnique({ where: { slug: albumSlug } });
  if (!album) {
    return NextResponse.json({ reviews: [] });
  }

  const reviews = await prisma.review.findMany({
    where: { albumId: album.id },
    include: { user: { select: { displayName: true, imageUrl: true, username: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentAppUser();
    const body = createSchema.parse(await request.json());

    const album = await prisma.album.findUnique({ where: { slug: body.albumSlug } });
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const review = await prisma.review.upsert({
      where: { userId_albumId: { userId: user.id, albumId: album.id } },
      update: { rating: body.rating, body: body.body },
      create: {
        userId: user.id,
        albumId: album.id,
        rating: body.rating,
        body: body.body,
      },
      include: { user: { select: { displayName: true, imageUrl: true, username: true } } },
    });

    const avgRating = await prisma.review.aggregate({
      where: { albumId: album.id },
      _avg: { rating: true },
    });

    await prisma.album.update({
      where: { id: album.id },
      data: { communityRating: avgRating._avg.rating },
    });

    return NextResponse.json({ review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create review";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
