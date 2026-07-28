import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/client";
import { slugify } from "@/lib/slug";
import { z } from "zod";

export async function GET() {
  const debates = await prisma.debate.findMany({
    include: {
      options: true,
      _count: { select: { votes: true, arguments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ debates });
}

const createSchema = z.object({
  title: z.string().min(3),
  prompt: z.string().min(10),
  options: z.array(z.string().min(1)).min(2).max(6),
});

export async function POST(request: Request) {
  try {
    await requireCurrentAppUser();
    const body = createSchema.parse(await request.json());
    const slug = slugify(body.title);

    const debate = await prisma.debate.create({
      data: {
        title: body.title,
        slug,
        prompt: body.prompt,
        options: {
          create: body.options.map((label) => ({ label })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json({ debate });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create debate";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
