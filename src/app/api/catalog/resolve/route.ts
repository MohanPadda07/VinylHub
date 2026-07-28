import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveCatalogEntry } from "@/lib/catalog/resolver";

const bodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("vinyl"),
    data: z.object({
      id: z.string(),
      source: z.literal("discogs"),
      title: z.string(),
      artist: z.string(),
      year: z.string().optional(),
      label: z.string().optional(),
      country: z.string().optional(),
      format: z.string().optional(),
      catalogNumber: z.string().optional(),
      imageUrl: z.string().optional(),
      externalUrl: z.string().optional(),
      genres: z.array(z.string()).optional(),
      styles: z.array(z.string()).optional(),
      marketValueCents: z.number().optional(),
      lowValueCents: z.number().optional(),
      highValueCents: z.number().optional(),
    }),
  }),
  z.object({
    type: z.literal("album"),
    data: z.object({
      id: z.string(),
      source: z.literal("spotify"),
      title: z.string(),
      artist: z.string(),
      releaseDate: z.string().optional(),
      imageUrl: z.string().optional(),
      externalUrl: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("artist"),
    data: z.object({
      id: z.string(),
      source: z.literal("spotify"),
      name: z.string(),
      genres: z.array(z.string()).default([]),
      imageUrl: z.string().optional(),
      externalUrl: z.string().optional(),
    }),
  }),
]);

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const result = await resolveCatalogEntry(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Resolve failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
