import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/client";
import { createNotification } from "@/lib/notifications/create";
import { z } from "zod";

export async function GET() {
  const user = await requireCurrentAppUser();

  const [incoming, outgoing, following, followers] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { receiverId: user.id, status: "PENDING" },
    }),
    prisma.friendRequest.findMany({
      where: { senderId: user.id, status: "PENDING" },
    }),
    prisma.follow.findMany({
      where: { followerId: user.id },
      include: { following: { select: { id: true, displayName: true, username: true, imageUrl: true } } },
    }),
    prisma.follow.findMany({
      where: { followingId: user.id },
      include: { follower: { select: { id: true, displayName: true, username: true, imageUrl: true } } },
    }),
  ]);

  const userIds = [...incoming.map((r) => r.senderId), ...outgoing.map((r) => r.receiverId)];
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, displayName: true, username: true, imageUrl: true },
      })
    : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return NextResponse.json({
    incoming: incoming.map((r) => ({ ...r, user: userMap[r.senderId] })),
    outgoing: outgoing.map((r) => ({ ...r, user: userMap[r.receiverId] })),
    following: following.map((f) => f.following),
    followers: followers.map((f) => f.follower),
  });
}

const requestSchema = z.object({
  receiverId: z.string(),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireCurrentAppUser();
    const body = requestSchema.parse(await request.json());

    if (body.receiverId === user.id) {
      return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 });
    }

    const friendRequest = await prisma.friendRequest.upsert({
      where: {
        senderId_receiverId: { senderId: user.id, receiverId: body.receiverId },
      },
      update: { status: "PENDING", message: body.message },
      create: {
        senderId: user.id,
        receiverId: body.receiverId,
        message: body.message,
      },
    });

    await createNotification({
      userId: body.receiverId,
      actorId: user.id,
      type: "FRIEND_REQUEST",
      title: "Friend request",
      body: `${user.displayName} sent you a friend request`,
      targetType: "friendRequest",
      targetId: friendRequest.id,
    });

    return NextResponse.json({ friendRequest });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireCurrentAppUser();
    const { requestId, action } = z
      .object({ requestId: z.string(), action: z.enum(["ACCEPTED", "REJECTED"]) })
      .parse(await request.json());

    const friendRequest = await prisma.friendRequest.findFirst({
      where: { id: requestId, receiverId: user.id },
    });

    if (!friendRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: action },
    });

    if (action === "ACCEPTED") {
      await prisma.activity.create({
        data: {
          userId: user.id,
          type: "FRIEND_ACCEPT",
          targetType: "user",
          targetId: friendRequest.senderId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
