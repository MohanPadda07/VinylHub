import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { displayName: true, username: true, imageUrl: true } },
      comments: {
        include: {
          author: { select: { displayName: true, username: true, imageUrl: true } },
          replies: {
            include: {
              author: { select: { displayName: true, username: true, imageUrl: true } },
            },
          },
        },
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
      },
      community: { select: { name: true, slug: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

const commentSchema = z.object({
  body: z.string().min(1),
  parentId: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireCurrentAppUser();
    const { id } = await params;
    const body = commentSchema.parse(await request.json());

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        authorId: user.id,
        body: body.body,
        parentId: body.parentId,
      },
      include: { author: { select: { displayName: true, username: true, imageUrl: true } } },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to comment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
