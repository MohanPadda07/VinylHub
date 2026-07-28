export type DeezerPreview = {
  previewUrl: string;
  deezerTrackId: string;
  albumCover?: string;
  duration: number;
  title: string;
  artist: string;
};

export type NormalizedTrack = {
  id: string;
  position: number;
  title: string;
  duration: number | null;
  previewUrl: string | null;
  spotifyUrl: string | null;
  deezerId: string | null;
  albumCover?: string | null;
};

export type VinylReleaseSummary = {
  id: string;
  title: string;
  discogsId: string | null;
  country: string | null;
  format: string;
  catalogNumber: string | null;
  releaseYear: number | null;
  marketValueCents: number | null;
  labelName: string | null;
};

export type NormalizedAlbum = {
  album: {
    id: string;
    slug: string;
    title: string;
    discogsId: string | null;
    spotifyId: string | null;
  };
  artist: {
    id: string;
    slug: string;
    name: string;
  };
  artwork: string | null;
  tracks: NormalizedTrack[];
  vinylReleases: VinylReleaseSummary[];
  genres: string[];
  year: number | null;
  sources: {
    discogs: boolean;
    musicbrainz: boolean;
    spotify: boolean;
    deezer: boolean;
  };
};

export type MusicServiceAlbumLookup = {
  /** VinylHub album slug or cuid */
  id: string;
  /** When true, skip Deezer enrichment (faster, cache-friendly) */
  skipPreviews?: boolean;
};

export type MusicBrainzReleaseGroup = {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  genres: string[];
};

export type SpotifyAlbumTrack = {
  id: string;
  position: number;
  title: string;
  artist: string;
  previewUrl?: string;
  duration?: number;
  spotifyUrl?: string;
};

export type DiscogsAlbumTrack = {
  position: number;
  title: string;
  duration?: number;
};
