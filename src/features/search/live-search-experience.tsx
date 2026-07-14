"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Disc3,
  ExternalLink,
  Loader2,
  Mic2,
  Music2,
  Radio,
  Search,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  MusicSearchResponse,
  SpotifyAlbumResult,
  SpotifyArtistResult,
  SpotifyTrackResult,
  VinylReleaseSearchResult,
} from "@/lib/integrations/music-types";
import { cn } from "@/lib/utils";

type SearchType = MusicSearchResponse["type"];

const typeOptions: Array<{ label: string; value: SearchType }> = [
  { label: "All", value: "all" },
  { label: "Vinyl", value: "vinyl" },
  { label: "Albums", value: "album" },
  { label: "Artists", value: "artist" },
  { label: "Tracks", value: "track" },
];

async function fetchSearchResults(query: string, type: SearchType) {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&type=${type}`,
  );

  if (!response.ok) {
    throw new Error("Search failed. Try again in a moment.");
  }

  return (await response.json()) as MusicSearchResponse;
}

function resultCount(data?: MusicSearchResponse) {
  if (!data) {
    return 0;
  }

  return (
    data.results.vinylReleases.length +
    data.results.albums.length +
    data.results.artists.length +
    data.results.tracks.length
  );
}

function NeonArtwork({
  imageUrl,
  title,
  tone = "emerald",
}: {
  imageUrl?: string;
  title: string;
  tone?: "emerald" | "cyan" | "coral" | "amber";
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
      {imageUrl ? (
        <div
          aria-label={title}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="record-grooves absolute inset-0" />
      )}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-45",
          tone === "emerald" && "from-emerald/30 via-transparent to-cyan/20",
          tone === "cyan" && "from-cyan/35 via-transparent to-emerald/15",
          tone === "coral" && "from-coral/35 via-transparent to-amber/20",
          tone === "amber" && "from-amber/35 via-transparent to-coral/20",
        )}
      />
      <div className="record-grooves absolute bottom-2 right-2 h-12 w-12 rounded-full border border-white/20 shadow-[0_0_30px_rgba(118,242,179,0.25)]" />
    </div>
  );
}

function SourceLink({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-emerald transition hover:text-white"
    >
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function VinylCard({ release }: { release: VinylReleaseSearchResult }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-lg border border-emerald/15 bg-black/35 p-3 shadow-[0_0_40px_rgba(118,242,179,0.06)] transition hover:border-emerald/40 hover:bg-emerald/[0.055]"
    >
      <NeonArtwork imageUrl={release.imageUrl} title={release.title} />
      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">
              {release.title}
            </h3>
            <p className="truncate text-xs text-zinc-400">{release.artist}</p>
          </div>
          <Badge className="border-emerald/20 bg-emerald/10 text-emerald">
            Discogs
          </Badge>
        </div>
        <div className="grid gap-1 text-xs text-zinc-400">
          <span>{[release.year, release.country].filter(Boolean).join(" / ")}</span>
          <span className="truncate">{release.label ?? "Label unknown"}</span>
          <span className="truncate">
            {[release.format, release.catalogNumber].filter(Boolean).join(" / ")}
          </span>
        </div>
        <SourceLink href={release.externalUrl}>Open release</SourceLink>
      </div>
    </motion.article>
  );
}

function AlbumCard({ album }: { album: SpotifyAlbumResult }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-cyan/15 bg-black/35 p-3 transition hover:border-cyan/40 hover:bg-cyan/[0.055]"
    >
      <NeonArtwork imageUrl={album.imageUrl} title={album.title} tone="cyan" />
      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">
              {album.title}
            </h3>
            <p className="truncate text-xs text-zinc-400">{album.artist}</p>
          </div>
          <Badge className="border-cyan/20 bg-cyan/10 text-cyan">Spotify</Badge>
        </div>
        <p className="text-xs text-zinc-400">
          {album.releaseDate ?? "Release date unknown"}
        </p>
        <SourceLink href={album.externalUrl}>Open album</SourceLink>
      </div>
    </motion.article>
  );
}

function ArtistCard({ artist }: { artist: SpotifyArtistResult }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-coral/15 bg-black/35 p-3 transition hover:border-coral/40 hover:bg-coral/[0.055]"
    >
      <NeonArtwork imageUrl={artist.imageUrl} title={artist.name} tone="coral" />
      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate text-sm font-semibold text-white">
            {artist.name}
          </h3>
          <Badge className="border-coral/20 bg-coral/10 text-coral">Artist</Badge>
        </div>
        <p className="line-clamp-2 min-h-8 text-xs leading-4 text-zinc-400">
          {artist.genres.length
            ? artist.genres.slice(0, 4).join(", ")
            : "Genres updating"}
        </p>
        <SourceLink href={artist.externalUrl}>Open artist</SourceLink>
      </div>
    </motion.article>
  );
}

function TrackCard({ track }: { track: SpotifyTrackResult }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-amber/15 bg-black/35 p-3 transition hover:border-amber/40 hover:bg-amber/[0.055]"
    >
      <div className="flex gap-3">
        <div className="h-20 w-20 shrink-0">
          <NeonArtwork imageUrl={track.imageUrl} title={track.title} tone="amber" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-white">
                {track.title}
              </h3>
              <p className="truncate text-xs text-zinc-400">{track.artist}</p>
            </div>
            <Music2 className="h-4 w-4 text-amber" />
          </div>
          <p className="truncate text-xs text-zinc-500">{track.album}</p>
          <SourceLink href={track.externalUrl}>Open track</SourceLink>
        </div>
      </div>
    </motion.article>
  );
}

function Section({
  title,
  icon,
  children,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  empty: boolean;
}) {
  if (empty) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-300">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function LiveSearchExperience({
  initialQuery = "",
  defaultType = "all",
  compact = false,
}: {
  initialQuery?: string;
  defaultType?: SearchType;
  compact?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [type, setType] = useState<SearchType>(defaultType);

  const enabled = submittedQuery.trim().length > 1;
  const searchQuery = useQuery({
    queryKey: ["music-search", submittedQuery, type],
    queryFn: () => fetchSearchResults(submittedQuery, type),
    enabled,
  });

  const totalResults = useMemo(
    () => resultCount(searchQuery.data),
    [searchQuery.data],
  );

  return (
    <Card className="overflow-hidden border-fuchsia-400/10 bg-black/45 shadow-[0_0_80px_rgba(34,211,238,0.08)]">
      <CardHeader className="border-b border-white/10 bg-white/[0.025]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-cyan" />
              Live music and vinyl search
            </CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Discogs powers physical vinyl discovery while Spotify adds album,
              artist, and track context.
            </p>
          </div>
          <div className="equalizer-bars hidden items-end gap-1 lg:flex" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <form
          className="flex flex-col gap-3 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedQuery(query.trim());
          }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-cyan/20 bg-white/[0.055] px-3 py-2 shadow-[0_0_38px_rgba(139,216,255,0.08)]">
            <Search className="h-4 w-4 shrink-0 text-cyan" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Radiohead vinyl, Kendrick Lamar, Thriller..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </div>
          <Button type="submit">
            <Radio className="h-4 w-4" />
            Search
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setType(option.value)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition",
                type === option.value
                  ? "border-emerald/40 bg-emerald/15 text-emerald shadow-[0_0_24px_rgba(118,242,179,0.16)]"
                  : "border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white",
              )}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        {searchQuery.isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm text-zinc-300">
            <Loader2 className="h-4 w-4 animate-spin text-emerald" />
            Searching live music databases...
          </div>
        )}

        {searchQuery.isError && (
          <div className="flex items-center gap-2 rounded-lg border border-coral/25 bg-coral/10 p-4 text-sm text-coral">
            <AlertCircle className="h-4 w-4" />
            Search failed. Check your API keys or try another query.
          </div>
        )}

        {searchQuery.data && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <Badge className="border-emerald/20 bg-emerald/10 text-emerald">
                {totalResults} results
              </Badge>
              {!searchQuery.data.sources.discogs.available &&
                searchQuery.data.sources.discogs.error && (
                  <Badge className="border-coral/20 bg-coral/10 text-coral">
                    {searchQuery.data.sources.discogs.error}
                  </Badge>
                )}
              {!searchQuery.data.sources.spotify.available &&
                searchQuery.data.sources.spotify.error && (
                  <Badge className="border-coral/20 bg-coral/10 text-coral">
                    {searchQuery.data.sources.spotify.error}
                  </Badge>
                )}
            </div>

            {enabled && totalResults === 0 && !searchQuery.isLoading && (
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5 text-sm text-zinc-400">
                No matches yet. Try a broader artist, album, or genre search.
              </div>
            )}

            <Section
              title="Vinyl releases"
              icon={<Disc3 className="h-4 w-4 text-emerald" />}
              empty={searchQuery.data.results.vinylReleases.length === 0}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {searchQuery.data.results.vinylReleases
                  .slice(0, compact ? 6 : 9)
                  .map((release) => (
                    <VinylCard key={release.id} release={release} />
                  ))}
              </div>
            </Section>

            <Section
              title="Albums"
              icon={<Radio className="h-4 w-4 text-cyan" />}
              empty={searchQuery.data.results.albums.length === 0}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {searchQuery.data.results.albums
                  .slice(0, compact ? 4 : 8)
                  .map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
              </div>
            </Section>

            <Section
              title="Artists"
              icon={<Mic2 className="h-4 w-4 text-coral" />}
              empty={searchQuery.data.results.artists.length === 0}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {searchQuery.data.results.artists
                  .slice(0, compact ? 4 : 8)
                  .map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
              </div>
            </Section>

            <Section
              title="Tracks"
              icon={<Music2 className="h-4 w-4 text-amber" />}
              empty={searchQuery.data.results.tracks.length === 0}
            >
              <div className="grid gap-4 xl:grid-cols-2">
                {searchQuery.data.results.tracks
                  .slice(0, compact ? 4 : 8)
                  .map((track) => (
                    <TrackCard key={track.id} track={track} />
                  ))}
              </div>
            </Section>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
