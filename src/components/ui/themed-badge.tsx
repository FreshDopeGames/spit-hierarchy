import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const themedBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-[var(--theme-font-body)]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--theme-primary)] text-[var(--theme-background)] hover:bg-[var(--theme-primaryDark)]",
        secondary: "border-transparent bg-[var(--theme-secondary)] text-[var(--theme-textLight)] hover:bg-[var(--theme-secondaryDark)]",
        accent: "border-transparent bg-[var(--theme-accent)] text-[var(--theme-textLight)] hover:bg-[var(--theme-accentDark)]",
        destructive: "border-transparent bg-[var(--theme-error)] text-[var(--theme-textLight)] hover:opacity-90",
        outline: "border-[var(--theme-border)] bg-transparent text-[var(--theme-text)] hover:bg-[var(--theme-surface)]",
        ghost: "border-transparent bg-[var(--theme-surface)]/60 text-[var(--theme-text)] hover:bg-[var(--theme-surface)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ThemedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof themedBadgeVariants> {}

const ThemedBadge = React.forwardRef<HTMLDivElement, ThemedBadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(themedBadgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
ThemedBadge.displayName = "ThemedBadge";

export { ThemedBadge, themedBadgeVariants };