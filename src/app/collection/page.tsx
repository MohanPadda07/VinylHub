import { SectionPage } from "@/features/app-shell/section-page";

export default function CollectionPage() {
  return (
    <SectionPage
      eyebrow="Collection"
      title="Track every record, variant, condition, and value signal."
      description="Your collection workspace will manage owned vinyl, wishlist records, trade candidates, sell intent, purchase history, condition notes, and appreciation over time."
      metrics={[
        { label: "Owned records", value: "312", tone: "text-cyan" },
        { label: "Estimated value", value: "$8,420", tone: "text-emerald" },
        { label: "Wishlist", value: "28", tone: "text-amber" },
        { label: "Trade list", value: "9", tone: "text-coral" },
      ]}
      panels={[
        {
          title: "Recently Added",
          items: [
            "Miles Davis - Kind of Blue, 2013 mono reissue, NM / VG+",
            "Sade - Promise, UK pressing, VG+ / VG+",
            "Fela Kuti - Zombie, recent remaster, sealed",
          ],
        },
        {
          title: "Collection Tasks",
          items: [
            "Add condition grading and private notes to 14 uncataloged records.",
            "Review price movement on high-rarity jazz pressings.",
            "Move duplicate soul records into the trade list.",
          ],
        },
      ]}
    />
  );
}
