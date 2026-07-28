"use client";

import { AppShell } from "@/features/app-shell/app-shell";
import { PageHeader } from "@/components/vinyl/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Manage your VinylHub profile and display preferences."
      />
      <div className="mt-6 max-w-xl space-y-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : (
          <Card className="border-white/10 bg-black/45">
            <CardHeader>
              <CardTitle className="text-white">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-caption mb-1.5 block text-zinc-400">
                  Display name
                </label>
                <Input
                  defaultValue={user?.displayName}
                  disabled
                  className="border-white/10 bg-white/[0.04]"
                />
                <p className="text-caption mt-1 text-zinc-500">
                  Managed through your sign-in provider.
                </p>
              </div>
              <div>
                <label className="text-caption mb-1.5 block text-zinc-400">
                  Username
                </label>
                <Input
                  defaultValue={user?.username}
                  disabled
                  className="border-white/10 bg-white/[0.04]"
                />
              </div>
              <Button disabled variant="secondary">
                Save changes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
