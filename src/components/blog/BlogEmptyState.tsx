
import React from 'react';
import { Button } from "@/components/ui/button";

interface BlogEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

const BlogEmptyState = ({ hasFilters, onClearFilters }: BlogEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-ceviche text-rap-gold mb-4">No Sacred Scrolls Found</h3>
      <p className="text-rap-platinum font-kaushan mb-6">
        {hasFilters 
          ? "No posts found matching your filters. Try adjusting your selection." 
          : "No published scrolls yet. Check back soon for wisdom from the temple!"
        }
      </p>
      {hasFilters && (
        <Button 
          onClick={onClearFilters} 
          variant="outline" 
          className="bg-rap-carbon-light border-2 border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default BlogEmptyState;
