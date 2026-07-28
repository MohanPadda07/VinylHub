"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { AppShell } from "@/features/app-shell/app-shell";
import { PageHeader } from "@/components/vinyl/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data, isLoading } = useQuery({
    queryKey: ["community", slug],
    queryFn: async () => {
      const res = await fetch(`/api/communities/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const community = data?.community;

  return (
    <AppShell>
      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-lg" />
      ) : (
        <>
          <PageHeader
            eyebrow="Community"
            title={community?.name ?? "Community"}
            description={community?.description}
          />
          <div className="mt-6 space-y-4">
            {community?.posts?.length === 0 ? (
              <p className="text-sm text-zinc-400">No posts yet. Start the conversation!</p>
            ) : (
              community?.posts?.map((post: {
                id: string;
                title: string;
                body: string;
                score: number;
                createdAt: string;
                author: { displayName: string; imageUrl: string | null };
                _count: { comments: number };
              }) => (
                <Link key={post.id} href={`/communities/${slug}/posts/${post.id}`}>
                  <Card className="border-white/10 bg-black/45 transition hover:border-fuchsia/30">
                    <CardContent className="flex gap-4 p-5">
                      <Avatar>
                        <AvatarImage src={post.author.imageUrl ?? undefined} />
                        <AvatarFallback>{post.author.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-white">{post.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{post.body}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                          <span>{post.author.displayName}</span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post._count.comments}
                          </span>
                          <span>Score: {post.score}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
