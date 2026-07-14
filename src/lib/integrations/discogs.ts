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
};

type DiscogsSearchResponse = {
  results?: DiscogsSearchItem[];
};

type DiscogsReleaseResponse = {
  id: number;
  title?: string;
  artists_sort?: string;
  year?: number;
  country?: string;
  labels?: Array<{ name?: string; catno?: string }>;
  formats?: Array<{ name?: string; descriptions?: string[] }>;
  images?: Array<{ uri?: string; resource_url?: string }>;
  uri?: string;
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

export async function searchDiscogsVinyl(
  query: string,
): Promise<VinylReleaseSearchResult[]> {
  const token = getDiscogsToken();

  if (!token) {
    throw new Error("Discogs token is missing.");
  }

  const url = new URL("/database/search", DISCOGS_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("type", "release");
  url.searchParams.set("format", "vinyl");
  url.searchParams.set("per_page", "9");

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
    };
  });
}

export async function getDiscogsRelease(
  releaseId: string,
): Promise<VinylReleaseSearchResult> {
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

  const release = (await response.json()) as DiscogsReleaseResponse;

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
    imageUrl: release.images?.[0]?.uri ?? release.images?.[0]?.resource_url,
    externalUrl: release.uri
      ? `https://www.discogs.com${release.uri}`
      : `https://www.discogs.com/release/${release.id}`,
  };
}
