"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AudioLines,
  Bell,
  Bot,
  Disc3,
  Library,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Discover", href: "/", icon: Sparkles },
  { label: "Collection", href: "/collection", icon: Library },
  { label: "Communities", href: "/communities", icon: Users },
  { label: "Debates", href: "/debates", icon: MessageCircle },
  { label: "Knowledge", href: "/knowledge", icon: AudioLines },
  { label: "Admin", href: "/admin", icon: ShieldCheck },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  return (
    <main className="neon-grid min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,47,146,0.13),transparent_30%),radial-gradient(circle_at_bottom,rgba(118,242,179,0.12),transparent_34%),#050306]">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-white/10 bg-black/35 px-5 py-5 backdrop-blur-xl lg:border-b-0 lg:border-r">
          <Link href="/" className="flex items-center gap-3">
            <div className="record-grooves grid h-11 w-11 place-items-center rounded-full border border-cyan/25 shadow-[0_0_30px_rgba(34,211,238,0.22)]">
              <Disc3 className="h-5 w-5 text-emerald" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">VinylHub</p>
              <p className="text-xs text-cyan">Live vinyl intelligence</p>
            </div>
          </Link>

          <nav className="mt-8 grid gap-1">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-md border border-transparent px-3 text-left text-sm text-zinc-400 transition hover:border-cyan/20 hover:bg-white/[0.06] hover:text-white",
                    active &&
                      "border-emerald/25 bg-emerald/[0.09] text-white shadow-[0_0_28px_rgba(118,242,179,0.12)]",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/10 p-4 shadow-[0_0_40px_rgba(255,47,146,0.08)]">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald">
              <Bot className="h-4 w-4" />
              Neon concierge
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Search live vinyl, albums, artists, and tracks from Discogs and
              Spotify.
            </p>
          </div>
        </aside>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={submitSearch}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-cyan/20 bg-white/[0.055] px-3 py-2 shadow-[0_0_38px_rgba(34,211,238,0.08)]"
            >
              <Search className="h-4 w-4 shrink-0 text-cyan" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search vinyl, albums, artists, tracks..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </form>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button>
                <Plus className="h-4 w-4" />
                Add record
              </Button>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
