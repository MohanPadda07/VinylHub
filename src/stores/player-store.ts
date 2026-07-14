import { create } from "zustand";

type PlayerState = {
  activeAlbum: string;
  setActiveAlbum: (album: string) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  activeAlbum: "Kind of Blue",
  setActiveAlbum: (album) => set({ activeAlbum: album }),
}));
