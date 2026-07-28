import { AppShell } from "@/features/app-shell/app-shell";
import { CollectionWorkspace } from "@/features/collection/collection-workspace";

export default function CollectionPage() {
  return (
    <AppShell>
      <CollectionWorkspace />
    </AppShell>
  );
}
