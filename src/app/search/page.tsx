import { AppShell } from "@/features/app-shell/app-shell";
import { LiveSearchExperience } from "@/features/search/live-search-experience";
import type { MusicSearchResponse } from "@/lib/integrations/music-types";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: MusicSearchResponse["type"];
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const type = params.type ?? "all";

  return (
    <AppShell>
      <section className="space-y-5 py-5">
        <div className="glass-border relative overflow-hidden rounded-lg bg-black/55 p-5">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan">
            Global signal search
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
            Find the pressing, album, artist, or track in one neon sweep.
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-300">
            VinylHub blends Discogs release data with Spotify music metadata so
            every search feels like a living record wall.
          </p>
        </div>

        <LiveSearchExperience initialQuery={query} defaultType={type} />
      </section>
    </AppShell>
  );
}
