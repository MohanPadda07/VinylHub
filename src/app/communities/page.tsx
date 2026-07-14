import { SectionPage } from "@/features/app-shell/section-page";

export default function CommunitiesPage() {
  return (
    <SectionPage
      eyebrow="Communities"
      title="Join artist, genre, and album spaces built around real taste."
      description="Communities are where VinylHub becomes social: discussion threads, listening clubs, recommendation requests, collection showcases, polls, Q&A, and weekly challenges."
      metrics={[
        { label: "Joined", value: "18", tone: "text-emerald" },
        { label: "Active threads", value: "142", tone: "text-cyan" },
        { label: "Listening clubs", value: "6", tone: "text-amber" },
        { label: "Showcases", value: "31", tone: "text-coral" },
      ]}
      panels={[
        {
          title: "Live Communities",
          items: [
            "Blue Note Collectors: spiritual jazz listening week",
            "Japanese City Pop: essential pressings and hidden gems",
            "Hip-Hop Canon: debating 1990s production runs",
          ],
        },
        {
          title: "Weekly Prompts",
          items: [
            "Show a record that changed how you hear drums.",
            "Vote on the best first pressing under $50.",
            "Build a three-album path into Brazilian psych.",
          ],
        },
      ]}
    />
  );
}
