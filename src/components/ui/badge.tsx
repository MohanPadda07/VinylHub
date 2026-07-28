import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-cyan/20 bg-cyan/[0.08] px-2.5 py-1 text-xs font-medium text-cyan",
        className,
      )}
      {...props}
    />
  );
}
