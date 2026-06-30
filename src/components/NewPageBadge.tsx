import React from "react";
import { cn } from "@/lib/utils";

interface NewPageBadgeProps {
  className?: string;
  size?: "sm" | "md";
  ariaLabel?: string;
}

/**
 * Small red circle with a white exclamation point.
 * Used to signal pages a logged-in user hasn't visited yet.
 */
const NewPageBadge: React.FC<NewPageBadgeProps> = ({
  className,
  size = "sm",
  ariaLabel = "Unvisited page",
}) => {
  const dims = size === "sm" ? "h-4 w-4 text-[10px]" : "h-5 w-5 text-xs";
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-red-600 text-white font-bold leading-none shadow-md ring-2 ring-[var(--theme-surface)]",
        dims,
        className
      )}
    >
      !
    </span>
  );
};

export default NewPageBadge;
