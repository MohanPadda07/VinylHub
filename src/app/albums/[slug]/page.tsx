import Link from "next/link";
import { notFound } from "next/navigation";
import { Disc3, MessageCircle, Star, Tags } from "lucide-react";
import { AppShell } from "@/features/app-shell/app-shell";
import { AlbumTrackList } from "@/components/music";
import { AlbumReviews } from "@/features/catalog/album-reviews";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollectionActionButtons } from "@/features/search/collection-action-buttons";
import { prisma } from "@/lib/db/client";

function money(cents?: number | null, currency = "USD") {
  if (!cents) return "Value unknown";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await prisma.album.findUnique({
    where: { slug },
    include: {
      artist: true,
      genres: { include: { genre: true } },
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 3 },
      vinylReleases: {
        include: {
          label: true,
          priceSnapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
        },
        orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
      },
    },
  });

  if (!album) notFound();

  const primaryRelease = album.vinylReleases[0];
  const value = primaryRelease?.marketValueCents;

  const similarAlbums = await prisma.album.findMany({
    where: {
      id: { not: album.id },
      OR: [
        { styles: { hasSome: album.styles } },
        { artistId: album.artistId },
      ],
    },
    include: { artist: true },
    take: 6,
  });

  return (
    <AppShell>
      <div className="space-y-5 py-5">
        <section className="glass-border album-sheen grid gap-6 rounded-xl bg-panel/80 p-5 shadow-[0_0_60px_rgba(217,0,255,0.1),0_0_40px_rgba(0,242,255,0.08)] lg:grid-cols-[260px_1fr]">
          <div className="record-grooves aspect-square overflow-hidden rounded-lg border border-cyan/20 bg-black/70">
            {album.coverUrl && (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${album.coverUrl})` }}
              />
            )}
          </div>
          <div>
            <Badge className="border-emerald/25 bg-emerald/10 text-emerald">
              VinylHub album
            </Badge>
            <h1 className="mt-4 text-display text-white">{album.title}</h1>
            <Link
              href={`/artists/${album.artist.slug}`}
              className="mt-2 inline-flex text-lg text-cyan transition hover:text-white"
            >
              {album.artist.name}
            </Link>
            <div className="mt-5 flex flex-wrap gap-2">
              {[album.year, primaryRelease?.country, primaryRelease?.format]
                .filter(Boolean)
                .map((item) => (
                  <Badge key={String(item)} className="border-white/10 bg-white/[0.06]">
                    {item}
                  </Badge>
                ))}
              {album.genres.map(({ genre }) => (
                <Badge key={genre.id} className="border-cyan/20 bg-cyan/10 text-cyan">
                  {genre.name}
                </Badge>
              ))}
              {album.styles.map((style) => (
                <Badge key={style} className="border-fuchsia/20 bg-fuchsia/10 text-fuchsia">
                  {style}
                </Badge>
              ))}
            </div>
            {primaryRelease?.discogsId && (
              <div className="mt-5 max-w-xs">
                <CollectionActionButtons releaseId={primaryRelease.discogsId} />
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className="space-y-5">
            <Card className="border-amber/30 bg-amber/[0.05] shadow-[0_0_40px_rgba(255,176,134,0.1)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Disc3 className="h-4 w-4 text-amber drop-shadow-[0_0_8px_rgba(255,176,134,0.7)]" />
                  Tracklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlbumTrackList albumId={album.slug} />
              </CardContent>
            </Card>

            <Card className="border-cyan/30 bg-cyan/[0.06] shadow-[0_0_40px_rgba(0,242,255,0.1)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Disc3 className="h-4 w-4 text-cyan drop-shadow-[0_0_8px_rgba(0,242,255,0.7)]" />
                  Vinyl releases
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {album.vinylReleases.map((release) => (
                  <div
                    key={release.id}
                    className="rounded-xl border border-cyan/20 bg-cyan/[0.04] p-4 transition hover:border-fuchsia/30 hover:bg-fuchsia/[0.05]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{release.title}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {[release.label?.name, release.catalogNumber, release.country]
                            .filter(Boolean)
                            .join(" / ") || "Pressing details"}
                        </p>
                      </div>
                      <Badge className="border-emerald/20 bg-emerald/10 text-emerald">
                        {money(release.marketValueCents, release.marketCurrency)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {album.vinylReleases.length === 0 && (
                  <p className="text-sm text-zinc-400">No saved vinyl releases yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-fuchsia/30 bg-fuchsia/[0.06] shadow-[0_0_40px_rgba(217,0,255,0.12)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageCircle className="h-4 w-4 text-fuchsia drop-shadow-[0_0_8px_rgba(217,0,255,0.7)]" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlbumReviews albumSlug={album.slug} />
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-5">
            <Card className="border-emerald/30 bg-emerald/[0.06] shadow-[0_0_40px_rgba(0,242,255,0.12)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Star className="h-4 w-4 text-emerald drop-shadow-[0_0_8px_rgba(0,242,255,0.7)]" />
                  Marketplace signal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                <div className="flex justify-between">
                  <span>Current value</span>
                  <span className="text-emerald">{money(value)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Community rating</span>
                  <span>{album.communityRating?.toFixed(1) ?? "Not rated"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Catalog number</span>
                  <span>{primaryRelease?.catalogNumber ?? "Unknown"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber/30 bg-amber/[0.06] shadow-[0_0_40px_rgba(255,176,134,0.12)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Tags className="h-4 w-4 text-amber drop-shadow-[0_0_8px_rgba(255,176,134,0.7)]" />
                  Similar albums
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {similarAlbums.length === 0 ? (
                  <p className="text-sm text-zinc-400">No similar albums yet.</p>
                ) : (
                  similarAlbums.map((similar) => (
                    <Link
                      key={similar.id}
                      href={`/albums/${similar.slug}`}
                      className="block rounded-md border border-white/10 bg-white/[0.03] p-3 transition hover:border-cyan/30 hover:bg-cyan/[0.05]"
                    >
                      <p className="text-sm font-medium text-white">{similar.title}</p>
                      <p className="text-xs text-zinc-400">{similar.artist.name}</p>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
