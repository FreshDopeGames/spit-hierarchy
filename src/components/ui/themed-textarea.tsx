import * as React from "react";
import { cn } from "@/lib/utils";

const ThemedTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[var(--theme-element-textarea-border-radius,var(--theme-radius-md))] border border-[var(--theme-element-textarea-border-color,var(--theme-border))] bg-[var(--theme-element-textarea-bg,var(--theme-surface))] px-[var(--theme-element-textarea-padding,12px)] py-2 text-sm text-[var(--theme-element-textarea-color,var(--theme-text))] ring-offset-[var(--theme-background)] placeholder:text-[var(--theme-textMuted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-[var(--theme-element-textarea-fontFamily,var(--theme-font-body))] resize-vertical",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
ThemedTextarea.displayName = "ThemedTextarea";

export { ThemedTextarea };