"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createCommentAction } from "@/features/social/actions";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  author: { displayName: string; imageUrl: string | null };
  replies?: Comment[];
};

export function CommentThread({
  postId,
  comments,
}: {
  postId: string;
  comments: Comment[];
}) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createCommentAction({ postId, body, parentId: replyTo ?? undefined }),
    onSuccess: () => {
      setBody("");
      setReplyTo(null);
      void queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  function renderComment(comment: Comment, depth = 0) {
    return (
      <div key={comment.id} className={depth > 0 ? "ml-6 border-l border-white/10 pl-4" : ""}>
        <div className="flex gap-3 rounded-md border border-white/10 bg-white/[0.02] p-3">
          <Avatar className="h-7 w-7">
            <AvatarImage src={comment.author.imageUrl ?? undefined} />
            <AvatarFallback>{comment.author.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-xs font-medium text-white">{comment.author.displayName}</p>
            <p className="mt-1 text-sm text-zinc-400">{comment.body}</p>
            <button
              type="button"
              onClick={() => setReplyTo(comment.id)}
              className="mt-1 text-xs text-cyan hover:text-white"
            >
              Reply
            </button>
          </div>
        </div>
        {comment.replies?.map((r) => renderComment(r, depth + 1))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        {replyTo && (
          <p className="text-xs text-cyan">Replying to comment...</p>
        )}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
          rows={2}
        />
        <Button type="submit" size="sm" disabled={mutation.isPending || !body.trim()}>
          {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Comment
        </Button>
      </form>
      <div className="space-y-3">
        {comments.map((c) => renderComment(c))}
      </div>
    </div>
  );
}
