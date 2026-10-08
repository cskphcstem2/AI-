import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        brass: "bg-brass text-ink hover:bg-[#d7b56e]",
        ink: "bg-ink text-paper hover:bg-chamber-2",
        ghost: "bg-transparent text-paper hover:bg-white/10",
        paper: "bg-paper text-ink hover:bg-paper-deep",
        laurel: "bg-laurel text-paper hover:bg-[#21866d]",
        seal: "bg-seal text-paper hover:bg-[#a34149]",
        line: "border border-brass/50 bg-transparent text-paper hover:bg-white/10",
        quiet: "bg-transparent text-ink hover:bg-ink/5",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "brass",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, type = "button", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} type={asChild ? undefined : type} {...props} />;
}
