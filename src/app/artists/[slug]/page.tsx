import Link from "next/link";
import { notFound } from "next/navigation";
import { Disc3, Mic2, Radio, Users } from "lucide-react";
import { AppShell } from "@/features/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/client";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await prisma.artist.findUnique({
    where: { slug },
    include: {
      albums: {
        include: {
          vinylReleases: { include: { label: true } },
          tracks: { orderBy: { position: "asc" }, take: 5 },
        },
        orderBy: [{ year: "desc" }, { title: "asc" }],
      },
      communities: true,
    },
  });

  if (!artist) notFound();

  const popularTracks = artist.albums.flatMap((a) =>
    a.tracks.map((t) => ({ ...t, albumTitle: a.title, coverUrl: a.coverUrl })),
  ).slice(0, 8);

  const relatedArtists = artist.genres.length
    ? await prisma.artist.findMany({
        where: {
          id: { not: artist.id },
          genres: { hasSome: artist.genres },
        },
        take: 6,
      })
    : [];

  const albumCount = artist.albums.length;
  const avgRating =
    artist.albums.reduce((sum, a) => sum + (a.communityRating ?? 0), 0) /
    (artist.albums.filter((a) => a.communityRating).length || 1);

  return (
    <AppShell>
      <div className="space-y-5 py-5">
        <section className="glass-border grid gap-6 rounded-lg bg-black/55 p-5 lg:grid-cols-[220px_1fr]">
          <div className="aspect-square overflow-hidden rounded-lg border border-coral/20 bg-black/70">
            {artist.imageUrl ? (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${artist.imageUrl})` }}
              />
            ) : (
              <div className="record-grooves h-full w-full" />
            )}
          </div>
          <div>
            <Badge className="border-coral/25 bg-coral/10 text-coral">
              VinylHub artist
            </Badge>
            <h1 className="mt-4 text-display text-white">{artist.name}</h1>
            <p className="mt-3 max-w-3xl text-body text-zinc-400">
              {artist.bio ?? `${artist.name} on VinylHub — explore their discography and community.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[artist.country, artist.startedYear].filter(Boolean).map((item) => (
                <Badge key={String(item)} className="border-white/10 bg-white/[0.06]">
                  {item}
                </Badge>
              ))}
              {artist.genres.map((genre) => (
                <Badge key={genre} className="border-cyan/20 bg-cyan/10 text-cyan">
                  {genre}
                </Badge>
              ))}
            </div>
            <div className="mt-5 flex gap-6 text-sm text-zinc-400">
              <span>{albumCount} albums</span>
              {avgRating > 0 && <span>{avgRating.toFixed(1)} avg rating</span>}
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <Card className="border-cyan/10 bg-black/45">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Radio className="h-4 w-4 text-cyan" />
                Discography
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {artist.albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/albums/${album.slug}`}
                  className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 transition hover:border-cyan/30 hover:bg-cyan/[0.06]"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/50">
                    {album.coverUrl ? (
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${album.coverUrl})` }}
                      />
                    ) : (
                      <div className="record-grooves h-full w-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{album.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {[album.year, `${album.vinylReleases.length} pressings`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </Link>
              ))}
              {artist.albums.length === 0 && (
                <p className="text-sm text-zinc-400">No albums in catalog yet.</p>
              )}
            </CardContent>
          </Card>

          <aside className="space-y-5">
            <Card className="border-coral/10 bg-black/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Mic2 className="h-4 w-4 text-coral" />
                  Popular tracks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {popularTracks.length === 0 ? (
                  <p className="text-sm text-zinc-400">Tracks appear as albums are enriched.</p>
                ) : (
                  popularTracks.map((track) => (
                    <div
                      key={track.id}
                      className="rounded-md border border-white/10 bg-white/[0.03] p-2"
                    >
                      <p className="text-sm text-white">{track.title}</p>
                      <p className="text-xs text-zinc-500">{track.albumTitle}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald/10 bg-black/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-4 w-4 text-emerald" />
                  Related artists
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedArtists.length === 0 ? (
                  <p className="text-sm text-zinc-400">No related artists yet.</p>
                ) : (
                  relatedArtists.map((related) => (
                    <Link
                      key={related.id}
                      href={`/artists/${related.slug}`}
                      className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] p-2 transition hover:border-emerald/30"
                    >
                      <Disc3 className="h-4 w-4 text-emerald" />
                      <span className="text-sm text-white">{related.name}</span>
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
