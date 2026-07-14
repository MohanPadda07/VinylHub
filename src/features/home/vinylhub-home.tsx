"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Disc3,
  Flame,
  Radio,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Waves,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/features/app-shell/app-shell";
import { LiveSearchExperience } from "@/features/search/live-search-experience";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Live sources", value: "2", tone: "text-cyan" },
  { label: "Vinyl signal", value: "Discogs", tone: "text-emerald" },
  { label: "Music graph", value: "Spotify", tone: "text-amber" },
  { label: "Mode", value: "Neon", tone: "text-coral" },
];

const pulseItems = [
  "Discogs release search is wired for vinyl, variants, labels, and catalog numbers.",
  "Spotify enrichment is wired for albums, artists, tracks, and streaming links.",
  "The next milestone can save search results into your collection and wishlist.",
];

const debateItems = [
  { title: "Best live album pressings?", leader: "Jazz collectors", votes: "2.4k" },
  { title: "Is colored vinyl overrated?", leader: "Split vote", votes: "8.1k" },
  { title: "Most essential 90s hip-hop LP?", leader: "Illmatic", votes: "11.2k" },
];

export function VinylHubHome() {
  return (
    <AppShell>
      <div className="grid gap-5 py-5 xl:grid-cols-[1fr_390px]">
        <section className="space-y-5">
          <section className="glass-border relative overflow-hidden rounded-lg bg-black/65 p-5 sm:p-6">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia/20 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan/15 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
              <div>
                <Badge className="border-cyan/25 bg-cyan/10 text-cyan">
                  Live crate-digging mode
                </Badge>
                <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
                  Search the night wall of vinyl, albums, artists, and tracks.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
                  VinylHub now connects real Discogs and Spotify data into one
                  glowing discovery surface for collectors and music obsessives.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild>
                    <a href="/search?q=radiohead%20vinyl">
                      <Disc3 className="h-4 w-4" />
                      Search vinyl
                    </a>
                  </Button>
                  <Button asChild variant="secondary">
                    <a href="/search?q=kendrick%20lamar">
                      <Radio className="h-4 w-4" />
                      Explore music
                    </a>
                  </Button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55 }}
                className="mx-auto grid aspect-square w-full max-w-[280px] place-items-center rounded-full border border-cyan/20 bg-black/45 shadow-[0_0_90px_rgba(34,211,238,0.16)]"
              >
                <div className="record-grooves spinning-record grid h-[82%] w-[82%] place-items-center rounded-full border border-white/10">
                  <div className="grid h-24 w-24 place-items-center rounded-full border border-fuchsia/30 bg-fuchsia/20">
                    <Sparkles className="h-7 w-7 text-fuchsia" />
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="border-white/10 bg-white/[0.045] shadow-[0_0_40px_rgba(255,47,146,0.045)]"
              >
                <CardContent className="p-4">
                  <p className="text-xs text-muted">{stat.label}</p>
                  <p className={cn("mt-2 text-2xl font-semibold", stat.tone)}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <LiveSearchExperience
            compact
            initialQuery="Daft Punk Random Access Memories vinyl"
          />

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="border-cyan/10 bg-black/45">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan" />
                  Live System Pulse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pulseItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-zinc-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-fuchsia/10 bg-black/45">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-coral" />
                  Debate Arena
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {debateItems.map((debate) => (
                    <div
                      key={debate.title}
                      className="rounded-md border border-white/10 bg-white/[0.035] p-3"
                    >
                      <p className="font-medium text-white">{debate.title}</p>
                      <div className="mt-2 flex items-center justify-between gap-3 text-sm text-zinc-400">
                        <span>{debate.votes} votes</span>
                        <span className="text-amber">{debate.leader}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <aside className="space-y-5">
          <Card className="border-emerald/10 bg-black/55">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald" />
                Collection Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="record-grooves spinning-record mx-auto grid aspect-square max-w-[260px] place-items-center rounded-full border border-white/10">
                <div className="grid h-24 w-24 place-items-center rounded-full border border-amber/30 bg-amber/20 text-center">
                  <Star className="h-6 w-6 text-amber" />
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-zinc-300">
                  <span>Live data readiness</span>
                  <span className="text-emerald">Online</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[88%] rounded-full bg-gradient-to-r from-emerald via-cyan to-fuchsia" />
                </div>
                <p className="leading-6 text-zinc-400">
                  Search is live. Collection saving, wishlist actions, and
                  personalized recommendations are ready for the next milestone.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan/10 bg-black/55">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-cyan" />
                Signal Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Save a Discogs pressing into your owned collection.",
                  "Match Spotify albums to Discogs vinyl releases.",
                  "Generate a listening path from your searched artists.",
                ].map((item) => (
                  <button
                    key={item}
                    className="w-full rounded-md border border-white/10 bg-white/[0.035] p-3 text-left text-sm leading-6 text-zinc-300 transition hover:bg-white/[0.07]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-fuchsia/10 bg-black/55">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-fuchsia">
                <Activity className="h-4 w-4" />
                Club Neon Engine
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Animated vinyl, live result shelves, neon source badges, and
                responsive search are now the app&apos;s main interaction model.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
