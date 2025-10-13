import { useState, useEffect, useMemo } from "react";
import { useRapperImages } from "@/hooks/useImageStyle";
import { useRapperStats } from "@/hooks/useRapperStats";

const STORAGE_KEYS = {
  imageMap: 'rapper-incremental-images',
  statsMap: 'rapper-incremental-stats',
  loadedIds: 'rapper-incremental-loaded-ids'
};

const BATCH_SIZE = 20;

// Persist to sessionStorage
const persistState = (imageMap: Record<string, string>, statsMap: Record<string, any>, loadedIds: Set<string>) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.imageMap, JSON.stringify(imageMap));
    sessionStorage.setItem(STORAGE_KEYS.statsMap, JSON.stringify(statsMap));
    sessionStorage.setItem(STORAGE_KEYS.loadedIds, JSON.stringify([...loadedIds]));
  } catch (e) {
    console.warn('Failed to persist incremental data:', e);
  }
};

// Hydrate from sessionStorage
const hydrateState = (): { imageMap: Record<string, string>, statsMap: Record<string, any>, loadedIds: Set<string> } => {
  try {
    const imageMap = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.imageMap) || '{}');
    const statsMap = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.statsMap) || '{}');
    const loadedIdsArray: string[] = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.loadedIds) || '[]');
    return { imageMap, statsMap, loadedIds: new Set(loadedIdsArray) };
  } catch (e) {
    console.warn('Failed to hydrate incremental data:', e);
    return { imageMap: {}, statsMap: {}, loadedIds: new Set<string>() };
  }
};

/**
 * Hook that accumulates rapper data incrementally during infinite scroll
 * Only fetches data for NEW rapper IDs, not already-loaded ones
 * Persists state in sessionStorage for instant restoration on back navigation
 */
export const useIncrementalRapperData = (currentRapperIds: string[]) => {
  // Initialize state with hydrated values from sessionStorage
  const [accumulatedImageMap, setAccumulatedImageMap] = useState<Record<string, string>>(() => {
    const { imageMap } = hydrateState();
    return imageMap;
  });
  const [accumulatedStatsMap, setAccumulatedStatsMap] = useState<Record<string, any>>(() => {
    const { statsMap } = hydrateState();
    return statsMap;
  });
  const [loadedIds, setLoadedIds] = useState<Set<string>>(() => {
    const { loadedIds } = hydrateState();
    return loadedIds;
  });
  
  const [batchIndex, setBatchIndex] = useState(0);
  
  // Find NEW IDs that haven't been loaded yet
  const newIds = useMemo(() => 
    currentRapperIds.filter(id => !loadedIds.has(id)),
    [currentRapperIds, loadedIds]
  );
  
  // Current batch to fetch (load 20 at a time to prevent database overload)
  const currentBatch = useMemo(() => {
    const start = batchIndex * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    return newIds.slice(start, end);
  }, [newIds, batchIndex]);
  
  // Only fetch for current batch
  const { data: newImages } = useRapperImages(currentBatch);
  const { data: newStats } = useRapperStats(currentBatch);
  
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
  
  // Auto-advance to next batch when current batch completes
  useEffect(() => {
    if (currentBatch.length > 0 && newImages && newStats) {
      const allBatchIdsLoaded = currentBatch.every(id => 
        Object.keys(newImages).includes(id) || Object.keys(accumulatedImageMap).includes(id)
      );
      
      if (allBatchIdsLoaded && (batchIndex + 1) * BATCH_SIZE < newIds.length) {
        // Move to next batch
        setBatchIndex(prev => prev + 1);
      }
    }
  }, [newImages, newStats, currentBatch, batchIndex, newIds.length, accumulatedImageMap]);
  
  // Reset batch index when rapper list changes
  useEffect(() => {
    setBatchIndex(0);
  }, [currentRapperIds.length]);
  
  // Persist state to sessionStorage on updates
  useEffect(() => {
    persistState(accumulatedImageMap, accumulatedStatsMap, loadedIds);
  }, [accumulatedImageMap, accumulatedStatsMap, loadedIds]);
  
  return {
    imageMap: accumulatedImageMap,
    statsMap: accumulatedStatsMap,
    isLoadingNew: currentBatch.length > 0 && (!newImages || !newStats),
    totalPending: newIds.length,
    loadProgress: currentRapperIds.length > 0 ? loadedIds.size / currentRapperIds.length : 0
  };
};
