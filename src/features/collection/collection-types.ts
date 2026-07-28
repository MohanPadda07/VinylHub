import type { CollectionStatus } from "@prisma/client";

export type CollectionActionStatus = Extract<
  CollectionStatus,
  "OWNED" | "WISHLIST" | "FAVORITE" | "TRADE" | "SELL"
>;

export type CollectionRecord = {
  id: string;
  status: CollectionStatus;
  notes?: string | null;
  mediaCondition?: string | null;
  sleeveCondition?: string | null;
  createdAt: string;
  album: {
    title: string;
    slug: string;
    year?: number | null;
    coverUrl?: string | null;
    styles?: string[];
    artist: {
      name: string;
      slug: string;
      imageUrl?: string | null;
    };
  };
  release: {
    id: string;
    title: string;
    discogsId?: string | null;
    country?: string | null;
    releaseYear?: number | null;
    format: string;
    catalogNumber?: string | null;
    marketValueCents?: number | null;
    marketCurrency: string;
    label?: {
      name: string;
      slug: string;
    } | null;
  };
};

export type CollectionStats = {
  totalValueCents: number;
  recordCount: number;
  totalItems: number;
  averageValueCents: number;
  averageYear: number | null;
  genreDistribution: Array<{ genre: string; count: number }>;
  growthByMonth: Array<{ month: string; count: number }>;
  topAlbums: Array<{ title: string; slug: string; valueCents: number }>;
  highestValueRecord?: CollectionRecord;
  lowestValueRecord?: CollectionRecord;
  mostValuableArtist?: {
    name: string;
    valueCents: number;
  };
  statusCounts: Record<string, number>;
};
