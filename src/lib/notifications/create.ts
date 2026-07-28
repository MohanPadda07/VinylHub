import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db/client";

export async function createNotification({
  userId,
  actorId,
  type,
  title,
  body,
  targetType,
  targetId,
}: {
  userId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  body?: string;
  targetType?: string;
  targetId?: string;
}) {
  if (actorId && actorId === userId) return;

  return prisma.notification.create({
    data: { userId, actorId, type, title, body, targetType, targetId },
  });
}
