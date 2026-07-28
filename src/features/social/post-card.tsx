"use client";

import Link from "next/link";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { votePostAction } from "@/features/social/actions";
import { cn } from "@/lib/utils";

export type PostSummary = {
  id: string;
  title: string;
  body: string;
  score: number;
  createdAt: string;
  author: { displayName: string; username: string; imageUrl: string | null };
  _count?: { comments: number };
  community?: { name: string; slug: string } | null;
};

export function PostCard({
  post,
  communitySlug,
  className,
}: {
  post: PostSummary;
  communitySlug?: string;
  className?: string;
}) {
  const href = communitySlug
    ? `/communities/${communitySlug}/posts/${post.id}`
    : `/posts/${post.id}`;

  return (
    <Link href={href}>
      <article
        className={cn(
          "rounded-lg border border-white/10 bg-black/45 p-5 transition hover:border-fuchsia/30 hover:bg-fuchsia/[0.04]",
          className,
        )}
      >
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={post.author.imageUrl ?? undefined} />
            <AvatarFallback>{post.author.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-white">{post.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{post.body}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
              <span>{post.author.displayName}</span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {post._count?.comments ?? 0}
              </span>
              <span className="flex items-center gap-1 text-emerald">
                <ThumbsUp className="h-3 w-3" />
                {post.score}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function VoteButtons({ postId, score }: { postId: string; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => votePostAction({ postId, vote: "UP" })}
        aria-label="Upvote"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <span className="text-sm text-emerald">{score}</span>
    </div>
  );
}
