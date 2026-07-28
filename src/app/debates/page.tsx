"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { AppShell } from "@/features/app-shell/app-shell";
import { PageHeader } from "@/components/vinyl/page-header";
import { EmptyState } from "@/components/vinyl/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { CreateDebateDialog } from "@/features/social/create-debate-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function DebatesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["debates"],
    queryFn: async () => {
      const res = await fetch("/api/debates");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Debates"
        title="Debate Arena"
        description="Settle the great vinyl and music debates with the community."
        actions={<CreateDebateDialog />}
      />
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : !data?.debates?.length ? (
          <EmptyState
            icon={Flame}
            title="No debates yet"
            description="Be the first to spark a music debate."
          />
        ) : (
          <div className="space-y-4">
            {data.debates.map((d: {
              id: string;
              slug: string;
              title: string;
              prompt: string;
              options: Array<{ label: string; votes: number }>;
              _count: { votes: number; arguments: number };
            }) => (
              <Link key={d.id} href={`/debates/${d.slug}`}>
                <Card className="border-fuchsia/10 bg-black/45 transition hover:border-fuchsia/30">
                  <CardContent className="p-5">
                    <h3 className="text-title text-white">{d.title}</h3>
                    <p className="mt-2 line-clamp-2 text-body text-zinc-400">{d.prompt}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {d.options.slice(0, 3).map((o) => (
                        <span
                          key={o.label}
                          className="rounded-full border border-fuchsia/20 bg-fuchsia/10 px-3 py-1 text-xs text-fuchsia"
                        >
                          {o.label} ({o.votes})
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-caption text-zinc-500">
                      {d._count.votes} votes · {d._count.arguments} arguments
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
