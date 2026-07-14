export type SearchSourceState = {
  available: boolean;
  error?: string;
};

export type VinylReleaseSearchResult = {
  id: string;
  source: "discogs";
  title: string;
  artist: string;
  year?: string;
  label?: string;
  country?: string;
  format?: string;
  catalogNumber?: string;
  imageUrl?: string;
  externalUrl?: string;
};

export type SpotifyAlbumResult = {
  id: string;
  source: "spotify";
  title: string;
  artist: string;
  releaseDate?: string;
  imageUrl?: string;
  externalUrl?: string;
};

export type SpotifyArtistResult = {
  id: string;
  source: "spotify";
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

export type MusicSearchResult =
  | VinylReleaseSearchResult
  | SpotifyAlbumResult
  | SpotifyArtistResult
  | SpotifyTrackResult;

export type MusicSearchResponse = {
  query: string;
  type: "all" | "vinyl" | "album" | "artist" | "track";
  results: {
    vinylReleases: VinylReleaseSearchResult[];
    albums: SpotifyAlbumResult[];
    artists: SpotifyArtistResult[];
    tracks: SpotifyTrackResult[];
  };
  sources: {
    discogs: SearchSourceState;
    spotify: SearchSourceState;
  };
};
