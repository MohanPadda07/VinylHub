"use client";

import Link from "next/link";
import { Settings, Disc3, Heart, Library } from "lucide-react";
import { AppShell } from "@/features/app-shell/app-shell";
import { PageHeader } from "@/components/vinyl/page-header";
import { MetricCard } from "@/components/vinyl/metric-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileContent() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: stats } = useQuery({
    queryKey: ["collection-stats"],
    queryFn: async () => {
      const res = await fetch("/api/collection/stats");
      if (!res.ok) return null;
      const data = await res.json();
      return data.stats;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-white/10 bg-black/45">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <Avatar className="h-24 w-24 border-2 border-emerald/30">
            <AvatarImage src={user?.imageUrl ?? undefined} />
            <AvatarFallback className="bg-emerald/20 text-2xl text-emerald">
              {user?.displayName?.[0] ?? "V"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-white">{user?.displayName}</h2>
            <p className="text-cyan">@{user?.username}</p>
            {user?.bio && (
              <p className="mt-2 text-body text-zinc-400">{user.bio}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-caption text-zinc-500">
              <span>Level {user?.level}</span>
              <span>·</span>
              <span>{user?.reputation} reputation</span>
            </div>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Records"
          value={stats?.totalItems ?? 0}
          icon={Library}
          tone="emerald"
        />
        <MetricCard
          label="Collection value"
          value={
            stats?.totalValueCents
              ? `$${Math.round(stats.totalValueCents / 100).toLocaleString()}`
              : "$0"
          }
          icon={Disc3}
          tone="cyan"
        />
        <MetricCard
          label="Favorites"
          value={stats?.statusCounts?.FAVORITE ?? 0}
          icon={Heart}
          tone="fuchsia"
        />
      </div>

      {user?.favoriteGenres && user.favoriteGenres.length > 0 && (
        <section>
          <h3 className="text-title mb-3 text-white">Favorite genres</h3>
          <div className="flex flex-wrap gap-2">
            {user.favoriteGenres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-amber/20 bg-amber/10 px-3 py-1 text-xs text-amber"
              >
                {genre}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Your profile"
        title="Profile"
        description="Your VinylHub identity, collection stats, and preferences."
      />
      <div className="mt-6">
        <ProfileContent />
      </div>
    </AppShell>
  );
}
