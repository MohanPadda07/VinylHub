import { SectionPage } from "@/features/app-shell/section-page";

export default function KnowledgePage() {
  return (
    <SectionPage
      eyebrow="Knowledge"
      title="Explore genre evolution, artist links, samples, and influence maps."
      description="The knowledge base will connect albums, artists, producers, labels, session musicians, family trees, sampling history, timelines, and learning paths."
      metrics={[
        { label: "Genre maps", value: "42", tone: "text-emerald" },
        { label: "Influence links", value: "1.2k", tone: "text-cyan" },
        { label: "Roadmaps", value: "17", tone: "text-amber" },
        { label: "Quizzes", value: "8", tone: "text-coral" },
      ]}
      panels={[
        {
          title: "Learning Paths",
          items: [
            "From bebop to spiritual jazz in 10 albums.",
            "Detroit techno roots: labels, machines, and scenes.",
            "A beginner path through krautrock and kosmische music.",
          ],
        },
        {
          title: "Graph Ideas",
          items: [
            "Sampling tree for golden-age hip-hop records.",
            "Producer page linking Brian Eno, Bowie, Talking Heads, and ambient music.",
            "Band family tree for post-punk and new wave scenes.",
          ],
        },
      ]}
    />
  );
}
