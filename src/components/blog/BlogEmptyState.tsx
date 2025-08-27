
import React from 'react';
import { Button } from "@/components/ui/button";

interface BlogEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

const BlogEmptyState = ({ hasFilters, onClearFilters }: BlogEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-[var(--theme-fontPrimary)] text-[var(--theme-primary)] mb-4">No Sacred Scrolls Found</h3>
      <p className="text-[var(--theme-text)] font-[var(--theme-fontSecondary)] mb-6">
        {hasFilters 
          ? "No posts found matching your filters. Try adjusting your selection." 
          : "No published scrolls yet. Check back soon for wisdom from the temple!"
        }
      </p>
      {hasFilters && (
        <Button 
          onClick={onClearFilters} 
          variant="outline" 
          className="bg-[var(--theme-backgroundLight)] border-2 border-[var(--theme-primary)]/50 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/20"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default BlogEmptyState;
