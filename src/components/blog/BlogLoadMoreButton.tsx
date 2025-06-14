
import React from 'react';
import { Button } from "@/components/ui/button";

interface BlogLoadMoreButtonProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

const BlogLoadMoreButton = ({ hasNextPage, isFetchingNextPage, onLoadMore }: BlogLoadMoreButtonProps) => {
  if (!hasNextPage) return null;

  return (
    <div className="text-center">
      <Button 
        onClick={onLoadMore} 
        disabled={isFetchingNextPage} 
        className="bg-rap-carbon-light border-2 border-rap-gold text-rap-gold hover:bg-rap-gold/20 font-mogra shadow-lg"
      >
        {isFetchingNextPage ? 'Loading More Sacred Scrolls...' : 'Load More Sacred Scrolls'}
      </Button>
    </div>
  );
};

export default BlogLoadMoreButton;
