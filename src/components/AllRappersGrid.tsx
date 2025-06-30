
import React from "react";
import AdUnit from "@/components/AdUnit";
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
    <>
      {/* Top ad placement */}
      <AdUnit placement="grid-top" pageRoute="/all-rappers" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {rappers.map((rapper, index) => {
          // Show middle ad after every 20 rappers
          const shouldShowMiddleAd = (index + 1) % 20 === 0 && index < rappers.length - 1;
          
          return (
            <React.Fragment key={rapper.id}>
              <RapperCard 
                rapper={rapper} 
                imageUrl={imageMap[rapper.id]} 
                stats={statsMap[rapper.id]}
                currentPage={currentPage}
              />
              
              {shouldShowMiddleAd && (
                <div className="col-span-full">
                  <AdUnit placement="grid-middle" pageRoute="/all-rappers" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Load More Button */}
      <LoadMoreButton
        hasMore={hasMore}
        isFetching={isFetching}
        onLoadMore={onLoadMore}
        total={total}
        currentCount={rappers.length}
      />

      {/* Bottom ad placement */}
      <AdUnit placement="grid-bottom" pageRoute="/all-rappers" />
    </>
  );
};

export default AllRappersGrid;
