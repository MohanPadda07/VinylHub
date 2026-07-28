# VinylHub

VinylHub is a premium social platform for music lovers and vinyl collectors. Search live music data, manage your collection, join communities, debate pressing quality, and explore your catalog — all in one neon-dark experience.

## Features

- **Live search** — Discogs vinyl + Spotify albums, artists, tracks
- **30-second previews** — Deezer-powered previews with global mini player (single-play, keyboard Space)
- **Collection workspace** — Own, wishlist, favorite, trade, sell with value tracking
- **Album & artist pages** — Internal catalog with tracklists, reviews, similar albums
- **Global preview player** — Persistent mini player with waveform, volume, Spotify links
- **Communities & debates** — Posts, comments, voting, arguments
- **Friends** — Requests, followers, activity
- **Notifications** — Grouped notification center with unread badges
- **Collection analytics** — Genre distribution, growth charts, top albums
- **Knowledge hub** — Genre explorer

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4, shadcn/ui, Framer Motion, anime.js
- **State:** TanStack Query, Preview Audio Context
- **Auth:** Clerk
- **Database:** PostgreSQL + Prisma 7
- **APIs:** Discogs, Spotify, Deezer, MusicBrainz

## Getting Started

```bash
npm install
cp .env.example .env.local  # configure keys below
npm run db:push
npm run db:generate
npx tsx prisma/seed.ts      # optional sample data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `VINYLHUB_OWNER_EMAIL` | Owner email for private access gate |
| `DISCOGS_USER_TOKEN` | Discogs API token |
| `SPOTIFY_CLIENT_ID` | Spotify client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify client secret |
| `MUSICBRAINZ_USER_AGENT` | Contactable User-Agent for MusicBrainz/Deezer |

Deezer previews use the public Deezer API (no API key required).

## Music Preview Architecture

```
src/lib/services/music/   # Server-only integrations + musicService.getAlbum()
src/app/api/music/album   # Cached normalized album + track previews
src/components/music/     # AlbumTrackList, TrackPreviewPlayer, MiniPlayer, Context
```

## Project Structure

```
src/
├── app/              # Routes and API handlers
├── components/
│   ├── ui/           # shadcn primitives
│   ├── music/        # Preview player system
│   └── vinyl/        # Domain design system
├── features/         # Feature modules
├── hooks/            # Shared React Query hooks
├── lib/
│   ├── integrations/ # Low-level Discogs/Spotify clients
│   └── services/music/ # Unified music service layer
└── stores/           # Zustand stores
design-system/vinylhub/MASTER.md  # Design tokens
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema |
| `npm run db:studio` | Open Prisma Studio |

## License

MIT
