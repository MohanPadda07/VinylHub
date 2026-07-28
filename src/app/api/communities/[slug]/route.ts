import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      posts: {
        include: {
          author: { select: { displayName: true, username: true, imageUrl: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!community) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ community });
}

const postSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await requireCurrentAppUser();
    const { slug } = await params;
    const body = postSchema.parse(await request.json());

    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const post = await prisma.post.create({
      data: {
        title: body.title,
        body: body.body,
        authorId: user.id,
        communityId: community.id,
      },
      include: { author: { select: { displayName: true, username: true, imageUrl: true } } },
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "POST_CREATE",
        targetType: "post",
        targetId: post.id,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
