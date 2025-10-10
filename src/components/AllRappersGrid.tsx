
import React, { useRef, useEffect } from "react";
import RapperCard from "@/components/RapperCard";
import LoadMoreButton from "@/components/LoadMoreButton";
import { useIncrementalRapperData } from "@/hooks/useIncrementalRapperData";
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
  // Incrementally load rapper data (only fetches NEW rappers)
  const rapperIds = rappers.map(rapper => rapper.id);
  const { imageMap, statsMap } = useIncrementalRapperData(rapperIds);

  // Infinite scroll: auto-load when sentinel element comes into view
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '400px' } // Trigger 400px before reaching sentinel
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetching, onLoadMore]);

  return (
    <div className="min-w-0 max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8 min-w-0 max-w-full overflow-visible">
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

      {/* Invisible sentinel for infinite scroll */}
      {hasMore && <div ref={sentinelRef} className="h-px" />}

      {/* Load More Button - fallback for manual loading */}
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
