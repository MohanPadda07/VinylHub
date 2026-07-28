import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const debate = await prisma.debate.findUnique({
    where: { slug },
    include: {
      options: { orderBy: { votes: "desc" } },
      arguments: {
        include: {
          author: { select: { displayName: true, username: true, imageUrl: true } },
        },
        orderBy: { score: "desc" },
      },
      _count: { select: { votes: true } },
    },
  });

  if (!debate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ debate });
}

const voteSchema = z.object({ optionId: z.string() });
const argumentSchema = z.object({ body: z.string().min(2), optionId: z.string().optional() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await requireCurrentAppUser();
    const { slug } = await params;
    const debate = await prisma.debate.findUnique({ where: { slug } });
    if (!debate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const json = await request.json();

    if (json.action === "vote") {
      const { optionId } = voteSchema.parse(json);
      await prisma.debateVote.upsert({
        where: { debateId_userId: { debateId: debate.id, userId: user.id } },
        update: { optionId },
        create: { debateId: debate.id, optionId, userId: user.id },
      });
      const counts = await prisma.debateVote.groupBy({
        by: ["optionId"],
        where: { debateId: debate.id },
        _count: { id: true },
      });
      for (const c of counts) {
        await prisma.debateOption.update({
          where: { id: c.optionId },
          data: { votes: c._count.id },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (json.action === "argue") {
      const { body, optionId } = argumentSchema.parse(json);
      const argument = await prisma.debateArgument.create({
        data: { debateId: debate.id, authorId: user.id, body, optionId },
        include: { author: { select: { displayName: true, username: true } } },
      });
      return NextResponse.json({ argument });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
