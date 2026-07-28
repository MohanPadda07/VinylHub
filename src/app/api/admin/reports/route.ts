import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { canModerate } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const user = await requireCurrentAppUser();

  if (!canModerate(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ reports });
}
