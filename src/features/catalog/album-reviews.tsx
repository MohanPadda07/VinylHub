"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Review = {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  user: { displayName: string; imageUrl: string | null; username: string };
};

export function AlbumReviews({ albumSlug }: { albumSlug: string }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["album-reviews", albumSlug],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?albumSlug=${albumSlug}`);
      if (!res.ok) return { reviews: [] };
      return res.json() as Promise<{ reviews: Review[] }>;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumSlug, rating, body }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      return res.json();
    },
    onSuccess: () => {
      setBody("");
      void queryClient.invalidateQueries({ queryKey: ["album-reviews", albumSlug] });
    },
  });

  const reviews = data?.reviews ?? [];

  return (
    <div className="space-y-6">
      <form
        className="space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <p className="text-sm font-medium text-white">Write a review</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`Rate ${n} stars`}
            >
              <Star
                className={`h-5 w-5 ${n <= rating ? "fill-amber text-amber" : "text-zinc-600"}`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          rows={3}
        />
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Submit review
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-zinc-400">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={review.user.imageUrl ?? undefined} />
                <AvatarFallback>{review.user.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {review.user.displayName}
                  </span>
                  <span className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber text-amber" />
                    ))}
                  </span>
                </div>
                {review.body && (
                  <p className="mt-1 text-sm text-zinc-400">{review.body}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
