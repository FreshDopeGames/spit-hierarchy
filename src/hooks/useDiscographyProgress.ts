import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DiscographyProgress {
  id: string;
  rapper_id: string;
  fetch_id: string;
  total_releases: number;
  processed_releases: number;
  current_album: string | null;
  status: 'starting' | 'fetching' | 'processing' | 'complete' | 'error';
  started_at: string;
  updated_at: string;
}

export const useDiscographyProgress = (fetchId: string | null) => {
  const [progress, setProgress] = useState<DiscographyProgress | null>(null);

  useEffect(() => {
    if (!fetchId) {
      setProgress(null);
      return;
    }

    // Fetch initial progress
    const fetchInitialProgress = async () => {
      const { data } = await supabase
        .from('discography_fetch_progress')
        .select('*')
        .eq('fetch_id', fetchId)
        .maybeSingle();
      
      if (data) {
        setProgress(data as DiscographyProgress);
      }
    };

    fetchInitialProgress();

    // Subscribe to realtime updates for this fetch operation
    const channel = supabase
      .channel(`discography-progress-${fetchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discography_fetch_progress',
          filter: `fetch_id=eq.${fetchId}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setProgress(null);
          } else {
            setProgress(payload.new as DiscographyProgress);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchId]);

  const progressPercentage = progress && progress.total_releases > 0
    ? Math.round((progress.processed_releases / progress.total_releases) * 100)
    : 0;

  const estimatedSecondsRemaining = progress && progress.total_releases > 0
    ? Math.ceil((progress.total_releases - progress.processed_releases) * 1.5)
    : null;

  return { 
    progress, 
    progressPercentage,
    estimatedSecondsRemaining,
    isComplete: progress?.status === 'complete',
    hasError: progress?.status === 'error'
  };
};
