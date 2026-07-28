"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownAZ,
  ArrowUpDown,
  BadgeDollarSign,
  Disc3,
  Grid3X3,
  Heart,
  List,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  CollectionRecord,
  CollectionStats,
} from "@/features/collection/collection-types";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const AnalyticsDashboard = dynamic(
  () =>
    import("@/features/collection/analytics-dashboard").then((m) => ({
      default: m.AnalyticsDashboard,
    })),
  {
    loading: () => <Skeleton className="h-48 w-full rounded-lg" />,
  },
);
import { cn } from "@/lib/utils";

type CollectionResponse = {
  items: CollectionRecord[];
  error?: string;
};

type StatsResponse = {
  stats: CollectionStats;
  error?: string;
};

type ViewMode = "grid" | "list";
type StatusFilter = "ALL" | "OWNED" | "WISHLIST" | "FAVORITE" | "TRADE" | "SELL";
type SortMode = "recent" | "value" | "artist" | "year";

const statusFilters: StatusFilter[] = [
  "ALL",
  "OWNED",
  "WISHLIST",
  "FAVORITE",
  "TRADE",
  "SELL",
];

const sortLabels: Record<SortMode, string> = {
  recent: "Recently added",
  value: "Value",
  artist: "Artist",
  year: "Release year",
};

function money(cents?: number | null, currency = "USD") {
  if (typeof cents !== "number") {
    return "Unknown";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

async function fetchCollection() {
  const response = await fetch("/api/collection", { cache: "no-store" });
  const data = (await response.json()) as CollectionResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Could not load collection.");
  }

  return Array.isArray(data.items) ? data.items : [];
}

async function fetchStats() {
  const response = await fetch("/api/collection/stats", { cache: "no-store" });
  const data = (await response.json()) as StatsResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Could not load collection stats.");
  }

  return data.stats;
}

export function CollectionWorkspace() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [query, setQuery] = useState("");

  const collectionQuery = useQuery({
    queryKey: ["collection"],
    queryFn: fetchCollection,
  });

  const statsQuery = useQuery({
    queryKey: ["collection-stats"],
    queryFn: fetchStats,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/collection/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { item?: CollectionRecord; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not remove record.");
      }

      return data.item;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["collection"] });
      const previous = queryClient.getQueryData<CollectionRecord[]>(["collection"]);
      queryClient.setQueryData<CollectionRecord[]>(["collection"], (items = []) =>
        items.filter((item) => item.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(["collection"], context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["collection"] });
      void queryClient.invalidateQueries({ queryKey: ["collection-stats"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: Exclude<StatusFilter, "ALL">;
    }) => {
      const response = await fetch(`/api/collection/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as { item?: CollectionRecord; error?: string };

      if (!response.ok || !data.item) {
        throw new Error(data.error ?? "Could not update record.");
      }

      return data.item;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["collection"] });
      const previous = queryClient.getQueryData<CollectionRecord[]>(["collection"]);
      queryClient.setQueryData<CollectionRecord[]>(["collection"], (items = []) =>
        items.map((item) => (item.id === id ? { ...item, status } : item)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["collection"], context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["collection"] });
      void queryClient.invalidateQueries({ queryKey: ["collection-stats"] });
    },
  });

  const records = Array.isArray(collectionQuery.data) ? collectionQuery.data : [];
  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records
      .filter((record) =>
        statusFilter === "ALL" ? true : record.status === statusFilter,
      )
      .filter((record) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          record.album.title,
          record.album.artist.name,
          record.release.label?.name,
          record.release.country,
          record.release.format,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sortMode === "value") {
          return (
            (b.release.marketValueCents ?? -1) -
            (a.release.marketValueCents ?? -1)
          );
        }

        if (sortMode === "artist") {
          return a.album.artist.name.localeCompare(b.album.artist.name);
        }

        if (sortMode === "year") {
          return (b.release.releaseYear ?? 0) - (a.release.releaseYear ?? 0);
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [query, records, sortMode, statusFilter]);

  const stats = statsQuery.data;
  const unknownValues = records.filter(
    (record) => typeof record.release.marketValueCents !== "number",
  ).length;

  return (
    <div className="space-y-5 py-5">
      <section className="glass-border overflow-hidden rounded-xl bg-panel/80 p-5 shadow-[0_0_50px_rgba(0,242,255,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="border-emerald/35 bg-emerald/15 text-emerald shadow-[0_0_18px_rgba(0,242,255,0.2)]">
              Collection
            </Badge>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Your vinyl{" "}
              <span className="brand-gradient-text">command room.</span>
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-300">
              Track ownership, wishlist intent, favorites, value signals, and
              collection movement from one private workspace.
            </p>
          </div>
          <Button asChild className="w-full lg:w-auto">
            <Link href="/search?q=radiohead%20vinyl">
              <Sparkles className="h-4 w-4" />
              Find records
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Owned records"
          value={stats?.recordCount.toString() ?? "..."}
          icon={Disc3}
          tone="text-cyan"
        />
        <MetricCard
          label="Estimated value"
          value={money(stats?.totalValueCents)}
          icon={BadgeDollarSign}
          tone="text-emerald"
        />
        <MetricCard
          label="Average value"
          value={money(stats?.averageValueCents)}
          icon={ArrowUpDown}
          tone="text-amber"
        />
        <MetricCard
          label="Most valuable artist"
          value={stats?.mostValuableArtist?.name ?? "Unknown"}
          icon={Star}
          tone="text-coral"
        />
      </div>

      {stats && <AnalyticsDashboard stats={stats} />}

      <Card className="border-white/10 bg-black/35">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-cyan/15 bg-white/[0.045] px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-cyan" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by artist, title, label, format..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentButton
                active={viewMode === "grid"}
                label="Grid view"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </SegmentButton>
              <SegmentButton
                active={viewMode === "list"}
                label="List view"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </SegmentButton>
              <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-zinc-300">
                <SlidersHorizontal className="h-4 w-4 text-emerald" />
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  className="bg-transparent text-sm text-white outline-none"
                >
                  {Object.entries(sortLabels).map(([value, label]) => (
                    <option key={value} value={value} className="bg-zinc-950">
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {statusFilters.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-medium transition",
                  statusFilter === status
                    ? "border-emerald/45 bg-emerald/20 text-emerald shadow-[0_0_20px_rgba(0,242,255,0.22)]"
                    : "border-fuchsia/20 bg-fuchsia/[0.05] text-zinc-400 hover:border-cyan/35 hover:text-cyan",
                )}
              >
                {status === "ALL"
                  ? `All (${records.length})`
                  : `${status} (${stats?.statusCounts[status] ?? 0})`}
              </button>
            ))}
          </div>

          {unknownValues > 0 ? (
            <p className="rounded-md border border-amber/15 bg-amber/[0.06] px-3 py-2 text-sm text-amber">
              {unknownValues} record{unknownValues === 1 ? "" : "s"} have partial
              marketplace data, so value totals are conservative.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {collectionQuery.isLoading ? (
        <CollectionSkeleton />
      ) : collectionQuery.isError ? (
        <EmptyPanel
          title="Collection could not load"
          description={
            collectionQuery.error instanceof Error
              ? collectionQuery.error.message
              : "Try again after signing in."
          }
        />
      ) : filteredRecords.length === 0 ? (
        <EmptyPanel
          title={records.length ? "No records match this view" : "Start your collection"}
          description={
            records.length
              ? "Adjust your filters or search terms to bring records back."
              : "Search live Discogs vinyl results and save owned records, wishlist items, favorites, trades, or sell candidates."
          }
          action={
            <Button asChild>
              <Link href="/search?q=daft%20punk%20vinyl">
                <Search className="h-4 w-4" />
                Search vinyl
              </Link>
            </Button>
          }
        />
      ) : (
        <div
          className={cn(
            "grid gap-4",
            viewMode === "grid"
              ? "sm:grid-cols-2 xl:grid-cols-3"
              : "grid-cols-1",
          )}
        >
          {filteredRecords.map((record) => (
            <CollectionCard
              key={record.id}
              deleting={deleteMutation.isPending}
              record={record}
              viewMode={viewMode}
              onDelete={() => deleteMutation.mutate(record.id)}
              onStatusChange={(status) =>
                updateStatusMutation.mutate({ id: record.id, status })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof Disc3;
  label: string;
  tone: string;
  value: string;
}) {
  return (
    <Card className={cn("border bg-panel/70 backdrop-blur-sm", tone.includes("cyan") && "border-cyan/30 bg-cyan/[0.06] shadow-[0_0_28px_rgba(0,242,255,0.1)]", tone.includes("emerald") && "border-emerald/30 bg-emerald/[0.06] shadow-[0_0_28px_rgba(0,242,255,0.1)]", tone.includes("amber") && "border-amber/30 bg-amber/[0.06] shadow-[0_0_28px_rgba(255,176,134,0.1)]", tone.includes("coral") && "border-coral/30 bg-coral/[0.06] shadow-[0_0_28px_rgba(255,140,105,0.1)]")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">{label}</p>
          <Icon className={cn("h-4 w-4", tone)} />
        </div>
        <p className="mt-2 truncate text-2xl font-semibold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

function SegmentButton({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-md border transition",
        active
          ? "border-cyan/35 bg-cyan/15 text-cyan"
          : "border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function CollectionCard({
  deleting,
  onDelete,
  onStatusChange,
  record,
  viewMode,
}: {
  deleting: boolean;
  onDelete: () => void;
  onStatusChange: (status: Exclude<StatusFilter, "ALL">) => void;
  record: CollectionRecord;
  viewMode: ViewMode;
}) {
  const compact = viewMode === "list";

  return (
    <Card
      className={cn(
        "group overflow-hidden border-cyan/20 bg-panel/70 transition hover:border-fuchsia/40 hover:bg-fuchsia/[0.05] hover:shadow-[0_0_36px_rgba(217,0,255,0.12)]",
        compact && "sm:flex",
      )}
    >
      <Link
        href={`/albums/${record.album.slug}`}
        className={cn(
          "relative block aspect-square overflow-hidden bg-zinc-950",
          compact && "sm:h-40 sm:w-40 sm:shrink-0",
        )}
      >
        {record.album.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            src={record.album.coverUrl}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <Disc3 className="h-12 w-12 text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
          <Badge className="border-emerald/25 bg-black/55 text-emerald">
            {record.status}
          </Badge>
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-w-0">
          <Link
            href={`/albums/${record.album.slug}`}
            className="line-clamp-2 text-base font-semibold text-white transition hover:text-emerald"
          >
            {record.album.title}
          </Link>
          <Link
            href={`/artists/${record.album.artist.slug}`}
            className="mt-1 block truncate text-sm text-zinc-400 transition hover:text-cyan"
          >
            {record.album.artist.name}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
          <InfoPill label="Value" value={money(record.release.marketValueCents)} />
          <InfoPill label="Year" value={record.release.releaseYear ?? "Unknown"} />
          <InfoPill label="Format" value={record.release.format || "Vinyl"} />
          <InfoPill label="Label" value={record.release.label?.name ?? "Unknown"} />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onStatusChange("FAVORITE")}
          >
            <Heart className="h-4 w-4" />
            Favorite
          </Button>
          <label className="flex h-9 items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3 text-sm text-zinc-300">
            <ArrowDownAZ className="h-4 w-4 text-cyan" />
            <select
              value={record.status}
              onChange={(event) =>
                onStatusChange(event.target.value as Exclude<StatusFilter, "ALL">)
              }
              className="bg-transparent text-white outline-none"
            >
              {statusFilters
                .filter((status) => status !== "ALL")
                .map((status) => (
                  <option key={status} value={status} className="bg-zinc-950">
                    {status}
                  </option>
                ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={deleting}
            onClick={onDelete}
            aria-label={`Remove ${record.album.title}`}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-black/20 p-2">
      <p className="text-[11px] uppercase text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-zinc-200">{value}</p>
    </div>
  );
}

function CollectionSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden bg-white/[0.04]">
          <div className="aspect-square animate-pulse bg-white/[0.06]" />
          <CardContent className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.08]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-12 animate-pulse rounded bg-white/[0.06]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyPanel({
  action,
  description,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card className="bg-white/[0.04]">
      <CardContent className="grid min-h-72 place-items-center p-8 text-center">
        <div className="max-w-md">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-cyan/20 bg-cyan/[0.08] text-cyan">
            <Disc3 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
          {action ? <div className="mt-5">{action}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
