"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { AppShell } from "@/features/app-shell/app-shell";
import { PageHeader } from "@/components/vinyl/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DebateDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["debate", slug],
    queryFn: async () => {
      const res = await fetch(`/api/debates/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      const res = await fetch(`/api/debates/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "vote", optionId }),
      });
      if (!res.ok) throw new Error("Vote failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["debate", slug] }),
  });

  const debate = data?.debate;
  const totalVotes = debate?.options?.reduce((s: number, o: { votes: number }) => s + o.votes, 0) ?? 0;

  return (
    <AppShell>
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <>
          <PageHeader
            eyebrow="Debate"
            title={debate?.title}
            description={debate?.prompt}
          />
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
            <section className="space-y-3">
              <h2 className="text-title text-white">Cast your vote</h2>
              {debate?.options?.map((option: { id: string; label: string; votes: number }) => {
                const pct = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => voteMutation.mutate(option.id)}
                    disabled={voteMutation.isPending}
                    className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-fuchsia/30"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-fuchsia/10"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <span className="font-medium text-white">{option.label}</span>
                      <span className="text-sm text-fuchsia">{pct}%</span>
                    </div>
                  </button>
                );
              })}
            </section>

            <aside>
              <Card className="border-fuchsia/10 bg-black/45">
                <CardHeader className="flex flex-row items-center gap-2 p-4 pb-2">
                  <Flame className="h-4 w-4 text-fuchsia" />
                  <span className="font-medium text-white">Arguments</span>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                  {debate?.arguments?.length === 0 ? (
                    <p className="text-sm text-zinc-400">No arguments yet.</p>
                  ) : (
                    debate?.arguments?.map((arg: {
                      id: string;
                      body: string;
                      author: { displayName: string; imageUrl: string | null };
                    }) => (
                      <div key={arg.id} className="flex gap-3 rounded-md border border-white/10 p-3">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={arg.author.imageUrl ?? undefined} />
                          <AvatarFallback>{arg.author.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium text-white">{arg.author.displayName}</p>
                          <p className="mt-1 text-sm text-zinc-400">{arg.body}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </>
      )}
    </AppShell>
  );
}

function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
