"use client";

import { ExternalLink, Loader2, Pause, Play, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreviewAudio } from "@/components/music/PreviewAudioProvider";
import { Waveform } from "@/components/music/Waveform";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function MiniPlayer() {
  const {
    activeTrack,
    isPlaying,
    isLoading,
    progress,
    duration,
    volume,
    pause,
    resume,
    stop,
    seek,
    setVolume,
  } = usePreviewAudio();

  if (!activeTrack) return null;

  const max = duration > 0 ? duration : 30;
  const pct = Math.min(100, (progress / max) * 100);

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-50 border-t border-cyan/25 bg-panel/95 backdrop-blur-xl shadow-[0_-12px_40px_rgba(217,0,255,0.12)]",
        "bottom-16 lg:bottom-0",
      )}
      role="region"
      aria-label="Music preview player"
    >
      <div
        className="h-0.5 bg-white/10"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-cyan via-purple to-fuchsia transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-amber/20">
          {activeTrack.artworkUrl ? (
            <div
              className={cn(
                "h-full w-full bg-cover bg-center",
                isPlaying && "spinning-record",
              )}
              style={{ backgroundImage: `url(${activeTrack.artworkUrl})` }}
            />
          ) : (
            <div className="record-grooves h-full w-full" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{activeTrack.title}</p>
          <p className="truncate text-xs text-zinc-400">{activeTrack.artist}</p>
          <div className="mt-1.5 hidden sm:block">
            <Waveform progress={pct} active={isPlaying} />
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] tabular-nums text-zinc-500">
              {formatTime(progress)}
            </span>
            <input
              type="range"
              min={0}
              max={max}
              step={0.1}
              value={Math.min(progress, max)}
              onChange={(event) => seek(Number(event.target.value))}
              className="h-1 flex-1 accent-emerald"
              aria-label="Seek preview"
            />
            <span className="text-[10px] tabular-nums text-zinc-500">
              {formatTime(max)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => (isPlaying ? pause() : resume())}
            aria-label={isPlaying ? "Pause preview" : "Play preview"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Volume2 className="hidden h-4 w-4 text-zinc-400 sm:block" aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="hidden w-16 accent-emerald sm:block"
            aria-label="Volume"
          />

          {activeTrack.spotifyUrl ? (
            <Button size="icon" variant="ghost" asChild>
              <a
                href={activeTrack.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open on Spotify"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : null}

          <Button size="icon" variant="ghost" onClick={stop} aria-label="Close player">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
