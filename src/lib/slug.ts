export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

export function stableSlug(...parts: Array<string | number | null | undefined>) {
  return slugify(parts.filter(Boolean).join(" "));
}
