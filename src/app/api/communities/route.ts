import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/client";
import { slugify } from "@/lib/slug";
import { z } from "zod";

export async function GET() {
  const communities = await prisma.community.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    communities: communities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      type: c.type,
      postCount: c._count.posts,
    })),
  });
}

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["ARTIST", "GENRE", "ALBUM", "GENERAL"]).default("GENERAL"),
});

export async function POST(request: Request) {
  try {
    await requireCurrentAppUser();
    const body = createSchema.parse(await request.json());
    const slug = slugify(body.name);

    const community = await prisma.community.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        type: body.type,
      },
    });

    return NextResponse.json({ community });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create community";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
