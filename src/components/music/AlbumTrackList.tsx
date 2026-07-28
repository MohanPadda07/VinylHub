"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2 } from "lucide-react";
import { TrackPreviewPlayer } from "@/components/music/TrackPreviewPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import type { NormalizedAlbum } from "@/lib/services/music/types";
import { cn } from "@/lib/utils";

type AlbumTrackListProps = {
  albumId: string;
  className?: string;
};

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

async function fetchAlbum(id: string): Promise<NormalizedAlbum> {
  const response = await fetch(`/api/music/album?id=${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  const payload = (await response.json()) as NormalizedAlbum & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not load album previews.");
  }
  return payload;
}

function AlbumTrackListSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading tracklist">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-md border border-white/5 bg-white/[0.02] px-3 py-3"
        >
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function AlbumTrackListComponent({ albumId, className }: AlbumTrackListProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["music-album", albumId],
    queryFn: () => fetchAlbum(albumId),
    enabled: visible,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const tracks = data?.tracks ?? [];
  const artwork = data?.artwork;

  const previewCount = useMemo(
    () => tracks.filter((track) => Boolean(track.previewUrl)).length,
    [tracks],
  );

  return (
    <div ref={rootRef} className={cn("space-y-3", className)}>
      {!visible || isLoading ? (
        <AlbumTrackListSkeleton />
      ) : isError ? (
        <div className="rounded-lg border border-coral/20 bg-coral/[0.06] p-4 text-sm text-coral">
          <p>
            {error instanceof Error
              ? error.message
              : "Track previews are temporarily unavailable."}
          </p>
          <button
            type="button"
            className="mt-3 text-xs underline underline-offset-2"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        </div>
      ) : tracks.length === 0 ? (
        <p className="py-4 text-sm text-zinc-400">
          No tracklist available for this release.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
            <p>
              {previewCount} of {tracks.length} tracks have 30-second previews
              {data?.sources.deezer ? " via Deezer" : ""}.
            </p>
            {isFetching ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Refreshing
              </span>
            ) : null}
          </div>

          <ol className="divide-y divide-cyan/10 overflow-hidden rounded-xl border border-cyan/20 bg-panel/60 shadow-[0_0_40px_rgba(0,242,255,0.06)]">
            {tracks.map((track) => (
              <li
                key={track.id}
                className="group flex items-center gap-3 px-3 py-3 transition hover:bg-white/[0.035] sm:gap-4"
              >
                <span className="w-6 shrink-0 text-center text-xs tabular-nums text-zinc-500">
                  {track.position}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{track.title}</p>
                  {track.spotifyUrl ? (
                    <a
                      href={track.spotifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-zinc-500 transition hover:text-cyan"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Spotify
                    </a>
                  ) : null}
                </div>

                <span className="w-12 shrink-0 text-right text-xs tabular-nums text-zinc-500">
                  {formatDuration(track.duration)}
                </span>

                <TrackPreviewPlayer
                  compact
                  track={{
                    id: track.id,
                    title: track.title,
                    artist: data?.artist.name ?? "Unknown artist",
                    previewUrl: track.previewUrl ?? "",
                    artworkUrl: track.albumCover ?? artwork,
                    spotifyUrl: track.spotifyUrl,
                    deezerId: track.deezerId,
                    albumTitle: data?.album.title,
                  }}
                />
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

export const AlbumTrackList = memo(AlbumTrackListComponent);
