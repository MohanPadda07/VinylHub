import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const genres = await prisma.genre.findMany({
    include: { _count: { select: { albums: true } } },
    orderBy: { name: "asc" },
    take: 24,
  });

  return NextResponse.json({ genres });
}
