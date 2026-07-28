import { NextResponse } from "next/server";
import { z } from "zod";
import { formatApiError } from "@/lib/api/errors";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import {
  actionableStatuses,
  createCollectionItemFromDiscogs,
  listCollectionItems,
} from "@/features/collection/collection-service";

export const runtime = "nodejs";

const createCollectionItemSchema = z.object({
  source: z.literal("discogs"),
  releaseId: z.string().min(1),
  status: z.enum(actionableStatuses).default("OWNED"),
});

function apiError(error: unknown) {
  const { message, status } = formatApiError(error);

  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const user = await requireCurrentAppUser();
    const items = await listCollectionItems(user.id);

    return NextResponse.json({ items });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentAppUser();
    const payload = createCollectionItemSchema.parse(await request.json());
    const item = await createCollectionItemFromDiscogs({
      userId: user.id,
      discogsId: payload.releaseId,
      status: payload.status,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
