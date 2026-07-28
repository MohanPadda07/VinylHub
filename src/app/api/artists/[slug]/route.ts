import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const artist = await prisma.artist.findUnique({
    where: { slug },
    include: {
      albums: {
        include: {
          vinylReleases: { include: { label: true } },
          tracks: { orderBy: { position: "asc" }, take: 5 },
        },
        orderBy: [{ year: "desc" }, { title: "asc" }],
      },
      communities: true,
    },
  });

  if (!artist) {
    return NextResponse.json({ error: "Artist not found." }, { status: 404 });
  }

  return NextResponse.json({ artist });
}
