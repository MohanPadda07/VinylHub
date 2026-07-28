"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type PreviewMedia = {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
  artworkUrl?: string | null;
  spotifyUrl?: string | null;
  deezerId?: string | null;
  albumTitle?: string | null;
};

type PreviewAudioContextValue = {
  activeTrack: PreviewMedia | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  volume: number;
  recentlyPlayed: PreviewMedia[];
  play: (track: PreviewMedia) => void;
  pause: () => void;
  resume: () => void;
  toggle: (track?: PreviewMedia) => void;
  stop: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
};

const PreviewAudioContext = createContext<PreviewAudioContextValue | null>(null);

const RECENT_KEY = "vinylhub-recent-previews";
const VOLUME_KEY = "vinylhub-preview-volume";
const CROSSFADE_MS = 180;

function loadRecent(): PreviewMedia[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PreviewMedia[];
    return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
  } catch {
    return [];
  }
}

function loadVolume() {
  if (typeof window === "undefined") return 0.85;
  const raw = window.localStorage.getItem(VOLUME_KEY);
  const value = raw ? Number(raw) : 0.85;
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.85;
}

export function PreviewAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [activeTrack, setActiveTrack] = useState<PreviewMedia | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolumeState] = useState(0.85);
  const [recentlyPlayed, setRecentlyPlayed] = useState<PreviewMedia[]>([]);

  useEffect(() => {
    setVolumeState(loadVolume());
    setRecentlyPlayed(loadRecent());
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const onLoaded = () => {
      setDuration(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 30);
      setIsLoading(false);
    };
    const onTime = () => setProgress(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("error", onError);

    return () => {
      if (fadeRef.current) window.clearInterval(fadeRef.current);
      audio.pause();
      audio.removeAttribute("src");
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VOLUME_KEY, String(volume));
    }
  }, [volume]);

  const remember = useCallback((track: PreviewMedia) => {
    setRecentlyPlayed((prev) => {
      const next = [track, ...prev.filter((item) => item.id !== track.id)].slice(0, 12);
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const crossfadeTo = useCallback(
    async (track: PreviewMedia) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (fadeRef.current) {
        window.clearInterval(fadeRef.current);
        fadeRef.current = null;
      }

      // Fade out current preview before swapping source.
      if (!audio.paused && audio.src) {
        const startVolume = audio.volume;
        const steps = 6;
        let step = 0;
        await new Promise<void>((resolve) => {
          fadeRef.current = window.setInterval(() => {
            step += 1;
            audio.volume = Math.max(0, startVolume * (1 - step / steps));
            if (step >= steps) {
              if (fadeRef.current) window.clearInterval(fadeRef.current);
              fadeRef.current = null;
              resolve();
            }
          }, CROSSFADE_MS / steps);
        });
        audio.pause();
      }

      setIsLoading(true);
      setProgress(0);
      setDuration(30);
      setActiveTrack(track);
      remember(track);

      audio.src = track.previewUrl;
      audio.load();
      audio.volume = volume;
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
        setIsLoading(false);
      }
    },
    [remember, volume],
  );

  const play = useCallback(
    (track: PreviewMedia) => {
      if (!track.previewUrl) return;
      void crossfadeTo(track);
    },
    [crossfadeTo],
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [activeTrack]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setActiveTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(30);
    setIsLoading(false);
  }, []);

  const toggle = useCallback(
    (track?: PreviewMedia) => {
      if (track && track.id !== activeTrack?.id) {
        play(track);
        return;
      }
      if (isPlaying) pause();
      else resume();
    },
    [activeTrack?.id, isPlaying, pause, play, resume],
  );

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 30));
    setProgress(audio.currentTime);
  }, []);

  const setVolume = useCallback((next: number) => {
    setVolumeState(Math.min(1, Math.max(0, next)));
  }, []);

  // Spacebar play/pause when not typing in an input.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.key !== " ") return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
      if (!activeTrack) return;
      event.preventDefault();
      toggle();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeTrack, toggle]);

  const value = useMemo<PreviewAudioContextValue>(
    () => ({
      activeTrack,
      isPlaying,
      isLoading,
      progress,
      duration,
      volume,
      recentlyPlayed,
      play,
      pause,
      resume,
      toggle,
      stop,
      seek,
      setVolume,
    }),
    [
      activeTrack,
      duration,
      isLoading,
      isPlaying,
      pause,
      play,
      progress,
      recentlyPlayed,
      resume,
      seek,
      setVolume,
      stop,
      toggle,
      volume,
    ],
  );

  return (
    <PreviewAudioContext.Provider value={value}>{children}</PreviewAudioContext.Provider>
  );
}

export function usePreviewAudio() {
  const context = useContext(PreviewAudioContext);
  if (!context) {
    throw new Error("usePreviewAudio must be used within PreviewAudioProvider");
  }
  return context;
}
