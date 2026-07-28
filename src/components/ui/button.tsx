import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(160deg,#00f2ff_0%,#8a2be2_55%,#d900ff_100%)] text-white shadow-[0_0_28px_rgba(0,242,255,0.28)] hover:brightness-110 hover:shadow-[0_0_36px_rgba(217,0,255,0.3)]",
        ghost: "text-zinc-300 hover:bg-white/[0.07] hover:text-white",
        secondary:
          "border border-cyan/20 bg-white/[0.05] text-zinc-100 hover:border-fuchsia/30 hover:bg-white/[0.09]",
      },
      size: {
        default: "h-10 px-4 py-2",
        icon: "h-10 w-10",
        sm: "h-9 px-3",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  asChild = false,
  className,
  size,
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  );
}
