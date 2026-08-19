import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium tabular transition-[transform,background-color,color,opacity] duration-150 ease-[var(--ease-out)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass",
  {
    variants: {
      intent: {
        primary: "bg-live text-paper hover:bg-live-hover",
        brass: "bg-brass text-paper hover:bg-brass-hover",
        ink: "bg-ink text-on-ink hover:bg-ink-2",
        ghost:
          "bg-transparent text-ink hover:bg-ink/5 border border-line",
        water: "bg-water text-paper hover:bg-water-hover",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ className, intent, size, ...props }: ButtonProps) {
  return (
    <button className={cn(button({ intent, size }), className)} {...props} />
  );
}
