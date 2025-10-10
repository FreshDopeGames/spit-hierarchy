import React from "react";
import { Loader2 } from "lucide-react";

const AllRappersInlineLoader = () => {
  return (
    <div className="flex items-center justify-center py-8 mb-6">
      <div className="flex items-center gap-3 bg-[var(--theme-surface)]/60 backdrop-blur-sm px-6 py-3 rounded-full border border-[var(--theme-border)]">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--theme-primary)]" />
        <span className="text-sm font-medium text-[var(--theme-text-primary)]">
          Searching rappers...
        </span>
      </div>
    </div>
  );
};

export default AllRappersInlineLoader;
