
import * as React from "react";
import { cn } from "@/lib/utils";

const ThemedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[var(--theme-radius-lg)] border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-[var(--theme-shadow-md)]",
      className
    )}
    {...props}
  />
));
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
      "text-2xl font-semibold leading-none tracking-tight text-[var(--theme-primary)] font-[var(--theme-font-heading)]",
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
    className={cn("text-sm text-[var(--theme-textMuted)] font-[var(--theme-font-body)]", className)}
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
};
