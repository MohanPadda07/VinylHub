"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { AppShell } from "@/features/app-shell/app-shell";
import { PageHeader } from "@/components/vinyl/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser, isStaffRole } from "@/hooks/use-current-user";
import { EmptyState } from "@/components/vinyl/empty-state";

export default function AdminPage() {
  const { data: user } = useCurrentUser();

  const { data } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reports");
      if (!res.ok) return { reports: [] };
      return res.json();
    },
    enabled: isStaffRole(user?.role),
  });

  if (!isStaffRole(user?.role)) {
    return (
      <AppShell>
        <EmptyState
          icon={ShieldCheck}
          title="Access restricted"
          description="Admin tools are available to moderators and administrators."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Admin"
        title="Moderation"
        description="Review reports and manage platform content."
      />
      <div className="mt-6 space-y-4">
        {!data?.reports?.length ? (
          <EmptyState
            icon={ShieldCheck}
            title="Queue clear"
            description="No pending moderation reports."
          />
        ) : (
          data.reports.map((report: { id: string; reason: string; status: string; createdAt: string }) => (
            <Card key={report.id} className="border-coral/10 bg-black/45">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-coral" />
                  <div>
                    <p className="text-sm text-white">{report.reason}</p>
                    <p className="text-xs text-zinc-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge className="border-amber/20 bg-amber/10 text-amber">{report.status}</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
