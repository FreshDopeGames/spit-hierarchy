import * as React from "react";
import { cn } from "@/lib/utils";

const ThemedSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical";
  }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn(
      "shrink-0 bg-[var(--theme-element-separator-bg,var(--theme-border))]",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
));
ThemedSeparator.displayName = "ThemedSeparator";

export { ThemedSeparator };