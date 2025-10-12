
import React, { useRef, useEffect, useState, useMemo } from "react";
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

  // Phase 1: Scroll velocity tracking for adaptive loading
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      const currentY = window.scrollY;
      const deltaTime = now - lastScrollTime.current;
      const deltaY = currentY - lastScrollY.current;
      
      // Calculate velocity in px/ms
      const velocity = Math.abs(deltaY / deltaTime);
      setScrollVelocity(velocity);
      
      lastScrollY.current = currentY;
      lastScrollTime.current = now;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic rootMargin based on scroll velocity
  const dynamicRootMargin = useMemo(() => {
    // Fast scroll (>2px/ms): give more buffer time (800px)
    // Normal scroll: 400px
    // Slow scroll: 200px
    if (scrollVelocity > 2) return '800px';
    if (scrollVelocity > 0.5) return '400px';
    return '200px';
  }, [scrollVelocity]);

  // Phase 2: Image load progress checker
  const getImageLoadProgress = () => {
    const allImages = document.querySelectorAll('img[loading="lazy"]');
    const loadedImages = document.querySelectorAll('img[data-loaded="true"]');
    return allImages.length > 0 ? loadedImages.length / allImages.length : 1;
  };

  // Infinite scroll: auto-load when sentinel element comes into view
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Check if images are still loading during fast scroll
          const pendingImages = document.querySelectorAll('img[loading="lazy"]:not([data-loaded])');
          const imageLoadProgress = getImageLoadProgress();
          
          if (pendingImages.length > 5 && scrollVelocity > 1) {
            // Fast scroll with many pending images: delay trigger
            console.log('[Grid] Delaying load - too many pending images during fast scroll');
            setTimeout(() => onLoadMore(), 300);
          } else if (imageLoadProgress < 0.8 && scrollVelocity > 0.5) {
            // Less than 80% images loaded during moderate scroll: brief delay
            console.log('[Grid] Delaying load - waiting for images to load');
            setTimeout(() => onLoadMore(), 150);
          } else {
            onLoadMore();
          }
        }
      },
      { rootMargin: dynamicRootMargin }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetching, onLoadMore, dynamicRootMargin, scrollVelocity]);

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
