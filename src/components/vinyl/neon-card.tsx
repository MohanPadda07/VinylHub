import { cn } from "@/lib/utils";

export function NeonCard({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "emerald" | "cyan" | "fuchsia" | "amber" | "coral";
}) {
  const tones = {
    default:
      "border-cyan/20 shadow-[0_0_40px_rgba(0,242,255,0.08),0_0_60px_rgba(217,0,255,0.05)]",
    emerald:
      "border-emerald/30 bg-emerald/[0.06] shadow-[0_0_40px_rgba(0,242,255,0.14)]",
    cyan: "border-cyan/30 bg-cyan/[0.06] shadow-[0_0_40px_rgba(94,239,255,0.14)]",
    fuchsia:
      "border-fuchsia/30 bg-fuchsia/[0.06] shadow-[0_0_40px_rgba(217,0,255,0.16)]",
    amber:
      "border-amber/30 bg-amber/[0.06] shadow-[0_0_40px_rgba(255,176,134,0.12)]",
    coral:
      "border-coral/30 bg-coral/[0.06] shadow-[0_0_40px_rgba(255,140,105,0.12)]",
  };

  return (
    <div
      className={cn(
        "glass-border rounded-xl bg-panel/70 backdrop-blur-md transition-base hover:brightness-110",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
