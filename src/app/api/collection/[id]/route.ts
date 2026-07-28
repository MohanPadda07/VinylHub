import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCurrentAppUser } from "@/lib/auth/current-user";
import {
  actionableStatuses,
  deleteCollectionItem,
  updateCollectionItem,
} from "@/features/collection/collection-service";

export const runtime = "nodejs";

const updateCollectionItemSchema = z.object({
  status: z.enum(actionableStatuses).optional(),
  notes: z.string().max(2000).nullable().optional(),
  mediaCondition: z.string().max(80).nullable().optional(),
  sleeveCondition: z.string().max(80).nullable().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

function apiError(error: unknown, status = 400) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Request failed." },
    { status },
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentAppUser();
    const { id } = await context.params;
    const data = updateCollectionItemSchema.parse(await request.json());
    const item = await updateCollectionItem({ id, userId: user.id, data });

    return NextResponse.json({ item });
  } catch (error) {
    return apiError(error, error instanceof Error && error.message === "Unauthorized" ? 401 : 400);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentAppUser();
    const { id } = await context.params;
    const item = await deleteCollectionItem(id, user.id);

    return NextResponse.json({ item });
  } catch (error) {
    return apiError(error, error instanceof Error && error.message === "Unauthorized" ? 401 : 400);
  }
}
