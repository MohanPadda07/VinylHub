import { NextResponse } from "next/server";
import { requireCurrentAppUser } from "@/lib/auth/current-user";

export async function GET() {
  try {
    const user = await requireCurrentAppUser();

    return NextResponse.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      imageUrl: user.imageUrl,
      bio: user.bio,
      role: user.role,
      reputation: user.reputation,
      level: user.level,
      favoriteGenres: user.favoriteGenres,
      favoriteArtists: user.favoriteArtists,
      createdAt: user.createdAt,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
