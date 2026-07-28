import { prisma } from "@/lib/db/client";

const SEED_COMMUNITIES = [
  { name: "Vinyl Collectors", slug: "vinyl-collectors", description: "All things vinyl collecting", type: "GENERAL" as const },
  { name: "Jazz Heads", slug: "jazz-heads", description: "Jazz pressings, reissues, and rare finds", type: "GENRE" as const },
  { name: "Hip-Hop Vinyl", slug: "hip-hop-vinyl", description: "Original pressings and modern hip-hop vinyl", type: "GENRE" as const },
];

const SEED_DEBATES = [
  {
    title: "Best live album pressings?",
    slug: "best-live-album-pressings",
    prompt: "Which live album has the best vinyl pressing quality and performance?",
    options: ["Kind of Blue Live", "All Things Must Pass Live", "Stop Making Sense", "MTV Unplugged"],
  },
  {
    title: "Is colored vinyl overrated?",
    slug: "colored-vinyl-overrated",
    prompt: "Do colored vinyl pressings sacrifice audio quality for aesthetics?",
    options: ["Yes, stick to black", "No, quality is equal", "Depends on the pressing", "Only for display"],
  },
];

async function main() {
  for (const c of SEED_COMMUNITIES) {
    await prisma.community.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  for (const d of SEED_DEBATES) {
    const existing = await prisma.debate.findUnique({ where: { slug: d.slug } });
    if (!existing) {
      await prisma.debate.create({
        data: {
          title: d.title,
          slug: d.slug,
          prompt: d.prompt,
          options: { create: d.options.map((label) => ({ label })) },
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
