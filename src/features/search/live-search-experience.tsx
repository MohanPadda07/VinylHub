"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
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
  Tag,
} from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollectionActionButtons } from "@/features/search/collection-action-buttons";
import { MusicPreviewPlayer } from "@/features/search/music-preview-player";
import { useCatalogNavigate } from "@/hooks/use-catalog-navigate";
import type {
  LabelSearchResult,
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
  { label: "Labels", value: "label" },
];

async function fetchSearchResults(query: string, type: SearchType, cursor = "1") {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&type=${type}&cursor=${cursor}`,
  );

  if (!response.ok) {
    throw new Error("Search failed. Try again in a moment.");
  }

  return (await response.json()) as MusicSearchResponse;
}

const RECENT_KEY = "vinylhub-recent-searches";
const TRENDING = ["Radiohead", "Daft Punk vinyl", "Kendrick Lamar", "Fleetwood Mac"];

function saveRecentSearch(q: string) {
  try {
    const recent = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...recent.filter((r) => r !== q)].slice(0, 8)));
  } catch { /* ignore */ }
}

function resultCount(data?: MusicSearchResponse) {
  if (!data) {
    return 0;
  }

  return (
    data.results.vinylReleases.length +
    data.results.albums.length +
    data.results.artists.length +
    data.results.tracks.length +
    (data.results.labels?.length ?? 0)
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

function LabelCard({ label }: { label: LabelSearchResult }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-cyan/25 bg-cyan/[0.05] p-3 shadow-[0_0_24px_rgba(0,242,255,0.08)] transition hover:border-cyan/50"
    >
      <div className="flex items-center gap-3">
        <NeonArtwork imageUrl={label.imageUrl} title={label.name} tone="cyan" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">{label.name}</h3>
          <Badge className="mt-1 border-cyan/20 bg-cyan/10 text-cyan">Label</Badge>
        </div>
      </div>
      <div className="mt-2">
        <SourceLink href={label.externalUrl}>Discogs</SourceLink>
      </div>
    </motion.article>
  );
}

function VinylCard({ release }: { release: VinylReleaseSearchResult }) {
  const { navigate, isResolving } = useCatalogNavigate();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-emerald/25 bg-emerald/[0.05] p-3 shadow-[0_0_28px_rgba(0,242,255,0.06)] transition hover:border-emerald/50 hover:bg-emerald/[0.1]"
    >
      <button
        type="button"
        onClick={() => navigate({ type: "vinyl", data: release })}
        disabled={isResolving}
        className="w-full text-left"
      >
        <NeonArtwork imageUrl={release.imageUrl} title={release.title} />
        <div className="mt-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-white transition group-hover:text-emerald">
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
          </div>
        </div>
      </button>
      <div className="mt-2 flex items-center justify-between">
        <SourceLink href={release.externalUrl}>Discogs</SourceLink>
        {isResolving && <Loader2 className="h-3 w-3 animate-spin text-emerald" />}
      </div>
      <CollectionActionButtons releaseId={release.id} />
    </motion.article>
  );
}

function AlbumCard({ album }: { album: SpotifyAlbumResult }) {
  const { navigate, isResolving } = useCatalogNavigate();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-cyan/25 bg-cyan/[0.05] p-3 shadow-[0_0_28px_rgba(94,239,255,0.08)] transition hover:border-cyan/50 hover:bg-cyan/[0.1]"
    >
      <button
        type="button"
        onClick={() => navigate({ type: "album", data: album })}
        disabled={isResolving}
        className="w-full text-left"
      >
        <NeonArtwork imageUrl={album.imageUrl} title={album.title} tone="cyan" />
        <div className="mt-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-white transition group-hover:text-cyan">
                {album.title}
              </h3>
              <p className="truncate text-xs text-zinc-400">{album.artist}</p>
            </div>
            <Badge className="border-cyan/20 bg-cyan/10 text-cyan">Spotify</Badge>
          </div>
          <p className="text-xs text-zinc-400">
            {album.releaseDate ?? "Release date unknown"}
          </p>
        </div>
      </button>
      <div className="mt-2 flex items-center justify-between">
        <SourceLink href={album.externalUrl}>Spotify</SourceLink>
        {isResolving && <Loader2 className="h-3 w-3 animate-spin text-cyan" />}
      </div>
    </motion.article>
  );
}

function ArtistCard({ artist }: { artist: SpotifyArtistResult }) {
  const { navigate, isResolving } = useCatalogNavigate();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-coral/30 bg-coral/[0.06] p-3 shadow-[0_0_28px_rgba(255,140,105,0.1)] transition hover:border-coral/55 hover:bg-coral/[0.12]"
    >
      <button
        type="button"
        onClick={() => navigate({ type: "artist", data: artist })}
        disabled={isResolving}
        className="w-full text-left"
      >
        <NeonArtwork imageUrl={artist.imageUrl} title={artist.name} tone="coral" />
        <div className="mt-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-sm font-semibold text-white transition group-hover:text-coral">
              {artist.name}
            </h3>
            <Badge className="border-coral/20 bg-coral/10 text-coral">Artist</Badge>
          </div>
          <p className="line-clamp-2 min-h-8 text-xs leading-4 text-zinc-400">
            {artist.genres.length
              ? artist.genres.slice(0, 4).join(", ")
              : "Genres updating"}
          </p>
        </div>
      </button>
      <div className="mt-2 flex items-center justify-between">
        <SourceLink href={artist.externalUrl}>Spotify</SourceLink>
        {isResolving && <Loader2 className="h-3 w-3 animate-spin text-coral" />}
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
      className="rounded-xl border border-amber/30 bg-amber/[0.06] p-3 shadow-[0_0_28px_rgba(255,176,134,0.1)] transition hover:border-amber/55 hover:bg-amber/[0.12]"
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
          <MusicPreviewPlayer
            track={{
              id: track.id,
              title: track.title,
              artist: track.artist,
              artworkUrl: track.imageUrl,
              previewUrl: track.previewUrl,
            }}
          />
          <SourceLink href={track.externalUrl}>Open source</SourceLink>
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
  const [type, setType] = useState<SearchType>(defaultType);
  const [recent, setRecent] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query.trim());

  useEffect(() => {
    setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
  }, []);

  const enabled = deferredQuery.length > 1;
  const searchQuery = useInfiniteQuery({
    queryKey: ["music-search", deferredQuery, type],
    queryFn: ({ pageParam }) => fetchSearchResults(deferredQuery, type, pageParam),
    initialPageParam: "1",
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });

  const mergedResults = useMemo(() => {
    const pages = searchQuery.data?.pages ?? [];
    return {
      vinylReleases: pages.flatMap((p) => p.results.vinylReleases),
      albums: pages.flatMap((p) => p.results.albums),
      artists: pages.flatMap((p) => p.results.artists),
      tracks: pages.flatMap((p) => p.results.tracks),
      labels: pages.flatMap((p) => p.results.labels ?? []),
      sources: pages[pages.length - 1]?.sources,
    };
  }, [searchQuery.data]);

  const totalResults = useMemo(
    () =>
      mergedResults.vinylReleases.length +
      mergedResults.albums.length +
      mergedResults.artists.length +
      mergedResults.tracks.length +
      mergedResults.labels.length,
    [mergedResults],
  );

  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!enabled || totalResults === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, totalResults - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, totalResults]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length > 1) {
      saveRecentSearch(query.trim());
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
    }
  }

  return (
    <Card className="overflow-hidden border-fuchsia/25 bg-panel/75 shadow-[0_0_80px_rgba(217,0,255,0.12),0_0_60px_rgba(0,242,255,0.08)]">
      <CardHeader className="border-b border-cyan/15 bg-gradient-to-r from-cyan/[0.07] via-transparent to-fuchsia/[0.07]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-fuchsia drop-shadow-[0_0_8px_rgba(217,0,255,0.7)]" />
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
          onSubmit={handleSearchSubmit}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-cyan/35 bg-cyan/[0.07] px-3 py-2 shadow-[0_0_38px_rgba(0,242,255,0.14)]">
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
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                type === option.value
                  ? "border-emerald/50 bg-emerald/20 text-emerald shadow-[0_0_24px_rgba(0,242,255,0.28)]"
                  : "border-fuchsia/20 bg-fuchsia/[0.05] text-zinc-400 hover:border-cyan/40 hover:text-cyan",
              )}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        {!enabled && (
          <div className="space-y-4">
            {recent.length > 0 && (
              <div>
                <p className="text-caption mb-2 text-zinc-500">Recent searches</p>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setQuery(r)}
                      className="rounded-full border border-cyan/25 bg-cyan/[0.08] px-3 py-1 text-xs text-cyan hover:border-fuchsia/40 hover:bg-fuchsia/10 hover:text-fuchsia"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-caption mb-2 text-zinc-500">Trending</p>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setQuery(t)}
                    className="rounded-full border border-emerald/35 bg-emerald/15 px-3 py-1 text-xs text-emerald shadow-[0_0_16px_rgba(0,242,255,0.12)] hover:bg-emerald/25"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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

        {searchQuery.data && enabled && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <Badge className="border-emerald/20 bg-emerald/10 text-emerald">
                {totalResults} results
              </Badge>
              {mergedResults.sources && !mergedResults.sources.discogs.available &&
                mergedResults.sources.discogs.error && (
                  <Badge className="border-coral/20 bg-coral/10 text-coral">
                    {mergedResults.sources.discogs.error}
                  </Badge>
                )}
              {mergedResults.sources && !mergedResults.sources.spotify.available &&
                mergedResults.sources.spotify.error && (
                  <Badge className="border-coral/20 bg-coral/10 text-coral">
                    {mergedResults.sources.spotify.error}
                  </Badge>
                )}
            </div>

            {totalResults === 0 && !searchQuery.isLoading && (
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5 text-sm text-zinc-400">
                No matches yet. Try a broader artist, album, or genre search.
              </div>
            )}

            <Section
              title="Vinyl releases"
              icon={<Disc3 className="h-4 w-4 text-emerald" />}
              empty={mergedResults.vinylReleases.length === 0}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {mergedResults.vinylReleases
                  .slice(0, compact ? 6 : undefined)
                  .map((release) => (
                    <VinylCard key={release.id} release={release} />
                  ))}
              </div>
            </Section>

            <Section
              title="Albums"
              icon={<Radio className="h-4 w-4 text-cyan" />}
              empty={mergedResults.albums.length === 0}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {mergedResults.albums
                  .slice(0, compact ? 4 : undefined)
                  .map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
              </div>
            </Section>

            <Section
              title="Artists"
              icon={<Mic2 className="h-4 w-4 text-coral" />}
              empty={mergedResults.artists.length === 0}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {mergedResults.artists
                  .slice(0, compact ? 4 : undefined)
                  .map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
              </div>
            </Section>

            <Section
              title="Tracks"
              icon={<Music2 className="h-4 w-4 text-amber" />}
              empty={mergedResults.tracks.length === 0}
            >
              <div className="grid gap-4 xl:grid-cols-2">
                {mergedResults.tracks
                  .slice(0, compact ? 4 : undefined)
                  .map((track) => (
                    <TrackCard key={track.id} track={track} />
                  ))}
              </div>
            </Section>

            <Section
              title="Labels"
              icon={<Tag className="h-4 w-4 text-cyan" />}
              empty={mergedResults.labels.length === 0}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {mergedResults.labels.map((label) => (
                  <LabelCard key={label.id} label={label} />
                ))}
              </div>
            </Section>

            {!compact && searchQuery.hasNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => searchQuery.fetchNextPage()}
                  disabled={searchQuery.isFetchingNextPage}
                >
                  {searchQuery.isFetchingNextPage && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
