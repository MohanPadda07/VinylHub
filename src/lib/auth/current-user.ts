import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/client";
import { slugify } from "@/lib/slug";

const hasClerkConfig = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

function fallbackEmail() {
  return process.env.VINYLHUB_OWNER_EMAIL?.trim() || "local@vinylhub.dev";
}

export async function requireCurrentAppUser() {
  if (!hasClerkConfig) {
    const email = fallbackEmail();
    const username = slugify(email.split("@")[0] ?? "owner");

    return prisma.user.upsert({
      where: { clerkUserId: "local-owner" },
      update: {
        displayName: "Mohan",
        username,
      },
      create: {
        clerkUserId: "local-owner",
        username,
        displayName: "Mohan",
        imageUrl: null,
      },
    });
  }

  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const email =
    user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
  const usernameSeed =
    user.username ?? email?.split("@")[0] ?? user.firstName ?? user.id;
  const username = slugify(usernameSeed);
  const displayName =
    user.fullName ?? user.firstName ?? user.username ?? usernameSeed ?? "VinylHub User";

  return prisma.user.upsert({
    where: { clerkUserId: user.id },
    update: {
      username,
      displayName,
      imageUrl: user.imageUrl,
    },
    create: {
      clerkUserId: user.id,
      username,
      displayName,
      imageUrl: user.imageUrl,
    },
  });
}
