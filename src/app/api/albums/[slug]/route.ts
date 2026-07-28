import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const album = await prisma.album.findUnique({
    where: { slug },
    include: {
      artist: true,
      genres: { include: { genre: true } },
      tracks: { orderBy: { position: "asc" } },
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
      vinylReleases: {
        include: {
          label: true,
          priceSnapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
        },
      },
    },
  });

  if (!album) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }

  return NextResponse.json({ album });
}
