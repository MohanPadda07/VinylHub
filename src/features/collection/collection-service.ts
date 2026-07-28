import { CollectionStatus, type Prisma } from "@prisma/client";
import { getDiscogsRelease, getDiscogsReleaseTracks } from "@/lib/integrations/discogs";
import type { VinylReleaseSearchResult } from "@/lib/integrations/music-types";
import { persistAlbumTracks } from "@/lib/catalog/track-sync";
import { prisma } from "@/lib/db/client";
import { stableSlug } from "@/lib/slug";
import type {
  CollectionActionStatus,
  CollectionRecord,
  CollectionStats,
} from "@/features/collection/collection-types";

const collectionInclude = {
  vinylRelease: {
    include: {
      label: true,
      album: {
        include: {
          artist: true,
        },
      },
    },
  },
} satisfies Prisma.CollectionItemInclude;

type CollectionItemWithRelations = Prisma.CollectionItemGetPayload<{
  include: typeof collectionInclude;
}>;

export const actionableStatuses: CollectionActionStatus[] = [
  "OWNED",
  "WISHLIST",
  "FAVORITE",
  "TRADE",
  "SELL",
];

function centsFromMaybe(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null;
}

export function serializeCollectionItem(
  item: CollectionItemWithRelations,
): CollectionRecord {
  const release = item.vinylRelease;
  const album = release.album;

  return {
    id: item.id,
    status: item.status,
    notes: item.notes,
    mediaCondition: item.mediaCondition,
    sleeveCondition: item.sleeveCondition,
    createdAt: item.createdAt.toISOString(),
    album: {
      title: album.title,
      slug: album.slug,
      year: album.year,
      coverUrl: album.coverUrl,
      styles: album.styles,
      artist: {
        name: album.artist.name,
        slug: album.artist.slug,
        imageUrl: album.artist.imageUrl,
      },
    },
    release: {
      id: release.id,
      title: release.title,
      discogsId: release.discogsId,
      country: release.country,
      releaseYear: release.releaseYear,
      format: release.format,
      catalogNumber: release.catalogNumber,
      marketValueCents: release.marketValueCents,
      marketCurrency: release.marketCurrency,
      label: release.label
        ? {
            name: release.label.name,
            slug: release.label.slug,
          }
        : null,
    },
  };
}

export async function persistDiscogsRelease(release: VinylReleaseSearchResult) {
  const year = release.year ? Number.parseInt(release.year, 10) : null;
  const artistSlug = stableSlug(release.artist);
  const albumSlug = stableSlug(release.artist, release.title, year ?? release.id);
  const labelName = release.label?.split(",")[0]?.trim();
  const labelSlug = labelName ? stableSlug(labelName) : null;
  const marketValueCents = centsFromMaybe(release.marketValueCents);

  const artist = await prisma.artist.upsert({
    where: { slug: artistSlug },
    update: {
      imageUrl: release.imageUrl,
      genres: release.genres ?? [],
    },
    create: {
      name: release.artist,
      slug: artistSlug,
      imageUrl: release.imageUrl,
      genres: release.genres ?? [],
    },
  });

  const album = await prisma.album.upsert({
    where: { slug: albumSlug },
    update: {
      coverUrl: release.imageUrl,
      year: Number.isFinite(year) ? year : null,
      styles: release.styles ?? [],
    },
    create: {
      title: release.title,
      slug: albumSlug,
      year: Number.isFinite(year) ? year : null,
      coverUrl: release.imageUrl,
      styles: release.styles ?? [],
      artistId: artist.id,
    },
  });

  const label = labelName
    ? await prisma.label.upsert({
        where: { slug: labelSlug ?? stableSlug(labelName) },
        update: {},
        create: {
          name: labelName,
          slug: labelSlug ?? stableSlug(labelName),
          country: release.country,
        },
      })
    : null;

  const vinylRelease = await prisma.vinylRelease.upsert({
    where: { discogsId: release.id },
    update: {
      title: release.title,
      country: release.country,
      releaseYear: Number.isFinite(year) ? year : null,
      format: release.format ?? "Vinyl",
      catalogNumber: release.catalogNumber,
      marketValueCents,
      marketCurrency: "USD",
      labelId: label?.id,
      albumId: album.id,
    },
    create: {
      discogsId: release.id,
      title: release.title,
      country: release.country,
      releaseYear: Number.isFinite(year) ? year : null,
      format: release.format ?? "Vinyl",
      catalogNumber: release.catalogNumber,
      marketValueCents,
      marketCurrency: "USD",
      labelId: label?.id,
      albumId: album.id,
    },
  });

  if (marketValueCents) {
    await prisma.priceSnapshot.create({
      data: {
        vinylReleaseId: vinylRelease.id,
        lowCents: release.lowValueCents ?? marketValueCents,
        medianCents: marketValueCents,
        highCents: release.highValueCents ?? marketValueCents,
        currency: "USD",
        source: "discogs",
      },
    });
  }

  try {
    const existingTrackCount = await prisma.track.count({
      where: { albumId: album.id },
    });

    if (existingTrackCount === 0) {
      const discogsTracks = await getDiscogsReleaseTracks(release.id);

      if (discogsTracks.length > 0) {
        await persistAlbumTracks(
          album.id,
          discogsTracks.map((track) => ({
            position: track.position,
            title: track.title,
            duration: track.duration ?? null,
          })),
        );
      }
    }
  } catch {
    // Track sync is best-effort when cataloging a vinyl release.
  }

  return vinylRelease;
}

export async function createCollectionItemFromDiscogs({
  userId,
  discogsId,
  status,
}: {
  userId: string;
  discogsId: string;
  status: CollectionActionStatus;
}) {
  const release = await getDiscogsRelease(discogsId);
  const vinylRelease = await persistDiscogsRelease(release);

  const item = await prisma.collectionItem.upsert({
    where: {
      userId_vinylReleaseId_status: {
        userId,
        vinylReleaseId: vinylRelease.id,
        status,
      },
    },
    update: {},
    create: {
      userId,
      vinylReleaseId: vinylRelease.id,
      status,
    },
    include: collectionInclude,
  });

  await prisma.activity.create({
    data: {
      userId,
      type:
        status === CollectionStatus.WISHLIST
          ? "WISHLIST_ADD"
          : status === CollectionStatus.FAVORITE
            ? "FAVORITE_ADD"
            : "COLLECTION_ADD",
      targetType: "vinylRelease",
      targetId: vinylRelease.id,
      metadata: {
        status,
        discogsId,
      },
    },
  });

  return serializeCollectionItem(item);
}

export async function listCollectionItems(userId: string) {
  const items = await prisma.collectionItem.findMany({
    where: { userId },
    include: collectionInclude,
    orderBy: { createdAt: "desc" },
  });

  return items.map(serializeCollectionItem);
}

export async function updateCollectionItem({
  id,
  userId,
  data,
}: {
  id: string;
  userId: string;
  data: {
    status?: CollectionActionStatus;
    notes?: string | null;
    mediaCondition?: string | null;
    sleeveCondition?: string | null;
  };
}) {
  const existing = await prisma.collectionItem.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Collection item not found.");
  }

  const item = await prisma.collectionItem.update({
    where: { id },
    data,
    include: collectionInclude,
  });

  return serializeCollectionItem(item);
}

export async function deleteCollectionItem(id: string, userId: string) {
  const existing = await prisma.collectionItem.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Collection item not found.");
  }

  const item = await prisma.collectionItem.delete({
    where: { id },
    include: collectionInclude,
  });

  await prisma.activity.create({
    data: {
      userId,
      type: "COLLECTION_REMOVE",
      targetType: "collectionItem",
      targetId: item.id,
      metadata: {
        title: item.vinylRelease.title,
      },
    },
  });

  return serializeCollectionItem(item);
}

export async function getCollectionStats(userId: string): Promise<CollectionStats> {
  const records = await listCollectionItems(userId);
  const ownedRecords = records.filter((record) => record.status === "OWNED");
  const valuedRecords = ownedRecords.filter(
    (record) => typeof record.release.marketValueCents === "number",
  );
  const totalValueCents = valuedRecords.reduce(
    (sum, record) => sum + (record.release.marketValueCents ?? 0),
    0,
  );
  const statusCounts = records.reduce<Record<string, number>>((counts, record) => {
    counts[record.status] = (counts[record.status] ?? 0) + 1;
    return counts;
  }, {});
  const byArtist = valuedRecords.reduce<Record<string, number>>((totals, record) => {
    totals[record.album.artist.name] =
      (totals[record.album.artist.name] ?? 0) +
      (record.release.marketValueCents ?? 0);
    return totals;
  }, {});

  const genreCounts = records.reduce<Record<string, number>>((counts, record) => {
    for (const style of record.album.styles ?? []) {
      counts[style] = (counts[style] ?? 0) + 1;
    }
    return counts;
  }, {});

  const years = ownedRecords
    .map((r) => r.album.year)
    .filter((y): y is number => typeof y === "number");
  const averageYear = years.length
    ? Math.round(years.reduce((a, b) => a + b, 0) / years.length)
    : null;

  const growthByMonth = records.reduce<Record<string, number>>((acc, record) => {
    const month = record.createdAt.slice(0, 7);
    acc[month] = (acc[month] ?? 0) + 1;
    return acc;
  }, {});

  const topAlbums = [...valuedRecords]
    .sort((a, b) => (b.release.marketValueCents ?? 0) - (a.release.marketValueCents ?? 0))
    .slice(0, 5)
    .map((r) => ({
      title: r.album.title,
      slug: r.album.slug,
      valueCents: r.release.marketValueCents ?? 0,
    }));

  return {
    totalValueCents,
    recordCount: ownedRecords.length,
    totalItems: records.length,
    averageValueCents: valuedRecords.length
      ? Math.round(totalValueCents / valuedRecords.length)
      : 0,
    averageYear,
    genreDistribution: Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    growthByMonth: Object.entries(growthByMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    topAlbums,
    highestValueRecord: [...valuedRecords].sort(
      (a, b) => (b.release.marketValueCents ?? 0) - (a.release.marketValueCents ?? 0),
    )[0],
    lowestValueRecord: [...valuedRecords].sort(
      (a, b) => (a.release.marketValueCents ?? 0) - (b.release.marketValueCents ?? 0),
    )[0],
    mostValuableArtist: Object.entries(byArtist)
      .sort((a, b) => b[1] - a[1])
      .map(([name, valueCents]) => ({ name, valueCents }))[0],
    statusCounts,
  };
}
