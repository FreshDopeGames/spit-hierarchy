import * as React from "react";
import { cn } from "@/lib/utils";

const ThemedSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-[var(--theme-element-skeleton-border-radius,var(--theme-radius-md))] bg-[var(--theme-element-skeleton-bg,var(--theme-surface))] opacity-60",
        className
      )}
      {...props}
    />
  );
});
ThemedSkeleton.displayName = "ThemedSkeleton";

export { ThemedSkeleton };