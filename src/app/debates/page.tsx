import { SectionPage } from "@/features/app-shell/section-page";

export default function DebatesPage() {
  return (
    <SectionPage
      eyebrow="Debates"
      title="Structured music arguments with votes, evidence, and AI summaries."
      description="Debate pages turn music arguments into living, searchable discussions with options, evidence links, upvoted arguments, replies, and summaries."
      metrics={[
        { label: "Open debates", value: "64", tone: "text-coral" },
        { label: "Votes today", value: "12.8k", tone: "text-amber" },
        { label: "AI briefs", value: "19", tone: "text-cyan" },
        { label: "Top score", value: "984", tone: "text-emerald" },
      ]}
      panels={[
        {
          title: "Trending Debates",
          items: [
            "Best Beatles album? Revolver leads by 8%.",
            "Is To Pimp a Butterfly better than MBDTF?",
            "Most underrated Radiohead album: Amnesiac is climbing.",
          ],
        },
        {
          title: "Evidence Queue",
          items: [
            "Interview link added to the Stevie Wonder run debate.",
            "Three song references need moderation review.",
            "AI summary pending for the shoegaze pressing thread.",
          ],
        },
      ]}
    />
  );
}
