import type {
  SpotifyAlbumResult,
  SpotifyArtistResult,
  SpotifyTrackResult,
} from "@/lib/integrations/music-types";

const SPOTIFY_API_BASE_URL = "https://api.spotify.com";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

type SpotifyImage = {
  url: string;
};

type SpotifyExternalUrls = {
  spotify?: string;
};

type SpotifyAlbum = {
  id: string;
  name: string;
  release_date?: string;
  images?: SpotifyImage[];
  artists?: Array<{ name: string }>;
  external_urls?: SpotifyExternalUrls;
};

type SpotifyArtist = {
  id: string;
  name: string;
  genres?: string[];
  images?: SpotifyImage[];
  external_urls?: SpotifyExternalUrls;
};

type SpotifyTrack = {
  id: string;
  name: string;
  preview_url?: string | null;
  duration_ms?: number;
  album?: SpotifyAlbum;
  artists?: Array<{ name: string }>;
  external_urls?: SpotifyExternalUrls;
};

type SpotifySearchResponse = {
  albums?: { items?: SpotifyAlbum[] };
  artists?: { items?: SpotifyArtist[] };
  tracks?: { items?: SpotifyTrack[] };
};

function getSpotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

async function getSpotifyAccessToken() {
  const credentials = getSpotifyCredentials();

  if (!credentials) {
    throw new Error("Spotify credentials are missing.");
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken;
  }

  const encodedCredentials = Buffer.from(
    `${credentials.clientId}:${credentials.clientSecret}`,
  ).toString("base64");

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

function bestImage(images?: SpotifyImage[]) {
  return images?.[0]?.url;
}

function artistNames(artists?: Array<{ name: string }>) {
  return (
    artists
      ?.map((artist) => artist.name)
      .filter(Boolean)
      .join(", ") || "Unknown artist"
  );
}

export async function searchSpotify(
  query: string,
  options: { offset?: number; limit?: number } = {},
) {
  const accessToken = await getSpotifyAccessToken();
  const url = new URL("/v1/search", SPOTIFY_API_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("type", "album,artist,track");
  url.searchParams.set("limit", String(options.limit ?? 8));
  url.searchParams.set("offset", String(options.offset ?? 0));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Spotify search failed with ${response.status}.`);
  }

  const payload = (await response.json()) as SpotifySearchResponse;

  const albums: SpotifyAlbumResult[] = (payload.albums?.items ?? []).map(
    (album) => ({
      id: album.id,
      source: "spotify",
      title: album.name,
      artist: artistNames(album.artists),
      releaseDate: album.release_date,
      imageUrl: bestImage(album.images),
      externalUrl: album.external_urls?.spotify,
    }),
  );

  const artists: SpotifyArtistResult[] = (payload.artists?.items ?? []).map(
    (artist) => ({
      id: artist.id,
      source: "spotify",
      name: artist.name,
      genres: artist.genres ?? [],
      imageUrl: bestImage(artist.images),
      externalUrl: artist.external_urls?.spotify,
    }),
  );

  const tracks: SpotifyTrackResult[] = (payload.tracks?.items ?? []).map(
    (track) => ({
      id: track.id,
      source: "spotify",
      title: track.name,
      artist: artistNames(track.artists),
      album: track.album?.name,
      previewUrl: track.preview_url ?? undefined,
      imageUrl: bestImage(track.album?.images),
      externalUrl: track.external_urls?.spotify,
    }),
  );

  return { albums, artists, tracks };
}

export async function getSpotifyAlbumTracks(spotifyAlbumId: string) {
  const accessToken = await getSpotifyAccessToken();
  const url = new URL(`/v1/albums/${spotifyAlbumId}/tracks`, SPOTIFY_API_BASE_URL);
  url.searchParams.set("limit", "50");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Spotify album tracks failed with ${response.status}.`);
  }

  const payload = (await response.json()) as {
    items?: SpotifyTrack[];
  };

  return (payload.items ?? []).map((track, index) => ({
    id: track.id,
    position: index + 1,
    title: track.name,
    artist: artistNames(track.artists),
    previewUrl: track.preview_url ?? undefined,
    duration:
      typeof track.duration_ms === "number"
        ? Math.round(track.duration_ms / 1000)
        : undefined,
  }));
}
