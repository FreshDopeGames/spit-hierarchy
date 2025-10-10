import { useState, useEffect, useMemo } from "react";
import { useRapperImages } from "@/hooks/useImageStyle";
import { useRapperStats } from "@/hooks/useRapperStats";

/**
 * Hook that accumulates rapper data incrementally during infinite scroll
 * Only fetches data for NEW rapper IDs, not already-loaded ones
 */
export const useIncrementalRapperData = (currentRapperIds: string[]) => {
  const [accumulatedImageMap, setAccumulatedImageMap] = useState<Record<string, string>>({});
  const [accumulatedStatsMap, setAccumulatedStatsMap] = useState<Record<string, any>>({});
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
  
  // Find NEW IDs that haven't been loaded yet
  const newIds = useMemo(() => 
    currentRapperIds.filter(id => !loadedIds.has(id)),
    [currentRapperIds, loadedIds]
  );
  
  // Only fetch for NEW IDs
  const { data: newImages } = useRapperImages(newIds);
  const { data: newStats } = useRapperStats(newIds);
  
  // Merge new images with accumulated data
  useEffect(() => {
    if (newImages && Object.keys(newImages).length > 0) {
      setAccumulatedImageMap(prev => ({ ...prev, ...newImages }));
      setLoadedIds(prev => new Set([...prev, ...Object.keys(newImages)]));
    }
  }, [newImages]);
  
  // Merge new stats with accumulated data
  useEffect(() => {
    if (newStats && Object.keys(newStats).length > 0) {
      setAccumulatedStatsMap(prev => ({ ...prev, ...newStats }));
    }
  }, [newStats]);
  
  return {
    imageMap: accumulatedImageMap,
    statsMap: accumulatedStatsMap,
    isLoadingNew: newIds.length > 0 && (!newImages || !newStats)
  };
};
