import { SectionPage } from "@/features/app-shell/section-page";

export default function AdminPage() {
  return (
    <SectionPage
      eyebrow="Admin"
      title="Moderate users, content, catalog data, reports, and analytics."
      description="The admin area is designed for review queues, community safety, catalog corrections, AI output moderation, and platform health analytics."
      metrics={[
        { label: "Open reports", value: "7", tone: "text-coral" },
        { label: "Pending edits", value: "23", tone: "text-amber" },
        { label: "AI reviews", value: "11", tone: "text-cyan" },
        { label: "Healthy communities", value: "98%", tone: "text-emerald" },
      ]}
      panels={[
        {
          title: "Moderation Queue",
          items: [
            "Review 3 reported comments in album debate threads.",
            "Approve 12 user-submitted catalog corrections.",
            "Check AI summary for disputed artist biography wording.",
          ],
        },
        {
          title: "Platform Health",
          items: [
            "Search latency target: under 150ms for common queries.",
            "Community response rate is up 14% week over week.",
            "New user onboarding completion is at 72%.",
          ],
        },
      ]}
    />
  );
}
