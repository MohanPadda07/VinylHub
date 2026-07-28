import { NextResponse } from "next/server";
import { musicService } from "@/lib/services/music";

export const runtime = "nodejs";

/**
 * Legacy tracklist endpoint — now powered by the unified music service
 * so Deezer previews are included whenever available.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const album = await musicService.getAlbum({ id: slug });

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  return NextResponse.json({
    source: album.sources.deezer
      ? "deezer"
      : album.sources.spotify
        ? "spotify"
        : album.sources.discogs
          ? "discogs"
          : "cache",
    tracks: album.tracks.map((track) => ({
      id: track.id,
      position: track.position,
      title: track.title,
      previewUrl: track.previewUrl,
      duration: track.duration,
      spotifyUrl: track.spotifyUrl,
      deezerId: track.deezerId,
    })),
  });
}
