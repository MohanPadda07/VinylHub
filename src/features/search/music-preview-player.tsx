"use client";

import { TrackPreviewPlayer } from "@/components/music";
import type { PreviewTrack } from "@/stores/player-store";

/** Thin adapter so existing search UI keeps working with the new preview engine. */
export function MusicPreviewPlayer({ track }: { track: PreviewTrack }) {
  if (!track.previewUrl) {
    return <p className="text-xs text-zinc-500">Preview unavailable</p>;
  }

  return (
    <TrackPreviewPlayer
      track={{
        id: track.id,
        title: track.title,
        artist: track.artist,
        previewUrl: track.previewUrl,
        artworkUrl: track.artworkUrl,
      }}
    />
  );
}
