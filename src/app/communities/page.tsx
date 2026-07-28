"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users, MessageCircle } from "lucide-react";
import { AppShell } from "@/features/app-shell/app-shell";
import { PageHeader } from "@/components/vinyl/page-header";
import { EmptyState } from "@/components/vinyl/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { CreateCommunityDialog } from "@/features/social/create-community-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunitiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const res = await fetch("/api/communities");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Community"
        title="Communities"
        description="Join discussions around artists, genres, albums, and vinyl culture."
        actions={<CreateCommunityDialog />}
      />
      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : !data?.communities?.length ? (
          <EmptyState
            icon={Users}
            title="No communities yet"
            description="Communities will appear as members create discussion spaces."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.communities.map((c: { id: string; slug: string; name: string; description: string | null; type: string; postCount: number }) => (
              <Link key={c.id} href={`/communities/${c.slug}`}>
                <Card className="h-full border-white/10 bg-black/45 transition hover:border-cyan/30 hover:bg-cyan/[0.04]">
                  <CardContent className="p-5">
                    <Badge className="border-cyan/20 bg-cyan/10 text-cyan">{c.type}</Badge>
                    <h3 className="mt-3 text-title text-white">{c.name}</h3>
                    {c.description && (
                      <p className="mt-2 line-clamp-2 text-body text-zinc-400">{c.description}</p>
                    )}
                    <p className="mt-3 flex items-center gap-1 text-caption text-zinc-500">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {c.postCount} posts
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
