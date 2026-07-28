import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import { getCollectionStats } from "@/features/collection/collection-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireCurrentAppUser();
    const stats = await getCollectionStats(user.id);

    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stats failed." },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 400 },
    );
  }
}
