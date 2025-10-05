
import React from "react";
import RapperCard from "@/components/RapperCard";
import LoadMoreButton from "@/components/LoadMoreButton";
import { useRapperImages } from "@/hooks/useImageStyle";
import { useRapperStats } from "@/hooks/useRapperStats";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface AllRappersGridProps {
  rappers: Rapper[];
  total: number;
  hasMore: boolean;
  isFetching: boolean;
  itemsPerPage: number;
  onLoadMore: () => void;
  currentPage: number;
}

const AllRappersGrid = ({
  rappers,
  total,
  hasMore,
  isFetching,
  itemsPerPage,
  onLoadMore,
  currentPage
}: AllRappersGridProps) => {
  // Batch load all rapper images for better performance
  const rapperIds = rappers.map(rapper => rapper.id);
  const { data: imageMap = {} } = useRapperImages(rapperIds);
  const { data: statsMap = {} } = useRapperStats(rapperIds);

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8 min-w-0 max-w-full">
        {rappers.map((rapper) => (
          <RapperCard 
            key={rapper.id}
            rapper={rapper} 
            imageUrl={imageMap[rapper.id]} 
            stats={statsMap[rapper.id]}
            currentPage={currentPage}
          />
        ))}
      </div>

      {/* Load More Button */}
      <LoadMoreButton
        hasMore={hasMore}
        isFetching={isFetching}
        onLoadMore={onLoadMore}
        total={total}
        currentCount={rappers.length}
      />
    </div>
  );
};

export default AllRappersGrid;
