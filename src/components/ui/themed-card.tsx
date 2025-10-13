
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const themedCardVariants = cva(
  "rounded-[var(--theme-radius-lg)] border shadow-[var(--theme-shadow-md)]",
  {
    variants: {
      variant: {
        default: "border-[hsl(var(--theme-border))] bg-[hsl(var(--theme-surface))] text-[hsl(var(--theme-text))]",
        gradient: "border-[hsl(var(--theme-border))] bg-[hsl(var(--theme-element-card-bg))] text-[hsl(var(--theme-text))]",
        primary: "border-[hsl(var(--theme-primary))] bg-gradient-to-br from-[hsl(var(--theme-primaryLight))] to-[hsl(var(--theme-primary))] text-[hsl(var(--theme-textLight))]",
        accent: "border-[hsl(var(--theme-accent))] bg-gradient-to-br from-[hsl(var(--theme-accentLight))] to-[hsl(var(--theme-accent))] text-[hsl(var(--theme-textLight))]",
        dark: "border-[hsl(var(--theme-border))] bg-black text-[hsl(var(--theme-text))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ThemedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof themedCardVariants> {}

const ThemedCard = React.forwardRef<HTMLDivElement, ThemedCardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(themedCardVariants({ variant }), className)}
      {...props}
    />
  )
);
ThemedCard.displayName = "ThemedCard";

const ThemedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
ThemedCardHeader.displayName = "ThemedCardHeader";

const ThemedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]",
      className
    )}
    {...props}
  />
));
ThemedCardTitle.displayName = "ThemedCardTitle";

const ThemedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]", className)}
    {...props}
  />
));
ThemedCardDescription.displayName = "ThemedCardDescription";

const ThemedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
ThemedCardContent.displayName = "ThemedCardContent";

const ThemedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
ThemedCardFooter.displayName = "ThemedCardFooter";

export {
  ThemedCard,
  ThemedCardHeader,
  ThemedCardFooter,
  ThemedCardTitle,
  ThemedCardDescription,
  ThemedCardContent,
  themedCardVariants,
};
