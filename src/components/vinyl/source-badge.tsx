import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Source = "discogs" | "spotify" | "vinylhub";

const sourceStyles: Record<Source, string> = {
  discogs: "border-emerald/25 bg-emerald/10 text-emerald",
  spotify: "border-cyan/25 bg-cyan/10 text-cyan",
  vinylhub: "border-fuchsia/25 bg-fuchsia/10 text-fuchsia",
};

const sourceLabels: Record<Source, string> = {
  discogs: "Discogs",
  spotify: "Spotify",
  vinylhub: "VinylHub",
};

export function SourceBadge({
  source,
  className,
}: {
  source: Source;
  className?: string;
}) {
  return (
    <Badge className={cn(sourceStyles[source], className)}>
      {sourceLabels[source]}
    </Badge>
  );
}
