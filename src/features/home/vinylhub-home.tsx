"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Disc3,
  Flame,
  Library,
  Plus,
  Radio,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/features/app-shell/app-shell";
import { LiveSearchExperience } from "@/features/search/live-search-experience";
import { MetricCard } from "@/components/vinyl/metric-card";
import { usePlayerStore } from "@/stores/player-store";

type DiscoverData = {
  albums: Array<{ title: string; slug: string; coverUrl: string | null; artist: string; rating: number | null }>;
  artists: Array<{ name: string; slug: string; imageUrl: string | null; albumCount: number }>;
  trending: Array<{ title: string; albumSlug: string; artist: string; coverUrl: string | null }>;
  activity: Array<{ id: string; type: string; user: { displayName: string; username: string }; createdAt: string }>;
};

function money(cents?: number) {
  if (!cents) return "$0";
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

export function VinylHubHome() {
  const { activeTrack } = usePlayerStore();

  const { data: stats } = useQuery({
    queryKey: ["collection-stats"],
    queryFn: async () => {
      const res = await fetch("/api/collection/stats");
      if (!res.ok) return null;
      return (await res.json()).stats;
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["collection-recent"],
    queryFn: async () => {
      const res = await fetch("/api/collection");
      if (!res.ok) return [];
      const data = await res.json();
      return (data.items ?? []).slice(0, 4);
    },
  });

  const { data: discover } = useQuery({
    queryKey: ["discover-trending"],
    queryFn: async () => {
      const res = await fetch("/api/discover/trending");
      if (!res.ok) return null;
      return res.json() as Promise<DiscoverData>;
    },
  });

  return (
    <AppShell>
      <div className="grid gap-5 py-5 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <section className="glass-border relative overflow-hidden rounded-lg bg-panel/80 p-5 sm:p-6">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia/25 blur-3xl" />
            <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-cyan/20 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-[1fr_240px] lg:items-center">
              <div>
                <Badge className="border-cyan/30 bg-cyan/10 text-cyan">Discover</Badge>
                <h1 className="mt-4 text-display text-white">
                  Your vinyl universe,{" "}
                  <span className="brand-gradient-text">live.</span>
                </h1>
                <p className="mt-4 max-w-2xl text-body text-zinc-300">
                  Search, collect, and explore music from Discogs and Spotify — all in one place.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/search">
                      <Search className="h-4 w-4" />
                      Search
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/collection">
                      <Library className="h-4 w-4" />
                      Collection
                    </Link>
                  </Button>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glow-mark mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-[2.25rem] border border-cyan/25 bg-panel"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/vinylhub-mark.png"
                  alt="VinylHub"
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Owned records" value={stats?.recordCount ?? 0} icon={Disc3} tone="cyan" />
            <MetricCard label="Collection value" value={money(stats?.totalValueCents)} icon={TrendingUp} tone="emerald" />
            <MetricCard label="Wishlist" value={stats?.statusCounts?.WISHLIST ?? 0} icon={Star} tone="amber" />
            <MetricCard label="Favorites" value={stats?.statusCounts?.FAVORITE ?? 0} icon={Flame} tone="fuchsia" />
          </div>

          <LiveSearchExperience compact initialQuery="" />

          {discover && discover.trending.length > 0 && (
            <Card className="border-fuchsia/30 bg-fuchsia/[0.06] shadow-[0_0_36px_rgba(217,0,255,0.14)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-4 w-4 text-fuchsia" />
                  Trending in collections
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {discover.trending.map((item) => (
                  <Link
                    key={item.albumSlug}
                    href={`/albums/${item.albumSlug}`}
                    className="flex gap-3 rounded-xl border border-emerald/25 bg-emerald/[0.05] p-3 transition hover:border-emerald/50 hover:bg-emerald/[0.1] hover:shadow-[0_0_24px_rgba(0,242,255,0.12)]"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/50">
                      {item.coverUrl ? (
                        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${item.coverUrl})` }} />
                      ) : (
                        <div className="record-grooves h-full w-full" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{item.title}</p>
                      <p className="truncate text-xs text-zinc-400">{item.artist}</p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        <aside className="space-y-5">
          {activeTrack && (
            <Card className="border-amber/30 bg-amber/[0.06] shadow-[0_0_36px_rgba(255,176,134,0.12)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Radio className="h-4 w-4 text-amber" />
                  Continue listening
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-white">{activeTrack.title}</p>
                <p className="text-xs text-zinc-400">{activeTrack.artist}</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-cyan/30 bg-cyan/[0.06] shadow-[0_0_36px_rgba(0,242,255,0.12)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Plus className="h-4 w-4 text-cyan" />
                Quick actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="secondary" className="justify-start">
                <Link href="/search"><Search className="h-4 w-4" /> Search records</Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start">
                <Link href="/collection"><Library className="h-4 w-4" /> View collection</Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start">
                <Link href="/debates"><Flame className="h-4 w-4" /> Start a debate</Link>
              </Button>
            </CardContent>
          </Card>

          {recent && recent.length > 0 && (
            <Card className="border-emerald/30 bg-emerald/[0.06] shadow-[0_0_36px_rgba(0,242,255,0.12)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Disc3 className="h-4 w-4 text-emerald" />
                  Recently added
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recent.map((item: { id: string; album: { title: string; slug: string; artist: { name: string } } }) => (
                  <Link
                    key={item.id}
                    href={`/albums/${item.album.slug}`}
                    className="block rounded-md border border-white/10 bg-white/[0.03] p-2 text-sm transition hover:border-emerald/30"
                  >
                    <p className="font-medium text-white">{item.album.title}</p>
                    <p className="text-xs text-zinc-400">{item.album.artist.name}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {discover && discover.activity.length > 0 && (
            <Card className="border-fuchsia/30 bg-fuchsia/[0.06] shadow-[0_0_36px_rgba(217,0,255,0.14)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="h-4 w-4 text-fuchsia" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {discover.activity.slice(0, 5).map((a) => (
                  <div key={a.id} className="text-xs text-zinc-400">
                    <span className="text-white">{a.user.displayName}</span>{" "}
                    {a.type.replace(/_/g, " ").toLowerCase()}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
