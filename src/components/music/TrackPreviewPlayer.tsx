"use client";

import { memo, useEffect, useRef } from "react";
import { animate, createScope } from "animejs";
import { Loader2, Lock, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePreviewAudio,
  type PreviewMedia,
} from "@/components/music/PreviewAudioProvider";
import { cn } from "@/lib/utils";

type TrackPreviewPlayerProps = {
  track: PreviewMedia;
  compact?: boolean;
};

function TrackPreviewPlayerComponent({ track, compact }: TrackPreviewPlayerProps) {
  const { activeTrack, isPlaying, isLoading, toggle } = usePreviewAudio();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scopeRef = useRef<{ revert: () => void } | null>(null);
  const isActive = activeTrack?.id === track.id;
  const showLoading = isActive && isLoading;
  const available = Boolean(track.previewUrl);

  useEffect(() => {
    if (!rootRef.current) return;
    scopeRef.current = createScope({ root: rootRef.current }).add(() => {
      // Scope keeps anime.js instances tied to this control's lifetime.
    });
    return () => {
      scopeRef.current?.revert();
      scopeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isActive || !rootRef.current) return;
    animate(rootRef.current, {
      scale: [1, 1.06, 1],
      duration: 320,
      ease: "outQuad",
    });
  }, [isActive, isPlaying]);

  if (!available) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-zinc-500",
          compact ? "text-xs" : "text-sm",
        )}
        title="Preview unavailable"
        aria-label="Preview unavailable"
      >
        <Lock className="h-3.5 w-3.5" />
        {!compact ? (
          <span className="sr-only sm:not-sr-only">Unavailable</span>
        ) : null}
      </span>
    );
  }

  return (
    <div ref={rootRef} className="inline-flex">
      <Button
        type="button"
        size={compact ? "icon" : "sm"}
        variant={isActive ? "default" : "secondary"}
        className={cn(
          "shrink-0",
          isActive && "shadow-[0_0_20px_rgba(118,242,179,0.25)]",
        )}
        onClick={() =>
          toggle({
            ...track,
            previewUrl: track.previewUrl,
          })
        }
        aria-label={
          isActive && isPlaying
            ? `Pause ${track.title}`
            : `Play preview of ${track.title}`
        }
      >
        {showLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isActive && isPlaying ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="h-3.5 w-3.5" />
        )}
        {!compact ? (
          <span>{isActive && isPlaying ? "Pause" : "Play"}</span>
        ) : null}
      </Button>
    </div>
  );
}

export const TrackPreviewPlayer = memo(TrackPreviewPlayerComponent);
