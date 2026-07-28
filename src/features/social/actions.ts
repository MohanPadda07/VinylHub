"use server";

import { z } from "zod";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/client";
import { slugify } from "@/lib/slug";
import { createNotification } from "@/lib/notifications/create";

const postSchema = z.object({
  communitySlug: z.string(),
  title: z.string().min(2),
  body: z.string().min(2),
});

export async function createPostAction(input: z.infer<typeof postSchema>) {
  const user = await requireCurrentAppUser();
  const data = postSchema.parse(input);

  const community = await prisma.community.findUnique({ where: { slug: data.communitySlug } });
  if (!community) throw new Error("Community not found");

  const post = await prisma.post.create({
    data: {
      title: data.title,
      body: data.body,
      authorId: user.id,
      communityId: community.id,
    },
  });

  await prisma.activity.create({
    data: {
      userId: user.id,
      type: "POST_CREATE",
      targetType: "post",
      targetId: post.id,
    },
  });

  return { postId: post.id };
}

const commentSchema = z.object({
  postId: z.string(),
  body: z.string().min(1),
  parentId: z.string().optional(),
});

export async function createCommentAction(input: z.infer<typeof commentSchema>) {
  const user = await requireCurrentAppUser();
  const data = commentSchema.parse(input);

  const post = await prisma.post.findUnique({
    where: { id: data.postId },
    select: { authorId: true, title: true },
  });
  if (!post) throw new Error("Post not found");

  const comment = await prisma.comment.create({
    data: {
      postId: data.postId,
      authorId: user.id,
      body: data.body,
      parentId: data.parentId,
    },
  });

  if (post.authorId !== user.id) {
    await createNotification({
      userId: post.authorId,
      actorId: user.id,
      type: data.parentId ? "REPLY" : "COMMENT",
      title: data.parentId ? "New reply" : "New comment",
      body: `On "${post.title}"`,
      targetType: "post",
      targetId: data.postId,
    });
  }

  return { commentId: comment.id };
}

const voteSchema = z.object({
  postId: z.string(),
  vote: z.enum(["UP", "DOWN"]),
});

export async function votePostAction(input: z.infer<typeof voteSchema>) {
  const user = await requireCurrentAppUser();
  const data = voteSchema.parse(input);

  await prisma.postVote.upsert({
    where: { postId_userId: { postId: data.postId, userId: user.id } },
    update: { vote: data.vote },
    create: { postId: data.postId, userId: user.id, vote: data.vote },
  });

  const counts = await prisma.postVote.groupBy({
    by: ["vote"],
    where: { postId: data.postId },
    _count: { id: true },
  });

  const up = counts.find((c) => c.vote === "UP")?._count.id ?? 0;
  const down = counts.find((c) => c.vote === "DOWN")?._count.id ?? 0;

  await prisma.post.update({
    where: { id: data.postId },
    data: { score: up - down },
  });

  return { success: true };
}

const communitySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["ARTIST", "GENRE", "ALBUM", "GENERAL"]).default("GENERAL"),
});

export async function createCommunityAction(input: z.infer<typeof communitySchema>) {
  await requireCurrentAppUser();
  const data = communitySchema.parse(input);

  const community = await prisma.community.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      type: data.type,
    },
  });

  return { slug: community.slug };
}

const debateSchema = z.object({
  title: z.string().min(3),
  prompt: z.string().min(10),
  options: z.array(z.string().min(1)).min(2).max(6),
});

export async function createDebateAction(input: z.infer<typeof debateSchema>) {
  await requireCurrentAppUser();
  const data = debateSchema.parse(input);

  const debate = await prisma.debate.create({
    data: {
      title: data.title,
      slug: slugify(data.title),
      prompt: data.prompt,
      options: { create: data.options.map((label) => ({ label })) },
    },
  });

  return { slug: debate.slug };
}
