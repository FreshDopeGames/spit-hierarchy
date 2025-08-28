import * as React from "react";
import { cn } from "@/lib/utils";

const ThemedInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[var(--theme-element-input-border-radius,var(--theme-radius-md))] border border-[var(--theme-element-input-border-color,var(--theme-border))] bg-[var(--theme-element-input-bg,var(--theme-surface))] px-[var(--theme-element-input-padding,12px)] py-2 text-sm text-[var(--theme-element-input-color,var(--theme-text))] ring-offset-[var(--theme-background)] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--theme-element-input-color,var(--theme-text))] placeholder:text-[var(--theme-textMuted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-[var(--theme-element-input-fontFamily,var(--theme-font-body))]",
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