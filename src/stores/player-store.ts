"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PreviewTrack = {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  previewUrl?: string;
};

type PlayerState = {
  activeTrack: PreviewTrack | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  playTrack: (track: PreviewTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  seek: (progress: number) => void;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      activeTrack: null,
      isPlaying: false,
      volume: 0.8,
      progress: 0,
      duration: 0,
      playTrack: (track) =>
        set({
          activeTrack: track,
          isPlaying: true,
          progress: 0,
          duration: 0,
        }),
      pause: () => set({ isPlaying: false }),
      resume: () => set({ isPlaying: true }),
      stop: () =>
        set({
          activeTrack: null,
          isPlaying: false,
          progress: 0,
          duration: 0,
        }),
      setVolume: (volume) => set({ volume }),
      setProgress: (progress) => set({ progress }),
      setDuration: (duration) => set({ duration }),
      seek: (progress) => set({ progress }),
    }),
    {
      name: "vinylhub-player",
      partialize: (state) => ({ volume: state.volume }),
    },
  ),
);
