import { cn } from "@/lib/utils";

export function ArtworkTile({
  imageUrl,
  title,
  size = "md",
  className,
}: {
  imageUrl?: string;
  title: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "h-14 w-14", md: "h-20 w-20", lg: "aspect-square w-full" };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950",
        sizes[size],
        className,
      )}
    >
      {imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label={title}
        />
      ) : (
        <div className="record-grooves absolute inset-0" aria-hidden />
      )}
    </div>
  );
}
