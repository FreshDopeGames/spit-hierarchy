import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const themedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--theme-primary)] text-[var(--theme-background)] hover:bg-[var(--theme-primaryDark)] font-[var(--theme-font-heading)]",
        destructive: "bg-[var(--theme-error)] text-[var(--theme-textLight)] hover:opacity-90",
        outline: "border border-[var(--theme-border)] bg-transparent text-[var(--theme-text)] hover:bg-[var(--theme-surface)] font-[var(--theme-font-body)]",
        secondary: "bg-[var(--theme-secondary)] text-[var(--theme-textLight)] hover:bg-[var(--theme-secondaryDark)] font-[var(--theme-font-heading)]",
        ghost: "text-[var(--theme-text)] hover:bg-[var(--theme-surface)]",
        accent: "bg-[var(--theme-accent)] text-[var(--theme-textLight)] hover:bg-[var(--theme-accentDark)] font-[var(--theme-font-heading)]",
        gradient: "bg-gradient-to-r from-[var(--theme-secondary)] via-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-background)] hover:opacity-90 font-[var(--theme-font-heading)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ThemedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof themedButtonVariants> {
  asChild?: boolean;
}

const ThemedButton = React.forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(themedButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ThemedButton.displayName = "ThemedButton";

export { ThemedButton, themedButtonVariants };
