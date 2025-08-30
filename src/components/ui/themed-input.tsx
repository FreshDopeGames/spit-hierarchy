import * as React from "react";
import { cn } from "@/lib/utils";

const ThemedInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "themed-input flex h-10 w-full rounded-[var(--theme-element-input-border-radius,var(--theme-radius-md))] border border-[hsl(var(--theme-element-input-border-color,var(--theme-border)))] bg-[hsl(var(--theme-element-input-bg,var(--theme-surface)))] pl-[var(--theme-element-input-padding-left,16px)] pr-[var(--theme-element-input-padding,12px)] py-2 text-sm text-[hsl(var(--theme-element-input-color,var(--theme-text)))] ring-offset-[hsl(var(--theme-background))] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[hsl(var(--theme-element-input-color,var(--theme-text)))] placeholder:text-[hsl(var(--theme-textMuted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--theme-primary))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-[var(--theme-element-input-fontFamily,var(--theme-font-body))]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
ThemedInput.displayName = "ThemedInput";

export { ThemedInput };