"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(118,242,179,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,127,110,0.11),transparent_28%),#070807]">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-white/10 bg-black/20 px-5 py-5 backdrop-blur lg:border-b-0 lg:border-r">
          <Link href="/" className="flex items-center gap-3">
            <div className="record-grooves grid h-11 w-11 place-items-center rounded-full border border-white/15">
              <Disc3 className="h-5 w-5 text-emerald" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">VinylHub</p>
              <p className="text-xs text-muted">Social music intelligence</p>
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
                    "flex h-11 items-center gap-3 rounded-md px-3 text-left text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-white",
                    active && "bg-white/[0.08] text-white",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-lg border border-emerald/20 bg-emerald/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald">
              <Bot className="h-4 w-4" />
              AI concierge
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Your taste graph is ready to power daily discoveries, debate
              briefs, and collecting roadmaps.
            </p>
          </div>
        </aside>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-zinc-500" />
              <span className="truncate text-sm text-zinc-400">
                Search albums, artists, vinyl, users, reviews, lists, debates
              </span>
            </div>
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
