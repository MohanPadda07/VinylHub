"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { MusicSearchResponse } from "@/lib/integrations/music-types";

const TRENDING = [
  "Radiohead OK Computer",
  "Kendrick Lamar",
  "Daft Punk vinyl",
  "Fleetwood Mac Rumours",
  "Pink Floyd Dark Side",
];

const RECENT_KEY = "vinylhub-recent-searches";

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((q) => q !== query);
  localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...recent].slice(0, 8)));
}

async function fetchQuickSearch(query: string) {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&type=all`,
  );
  if (!response.ok) throw new Error("Search failed");
  return response.json() as Promise<MusicSearchResponse>;
}

type CommandSearchProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (open) setRecent(getRecentSearches());
  }, [open]);

  const { data, isLoading } = useQuery({
    queryKey: ["command-search", query],
    queryFn: () => fetchQuickSearch(query),
    enabled: query.trim().length > 1,
    staleTime: 30_000,
  });

  const navigate = useCallback(
    (path: string, searchQuery?: string) => {
      if (searchQuery) saveRecentSearch(searchQuery);
      onOpenChange(false);
      setQuery("");
      router.push(path);
    },
    [onOpenChange, router],
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search vinyl, albums, artists, tracks..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? "Searching..." : query.length > 1 ? "No results found." : "Type to search..."}
        </CommandEmpty>

        {query.length <= 1 && (
          <>
            {recent.length > 0 && (
              <CommandGroup heading="Recent">
                {recent.map((item) => (
                  <CommandItem
                    key={item}
                    onSelect={() => navigate(`/search?q=${encodeURIComponent(item)}`, item)}
                  >
                    {item}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandSeparator />
            <CommandGroup heading="Trending">
              {TRENDING.map((item) => (
                <CommandItem
                  key={item}
                  onSelect={() => navigate(`/search?q=${encodeURIComponent(item)}`, item)}
                >
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {data && query.length > 1 && (
          <>
            {data.results.vinylReleases.length > 0 && (
              <CommandGroup heading="Vinyl">
                {data.results.vinylReleases.slice(0, 5).map((r) => (
                  <CommandItem
                    key={r.id}
                    onSelect={() =>
                      navigate(`/search?q=${encodeURIComponent(r.title)}`, r.title)
                    }
                  >
                    {r.title} — {r.artist}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {data.results.albums.length > 0 && (
              <CommandGroup heading="Albums">
                {data.results.albums.slice(0, 5).map((a) => (
                  <CommandItem
                    key={a.id}
                    onSelect={() =>
                      navigate(`/search?q=${encodeURIComponent(a.title)}`, a.title)
                    }
                  >
                    {a.title} — {a.artist}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {data.results.artists.length > 0 && (
              <CommandGroup heading="Artists">
                {data.results.artists.slice(0, 5).map((a) => (
                  <CommandItem
                    key={a.id}
                    onSelect={() =>
                      navigate(`/search?q=${encodeURIComponent(a.name)}`, a.name)
                    }
                  >
                    {a.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {data.results.tracks.length > 0 && (
              <CommandGroup heading="Tracks">
                {data.results.tracks.slice(0, 5).map((t) => (
                  <CommandItem
                    key={t.id}
                    onSelect={() =>
                      navigate(`/search?q=${encodeURIComponent(t.title)}`, t.title)
                    }
                  >
                    {t.title} — {t.artist}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
