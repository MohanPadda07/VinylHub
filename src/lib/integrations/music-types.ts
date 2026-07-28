export type SearchSourceState = {
  available: boolean;
  error?: string;
};

export type VinylReleaseSearchResult = {
  id: string;
  source: "discogs";
  slug?: string;
  title: string;
  artist: string;
  year?: string;
  label?: string;
  country?: string;
  format?: string;
  catalogNumber?: string;
  imageUrl?: string;
  externalUrl?: string;
  genres?: string[];
  styles?: string[];
  marketValueCents?: number;
  lowValueCents?: number;
  highValueCents?: number;
};

export type SpotifyAlbumResult = {
  id: string;
  source: "spotify";
  slug?: string;
  title: string;
  artist: string;
  releaseDate?: string;
  imageUrl?: string;
  externalUrl?: string;
};

export type SpotifyArtistResult = {
  id: string;
  source: "spotify";
  slug?: string;
  name: string;
  genres: string[];
  imageUrl?: string;
  externalUrl?: string;
};

export type SpotifyTrackResult = {
  id: string;
  source: "spotify";
  title: string;
  artist: string;
  album?: string;
  previewUrl?: string;
  imageUrl?: string;
  externalUrl?: string;
};

export type LabelSearchResult = {
  id: string;
  source: "discogs";
  name: string;
  imageUrl?: string;
  externalUrl?: string;
};

export type MusicSearchResult =
  | VinylReleaseSearchResult
  | SpotifyAlbumResult
  | SpotifyArtistResult
  | SpotifyTrackResult
  | LabelSearchResult;

export type MusicSearchResponse = {
  query: string;
  type: "all" | "vinyl" | "album" | "artist" | "track" | "label";
  nextCursor?: string;
  results: {
    vinylReleases: VinylReleaseSearchResult[];
    albums: SpotifyAlbumResult[];
    artists: SpotifyArtistResult[];
    tracks: SpotifyTrackResult[];
    labels: LabelSearchResult[];
  };
  sources: {
    discogs: SearchSourceState;
    spotify: SearchSourceState;
  };
};
