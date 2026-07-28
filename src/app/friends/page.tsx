"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Users, Check, X, Sparkles } from "lucide-react";
import { AppShell } from "@/features/app-shell/app-shell";
import { PageHeader } from "@/components/vinyl/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function FriendsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await fetch("/api/friends");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: suggestions } = useQuery({
    queryKey: ["friend-suggestions"],
    queryFn: async () => {
      const res = await fetch("/api/friends/suggestions");
      if (!res.ok) return { suggestions: [] };
      return res.json();
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });

  const respondMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: "ACCEPTED" | "REJECTED" }) => {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Social"
        title="Friends"
        description="Manage friend requests, followers, and connections."
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {isLoading ? (
          <Skeleton className="h-48 rounded-lg lg:col-span-2" />
        ) : (
          <>
            <Card className="border-cyan/10 bg-black/45">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <UserPlus className="h-4 w-4 text-cyan" />
                  Friend requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!data?.incoming?.length ? (
                  <p className="text-sm text-zinc-400">No pending requests.</p>
                ) : (
                  data.incoming.map((req: { id: string; user: { displayName: string; imageUrl: string | null } }) => (
                    <div key={req.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={req.user?.imageUrl ?? undefined} />
                          <AvatarFallback>{req.user?.displayName?.[0] ?? "?"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white">{req.user?.displayName}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => respondMutation.mutate({ requestId: req.id, action: "ACCEPTED" })}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => respondMutation.mutate({ requestId: req.id, action: "REJECTED" })}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald/10 bg-black/45">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-4 w-4 text-emerald" />
                  Following
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!data?.following?.length ? (
                  <p className="text-sm text-zinc-400">Not following anyone yet.</p>
                ) : (
                  data.following.map((u: { id: string; displayName: string; username: string; imageUrl: string | null }) => (
                    <div key={u.id} className="flex items-center gap-3 rounded-md border border-white/10 p-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={u.imageUrl ?? undefined} />
                        <AvatarFallback>{u.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-white">{u.displayName}</p>
                        <p className="text-xs text-zinc-500">@{u.username}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-fuchsia/10 bg-black/45 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="h-4 w-4 text-fuchsia" />
                  Suggested friends
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                {!suggestions?.suggestions?.length ? (
                  <p className="text-sm text-zinc-400">Add records to get suggestions based on genre overlap.</p>
                ) : (
                  suggestions.suggestions.map((u: { id: string; displayName: string; username: string; imageUrl: string | null; _count: { collectionItems: number } }) => (
                    <div key={u.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.imageUrl ?? undefined} />
                          <AvatarFallback>{u.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm text-white">{u.displayName}</p>
                          <p className="text-xs text-zinc-500">{u._count.collectionItems} records</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => requestMutation.mutate(u.id)}>
                        <UserPlus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
