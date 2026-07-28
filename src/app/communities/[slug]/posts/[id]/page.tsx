"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/features/app-shell/app-shell";
import { PageHeader } from "@/components/vinyl/page-header";
import { CommentThread } from "@/features/social/comment-thread";
import { VoteButtons } from "@/features/social/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const post = data?.post;

  return (
    <AppShell>
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <>
          <PageHeader
            eyebrow={post?.community?.name ?? "Post"}
            title={post?.title}
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <article className="space-y-6">
              <div className="flex gap-4 rounded-lg border border-white/10 bg-black/45 p-5">
                <Avatar>
                  <AvatarImage src={post?.author?.imageUrl ?? undefined} />
                  <AvatarFallback>{post?.author?.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{post?.author?.displayName}</p>
                  <p className="mt-3 text-body text-zinc-300">{post?.body}</p>
                </div>
              </div>
              <section>
                <h2 className="text-title mb-4 text-white">Comments</h2>
                <CommentThread postId={postId} comments={post?.comments ?? []} />
              </section>
            </article>
            <aside>
              <VoteButtons postId={postId} score={post?.score ?? 0} />
            </aside>
          </div>
        </>
      )}
    </AppShell>
  );
}
