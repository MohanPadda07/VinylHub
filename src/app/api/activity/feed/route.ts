import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const user = await requireCurrentAppUser();

  const following = await prisma.follow.findMany({
    where: { followerId: user.id },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  const activities = await prisma.activity.findMany({
    where: followingIds.length ? { userId: { in: followingIds } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const userIds = [...new Set(activities.map((a) => a.userId))];
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, displayName: true, username: true, imageUrl: true },
      })
    : [];

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return NextResponse.json({
    activities: activities.map((a) => ({
      id: a.id,
      type: a.type,
      user: userMap[a.userId],
      createdAt: a.createdAt.toISOString(),
      metadata: a.metadata,
    })),
  });
}
