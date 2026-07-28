"use client";

import { useMemo } from "react";
import { Check, Heart, Library, Loader2, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CollectionActionStatus } from "@/features/collection/collection-types";
import type { CollectionRecord } from "@/features/collection/collection-types";
import { cn } from "@/lib/utils";

const statusLabels: Record<CollectionActionStatus, string> = {
  OWNED: "collection",
  WISHLIST: "wishlist",
  FAVORITE: "favorites",
  TRADE: "trade list",
  SELL: "for sale list",
};

async function fetchCollection() {
  const response = await fetch("/api/collection", {
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    return [] as CollectionRecord[];
  }

  const payload = (await response.json()) as
    | { items?: CollectionRecord[] }
    | null;

  return Array.isArray(payload?.items) ? payload.items : [];
}

async function saveRelease({
  releaseId,
  status,
}: {
  releaseId: string;
  status: CollectionActionStatus;
}) {
  let response: Response;

  try {
    response = await fetch("/api/collection", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "discogs",
        releaseId,
        status,
      }),
    });
  } catch {
    throw new Error(
      "Could not reach the server. Check your connection or sign in and try again.",
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Could not save release.");
  }

  return payload;
}

export function CollectionActionButtons({ releaseId }: { releaseId: string }) {
  const queryClient = useQueryClient();
  const { data: collectionData } = useQuery({
    queryKey: ["collection"],
    queryFn: fetchCollection,
    staleTime: 60_000,
  });

  const savedStatuses = useMemo(() => {
    const items = collectionData ?? [];

    return new Set(
      items
        .filter((item) => item.release.discogsId === releaseId)
        .map((item) => item.status),
    );
  }, [collectionData, releaseId]);

  const mutation = useMutation({
    mutationFn: saveRelease,
    onSuccess: async (_data, variables) => {
      toast.success(`Added to your ${statusLabels[variables.status]}.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["collection"] }),
        queryClient.invalidateQueries({ queryKey: ["collection-stats"] }),
      ]);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not save release.",
      );
    },
  });

  function action(status: CollectionActionStatus) {
    mutation.mutate({ releaseId, status });
  }

  const lastSavedStatus =
    mutation.variables?.status && mutation.isSuccess
      ? mutation.variables.status
      : null;

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        type="button"
        size="sm"
        onClick={() => action("OWNED")}
        disabled={mutation.isPending}
        className={cn(savedStatuses.has("OWNED") && "border-emerald/40 bg-emerald/15")}
      >
        {mutation.isPending && mutation.variables?.status === "OWNED" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : savedStatuses.has("OWNED") || lastSavedStatus === "OWNED" ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        Own
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => action("WISHLIST")}
        disabled={mutation.isPending}
        className={cn(savedStatuses.has("WISHLIST") && "border-cyan/40 bg-cyan/15")}
      >
        {mutation.isPending && mutation.variables?.status === "WISHLIST" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : savedStatuses.has("WISHLIST") || lastSavedStatus === "WISHLIST" ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Library className="h-3.5 w-3.5" />
        )}
        Wish
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => action("FAVORITE")}
        disabled={mutation.isPending}
        className={cn(
          savedStatuses.has("FAVORITE") && "border-fuchsia/40 bg-fuchsia/15 text-fuchsia",
        )}
        aria-label="Favorite release"
      >
        {mutation.isPending && mutation.variables?.status === "FAVORITE" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Heart
            className={cn(
              "h-3.5 w-3.5",
              (savedStatuses.has("FAVORITE") || lastSavedStatus === "FAVORITE") &&
                "fill-current",
            )}
          />
        )}
      </Button>
      {mutation.isError && (
        <p className="col-span-3 text-xs text-coral">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Save failed."}
        </p>
      )}
    </div>
  );
}
