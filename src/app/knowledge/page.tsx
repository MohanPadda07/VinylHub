"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AudioLines, BookOpen } from "lucide-react";
import { AppShell } from "@/features/app-shell/app-shell";
import { PageHeader } from "@/components/vinyl/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function KnowledgePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const res = await fetch("/api/knowledge/genres");
      if (!res.ok) return { genres: [] };
      return res.json();
    },
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Knowledge"
        title="Music Knowledge Hub"
        description="Explore genres, artist networks, and curated learning paths."
      />
      <div className="mt-6">
        <h2 className="text-title mb-4 flex items-center gap-2 text-white">
          <AudioLines className="h-5 w-5 text-cyan" />
          Genre explorer
        </h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.genres ?? []).map((genre: { id: string; slug: string; name: string; description: string | null; _count: { albums: number } }) => (
              <Card key={genre.id} className="border-cyan/10 bg-black/45">
                <CardContent className="p-5">
                  <Badge className="border-cyan/20 bg-cyan/10 text-cyan">Genre</Badge>
                  <h3 className="mt-2 font-medium text-white">{genre.name}</h3>
                  {genre.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{genre.description}</p>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">{genre._count.albums} albums</p>
                </CardContent>
              </Card>
            ))}
            {(data?.genres ?? []).length === 0 && (
              <Card className="border-white/10 bg-black/45 sm:col-span-2 lg:col-span-3">
                <CardContent className="flex items-center gap-3 p-6">
                  <BookOpen className="h-5 w-5 text-zinc-500" />
                  <p className="text-sm text-zinc-400">
                    Genres populate as albums are added to the catalog.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
