import type { VinylReleaseSearchResult } from "@/lib/integrations/music-types";

const DISCOGS_BASE_URL = "https://api.discogs.com";

type DiscogsSearchItem = {
  id: number;
  title?: string;
  year?: string;
  label?: string[];
  country?: string;
  format?: string[];
  catno?: string;
  thumb?: string;
  cover_image?: string;
  uri?: string;
  genre?: string[];
  style?: string[];
};

type DiscogsSearchResponse = {
  results?: DiscogsSearchItem[];
  pagination?: {
    page?: number;
    pages?: number;
  };
};

type DiscogsTracklistItem = {
  position?: string;
  type_?: string;
  title?: string;
  duration?: string;
  sub_tracks?: DiscogsTracklistItem[];
};

type DiscogsReleaseResponse = {
  id: number;
  title?: string;
  artists_sort?: string;
  year?: number;
  country?: string;
  labels?: Array<{ name?: string; catno?: string }>;
  genres?: string[];
  styles?: string[];
  formats?: Array<{ name?: string; descriptions?: string[] }>;
  images?: Array<{ uri?: string; resource_url?: string }>;
  lowest_price?: number;
  uri?: string;
  tracklist?: DiscogsTracklistItem[];
};

export type DiscogsTrackResult = {
  position: number;
  title: string;
  duration?: number;
};

function getDiscogsToken() {
  const token = process.env.DISCOGS_USER_TOKEN?.trim();

  if (!token || token === "your_generated_token_here") {
    return null;
  }

  return token;
}

function splitDiscogsTitle(title?: string) {
  if (!title) {
    return { artist: "Unknown artist", title: "Untitled release" };
  }

  const [artist, ...releaseParts] = title.split(" - ");

  if (releaseParts.length === 0) {
    return { artist: "Various artists", title };
  }

  return {
    artist: artist.trim(),
    title: releaseParts.join(" - ").trim(),
  };
}

function discogsHeaders(token: string) {
  return {
    Authorization: `Discogs token=${token}`,
    "User-Agent": process.env.MUSICBRAINZ_USER_AGENT ?? "VinylHub/0.1.0",
  };
}

function parseDiscogsDuration(duration?: string): number | undefined {
  if (!duration?.trim()) {
    return undefined;
  }

  const parts = duration.split(":").map((part) => Number.parseInt(part, 10));

  if (parts.some((part) => !Number.isFinite(part))) {
    return undefined;
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return undefined;
}

function flattenDiscogsTracklist(
  items: DiscogsTracklistItem[],
): DiscogsTrackResult[] {
  const tracks: DiscogsTrackResult[] = [];

  function processItem(item: DiscogsTracklistItem) {
    const type = item.type_?.toLowerCase();

    if (type === "heading" || type === "index") {
      for (const subTrack of item.sub_tracks ?? []) {
        processItem(subTrack);
      }
      return;
    }

    if (type === "track" && item.sub_tracks?.length) {
      for (const subTrack of item.sub_tracks) {
        processItem(subTrack);
      }
      return;
    }

    const title = item.title?.trim();
    const isTrack = !type || type === "track";

    if (isTrack && title) {
      tracks.push({
        position: tracks.length + 1,
        title,
        duration: parseDiscogsDuration(item.duration),
      });
    }
  }

  for (const item of items) {
    processItem(item);
  }

  return tracks;
}

async function fetchDiscogsReleasePayload(
  releaseId: string,
): Promise<DiscogsReleaseResponse> {
  const token = getDiscogsToken();

  if (!token) {
    throw new Error("Discogs token is missing.");
  }

  const response = await fetch(`${DISCOGS_BASE_URL}/releases/${releaseId}`, {
    headers: discogsHeaders(token),
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(`Discogs release lookup failed with ${response.status}.`);
  }

  return (await response.json()) as DiscogsReleaseResponse;
}

export async function searchDiscogsVinyl(
  query: string,
  options: { page?: number; type?: "release" | "label" } = {},
): Promise<VinylReleaseSearchResult[]> {
  const token = getDiscogsToken();

  if (!token) {
    throw new Error("Discogs token is missing.");
  }

  const url = new URL("/database/search", DISCOGS_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("type", options.type ?? "release");
  if (options.type !== "label") {
    url.searchParams.set("format", "vinyl");
  }
  url.searchParams.set("per_page", "9");
  url.searchParams.set("page", String(options.page ?? 1));

  const response = await fetch(url, {
    headers: discogsHeaders(token),
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Discogs search failed with ${response.status}.`);
  }

  const payload = (await response.json()) as DiscogsSearchResponse;

  return (payload.results ?? []).map((item) => {
    const parsedTitle = splitDiscogsTitle(item.title);

    return {
      id: String(item.id),
      source: "discogs",
      title: parsedTitle.title,
      artist: parsedTitle.artist,
      year: item.year,
      label: item.label?.filter(Boolean).join(", "),
      country: item.country,
      format: item.format?.filter(Boolean).join(", ") ?? "Vinyl",
      catalogNumber: item.catno,
      imageUrl: item.cover_image || item.thumb,
      externalUrl: item.uri ? `https://www.discogs.com${item.uri}` : undefined,
      genres: item.genre ?? [],
      styles: item.style ?? [],
    };
  });
}

export async function getDiscogsReleaseTracks(
  releaseId: string,
): Promise<DiscogsTrackResult[]> {
  const release = await fetchDiscogsReleasePayload(releaseId);
  return flattenDiscogsTracklist(release.tracklist ?? []);
}

export async function getDiscogsRelease(
  releaseId: string,
): Promise<VinylReleaseSearchResult> {
  const release = await fetchDiscogsReleasePayload(releaseId);

  return {
    id: String(release.id),
    source: "discogs",
    title: release.title ?? "Untitled release",
    artist: release.artists_sort ?? "Unknown artist",
    year: release.year ? String(release.year) : undefined,
    country: release.country,
    label: release.labels?.map((label) => label.name).filter(Boolean).join(", "),
    catalogNumber: release.labels
      ?.map((label) => label.catno)
      .filter(Boolean)
      .join(", "),
    format: release.formats
      ?.map((format) =>
        [format.name, ...(format.descriptions ?? [])].filter(Boolean).join(" "),
      )
      .filter(Boolean)
      .join(", "),
    genres: release.genres ?? [],
    styles: release.styles ?? [],
    marketValueCents:
      typeof release.lowest_price === "number"
        ? Math.round(release.lowest_price * 100)
        : undefined,
    imageUrl: release.images?.[0]?.uri ?? release.images?.[0]?.resource_url,
    externalUrl: release.uri
      ? `https://www.discogs.com${release.uri}`
      : `https://www.discogs.com/release/${release.id}`,
  };
}
