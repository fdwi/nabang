import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#b34455] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#963647] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455] disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:outline-[#ffb9c3]",
  {
    variants: {
      variant: {
        default: "",
        outline: "border border-border bg-card text-foreground hover:bg-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ asChild = false, className, variant, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, className }))} {...props} />;
}
