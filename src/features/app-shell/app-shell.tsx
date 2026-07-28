"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  AudioLines,
  ChevronLeft,
  ChevronRight,
  Library,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandSearch } from "@/features/search/command-search";
import { NotificationCenter } from "@/features/notifications/notification-center";
import { MiniPlayer, PreviewAudioProvider } from "@/components/music";
import { useCurrentUser, isStaffRole } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";

const primaryNav = [
  { label: "Discover", href: "/", icon: Sparkles },
  { label: "Search", href: "/search", icon: Search },
  { label: "Collection", href: "/collection", icon: Library },
  { label: "Community", href: "/communities", icon: Users },
  { label: "Profile", href: "/profile", icon: User },
];

const overflowNav = [
  { label: "Debates", href: "/debates", icon: MessageCircle },
  { label: "Friends", href: "/friends", icon: Users },
  { label: "Knowledge", href: "/knowledge", icon: AudioLines },
  { label: "Admin", href: "/admin", icon: ShieldCheck, staffOnly: true },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex h-11 items-center gap-3 rounded-lg border border-transparent px-3 text-sm text-zinc-400 transition-base hover:border-fuchsia/25 hover:bg-fuchsia/[0.07] hover:text-white",
        active &&
          "border-emerald/40 bg-emerald/[0.12] text-emerald shadow-[0_0_28px_rgba(0,242,255,0.22)]",
        collapsed && "justify-center px-0",
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: user } = useCurrentUser();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const visibleOverflow = overflowNav.filter(
    (item) => !item.staffOnly || isStaffRole(user?.role),
  );

  const allDesktopNav = [
    ...primaryNav.filter((n) => n.href !== "/profile"),
    ...visibleOverflow,
  ];

  return (
    <PreviewAudioProvider>
    <main className="neon-grid min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,242,255,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(217,0,255,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(138,43,226,0.14),transparent_36%),#080a1a]">
      <CommandSearch open={commandOpen} onOpenChange={setCommandOpen} />
      <MiniPlayer />

      <div
        className={cn(
          "mx-auto grid min-h-screen max-w-[1500px] transition-[grid-template-columns] duration-200",
          sidebarCollapsed
            ? "grid-cols-1 lg:grid-cols-[72px_1fr]"
            : "grid-cols-1 lg:grid-cols-[260px_1fr]",
        )}
      >
        {/* Desktop sidebar */}
        <aside className="hidden border-r border-cyan/15 bg-panel/70 backdrop-blur-xl lg:block">
          <div className="flex h-full flex-col px-3 py-5">
            <div className="flex items-center justify-between gap-2 px-2">
              <Link
                href="/"
                className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}
              >
                <div className="glow-mark relative h-11 w-11 shrink-0 overflow-hidden rounded-[1.1rem] border border-cyan/30 bg-panel">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/vinylhub-mark.png"
                    alt="VinylHub"
                    className="h-full w-full object-cover"
                  />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <p className="text-lg font-semibold text-white">VinylHub</p>
                    <p className="brand-gradient-text text-xs font-medium">Neon vinyl</p>
                  </div>
                )}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className={cn("shrink-0", sidebarCollapsed && "hidden")}
                onClick={() => setSidebarCollapsed(true)}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {sidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="mx-auto mt-2"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            <nav className="mt-6 grid gap-1">
              {allDesktopNav.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  active={isActive(item.href)}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </nav>

            <div className="mt-auto space-y-3 pt-6">
              {!sidebarCollapsed && (
                <div className="rounded-lg border border-fuchsia/20 bg-fuchsia/10 p-4 glow-fuchsia">
                  <p className="text-sm font-medium brand-gradient-text">Neon concierge</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-300">
                    Search live vinyl, albums, artists, and tracks.
                  </p>
                </div>
              )}
              <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-cyan/20 bg-cyan/[0.06] p-2 transition-base hover:border-fuchsia/30 hover:bg-fuchsia/[0.08]",
                  sidebarCollapsed && "justify-center",
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl ?? undefined} />
                  <AvatarFallback className="bg-emerald/20 text-emerald text-xs">
                    {user?.displayName?.[0] ?? "V"}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {user?.displayName ?? "Profile"}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      @{user?.username ?? "vinylhub"}
                    </p>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex min-h-screen flex-col pb-20 lg:pb-0">
          <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-fuchsia/15 bg-panel/75 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="border-white/10 bg-zinc-950/95">
                <SheetHeader>
                  <SheetTitle className="text-white">VinylHub</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 grid gap-1">
                  {[...primaryNav, ...visibleOverflow].map((item) => (
                    <NavLink
                      key={item.href}
                      {...item}
                      active={isActive(item.href)}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-cyan/30 bg-cyan/[0.07] px-3 py-2 text-left shadow-[0_0_32px_rgba(0,242,255,0.12)] transition-base hover:border-fuchsia/40 hover:bg-fuchsia/[0.08] lg:max-w-md"
            >
              <Search className="h-4 w-4 shrink-0 text-cyan" />
              <span className="truncate text-sm text-zinc-500">Search...</span>
              <kbd className="ml-auto hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500 sm:inline">
                ⌘K
              </kbd>
            </button>

            <div className="flex items-center gap-1">
              <NotificationCenter />
              <Button
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => router.push("/search")}
              >
                <Plus className="h-4 w-4" />
                Add record
              </Button>
              {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (
                <UserButton
                  appearance={{
                    elements: { avatarBox: "h-8 w-8" },
                  }}
                />
              )}
            </div>
          </header>

          <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</div>
        </section>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-cyan/20 bg-panel/90 backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] transition-base",
                isActive(item.href)
                  ? "text-emerald drop-shadow-[0_0_8px_rgba(0,242,255,0.7)]"
                  : "text-zinc-500 hover:text-fuchsia",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </main>
    </PreviewAudioProvider>
  );
}
