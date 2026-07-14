"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Flame,
  Radio,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/features/app-shell/app-shell";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Collection value", value: "$8,420", tone: "text-emerald" },
  { label: "Owned records", value: "312", tone: "text-cyan" },
  { label: "Wishlist finds", value: "28", tone: "text-amber" },
  { label: "Reputation", value: "4,890", tone: "text-coral" },
];

const discovery = [
  {
    title: "A Love Supreme",
    artist: "John Coltrane",
    reason: "Matches your modal jazz shelf and recent Blue Note discussions.",
    color: "from-amber/90 via-coral/80 to-zinc-900",
    score: "94%",
  },
  {
    title: "Heaven or Las Vegas",
    artist: "Cocteau Twins",
    reason: "Hidden gem pick from collectors who love dream pop pressings.",
    color: "from-cyan/80 via-emerald/60 to-zinc-900",
    score: "89%",
  },
  {
    title: "Maggot Brain",
    artist: "Funkadelic",
    reason: "Trending in the psychedelic soul community this week.",
    color: "from-coral/85 via-amber/70 to-zinc-950",
    score: "87%",
  },
];

const feed = [
  "The Blue Note community started a listening club for spiritual jazz.",
  "Nina posted a ranked list of essential Japanese city pop pressings.",
  "AI summarized 42 arguments in the best Radiohead album debate.",
  "Three collectors near you added original Motown singles to trade lists.",
];

const debates = [
  { title: "Best Beatles album?", votes: "12.8k votes", leader: "Revolver" },
  {
    title: "TPAB vs MBDTF",
    votes: "8.4k votes",
    leader: "To Pimp a Butterfly",
  },
  {
    title: "Most underrated Radiohead album?",
    votes: "4.1k votes",
    leader: "Amnesiac",
  },
];

export function VinylHubHome() {
  return (
    <AppShell>
          <div className="grid gap-5 py-5 xl:grid-cols-[1fr_390px]">
            <section className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <Card key={stat.label} className="bg-white/[0.045]">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted">{stat.label}</p>
                      <p className={cn("mt-2 text-2xl font-semibold", stat.tone)}>
                        {stat.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <section className="glass-border rounded-lg bg-panel/80 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <Badge className="border-emerald/25 bg-emerald/10 text-emerald">
                      Daily discovery
                    </Badge>
                    <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
                      Build your collection around taste, people, and stories.
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-300">
                      VinylHub connects your shelves, reviews, communities, and
                      listening history into one social graph for music discovery.
                    </p>
                  </div>
                  <Button variant="secondary">
                    <Radio className="h-4 w-4" />
                    Start listening club
                  </Button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {discovery.map((album, index) => (
                    <motion.article
                      key={album.title}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="rounded-lg border border-white/10 bg-black/30 p-3"
                    >
                      <div
                        className={cn(
                          "album-sheen aspect-square rounded-md bg-gradient-to-br",
                          album.color,
                        )}
                      >
                        <div className="record-grooves absolute bottom-3 right-3 h-16 w-16 rounded-full border border-white/20" />
                      </div>
                      <div className="mt-3 flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-semibold text-white">{album.title}</h2>
                          <p className="text-sm text-zinc-400">{album.artist}</p>
                        </div>
                        <Badge className="border-emerald/20 text-emerald">
                          {album.score}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-zinc-300">
                        {album.reason}
                      </p>
                    </motion.article>
                  ))}
                </div>
              </section>

              <div className="grid gap-5 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan" />
                      Community Pulse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {feed.map((item) => (
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

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-coral" />
                      Debate Arena
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {debates.map((debate) => (
                        <div
                          key={debate.title}
                          className="rounded-md border border-white/10 bg-white/[0.035] p-3"
                        >
                          <p className="font-medium text-white">{debate.title}</p>
                          <div className="mt-2 flex items-center justify-between gap-3 text-sm text-zinc-400">
                            <span>{debate.votes}</span>
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
              <Card className="bg-panel-strong/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald" />
                    Collection Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="record-grooves mx-auto grid aspect-square max-w-[260px] place-items-center rounded-full border border-white/10">
                    <div className="grid h-24 w-24 place-items-center rounded-full border border-amber/30 bg-amber/20 text-center">
                      <Star className="h-6 w-6 text-amber" />
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between text-zinc-300">
                      <span>Rarity score</span>
                      <span className="text-emerald">82 / 100</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 w-[82%] rounded-full bg-emerald" />
                    </div>
                    <p className="leading-6 text-zinc-400">
                      Your strongest cluster is 1960s jazz, but the engine sees a
                      high-confidence path into Brazilian psych and soul-jazz.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-cyan" />
                    AI Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "Explain why your collection leans toward warm analog masters.",
                      "Build a 10-album path from Miles Davis to Alice Coltrane.",
                      "Summarize the latest shoegaze pressing debate.",
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
            </aside>
          </div>
    </AppShell>
  );
}
