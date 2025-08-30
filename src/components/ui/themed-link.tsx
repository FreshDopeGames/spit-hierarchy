import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const themedLinkVariants = cva(
  "font-[var(--theme-element-link-fontFamily,var(--theme-font-body))] text-[var(--theme-element-link-color,var(--theme-primary))] hover:text-[var(--theme-element-link-hover-color,var(--theme-primaryLight))] transition-colors duration-200 underline-offset-4 hover:underline",
  {
    variants: {
      variant: {
        default: "underline-offset-4 hover:underline",
        subtle: "no-underline hover:underline",
        button: "no-underline bg-[var(--theme-element-link-bg,transparent)] px-3 py-2 rounded-[var(--theme-radius-md)] hover:bg-[var(--theme-element-link-hover-bg,var(--theme-surface))]",
        nav: "no-underline font-medium hover:text-[var(--theme-element-link-hover-color,var(--theme-primaryLight))]"
      },
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ThemedLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof themedLinkVariants> {
  asChild?: boolean;
}

const ThemedLink = React.forwardRef<HTMLAnchorElement, ThemedLinkProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(themedLinkVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
ThemedLink.displayName = "ThemedLink";

export { ThemedLink, themedLinkVariants };