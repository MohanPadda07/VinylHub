import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "emerald" | "cyan" | "amber" | "fuchsia" | "coral";
  className?: string;
};

const toneStyles = {
  emerald: {
    card: "border-emerald/35 bg-emerald/[0.08] shadow-[0_0_36px_rgba(0,242,255,0.14)]",
    icon: "text-emerald drop-shadow-[0_0_10px_rgba(0,242,255,0.55)]",
    label: "text-emerald/80",
  },
  cyan: {
    card: "border-cyan/35 bg-cyan/[0.08] shadow-[0_0_36px_rgba(94,239,255,0.14)]",
    icon: "text-cyan drop-shadow-[0_0_10px_rgba(94,239,255,0.55)]",
    label: "text-cyan/80",
  },
  amber: {
    card: "border-amber/35 bg-amber/[0.08] shadow-[0_0_36px_rgba(255,176,134,0.14)]",
    icon: "text-amber drop-shadow-[0_0_10px_rgba(255,176,134,0.5)]",
    label: "text-amber/80",
  },
  fuchsia: {
    card: "border-fuchsia/35 bg-fuchsia/[0.08] shadow-[0_0_36px_rgba(217,0,255,0.16)]",
    icon: "text-fuchsia drop-shadow-[0_0_10px_rgba(217,0,255,0.55)]",
    label: "text-fuchsia/80",
  },
  coral: {
    card: "border-coral/35 bg-coral/[0.08] shadow-[0_0_36px_rgba(255,140,105,0.14)]",
    icon: "text-coral drop-shadow-[0_0_10px_rgba(255,140,105,0.5)]",
    label: "text-coral/80",
  },
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "emerald",
  className,
}: MetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <Card
      className={cn(
        "border backdrop-blur-sm transition-base hover:brightness-110",
        styles.card,
        className,
      )}
    >
      <CardContent className="flex items-start justify-between p-4">
        <div>
          <p className={cn("text-caption", styles.label)}>{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
        {Icon && <Icon className={cn("h-5 w-5", styles.icon)} />}
      </CardContent>
    </Card>
  );
}
