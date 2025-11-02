import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useRapperTags } from "./useRapperTags";

interface SimilarRapper extends Tables<"rappers"> {
  shared_tags_count: number;
  top5_count?: number;
  ranking_votes?: number;
}

interface UseSimilarRappersReturn {
  similarRappers: SimilarRapper[];
  isLoading: boolean;
  error: Error | null;
}

export const useSimilarRappers = (
  rapperId: string,
  minSharedTags: number = 3
): UseSimilarRappersReturn => {
  // First, fetch the current rapper's tags
  const { data: rapperTags, isLoading: tagsLoading } = useRapperTags(rapperId);

  const { data: similarRappers = [], isLoading: rappersLoading, error } = useQuery({
    queryKey: ["similar-rappers", rapperId, minSharedTags],
    queryFn: async (): Promise<SimilarRapper[]> => {
      if (!rapperTags || rapperTags.length === 0) {
        return [];
      }

      const tagIds = rapperTags.map(tag => tag.id);

      // Query for rappers that share tags with the current rapper
      const { data: assignments, error: assignmentsError } = await supabase
        .from("rapper_tag_assignments")
        .select(`
          rapper_id,
          rappers!inner(*)
        `)
        .in("tag_id", tagIds)
        .neq("rapper_id", rapperId);

      if (assignmentsError) throw assignmentsError;

      // Group by rapper and count shared tags
      const rapperMap = new Map<string, { rapper: any; sharedCount: number }>();
      
      assignments?.forEach(assignment => {
        const rapper = assignment.rappers;
        if (rapper && rapper.id) {
          const existing = rapperMap.get(rapper.id);
          if (existing) {
            existing.sharedCount++;
          } else {
            rapperMap.set(rapper.id, { rapper, sharedCount: 1 });
          }
        }
      });

      // Filter for minimum shared tags and sort
      const filteredRappers = Array.from(rapperMap.values())
        .filter(item => item.sharedCount >= minSharedTags)
        .sort((a, b) => {
          if (b.sharedCount !== a.sharedCount) {
            return b.sharedCount - a.sharedCount;
          }
          return (b.rapper.total_votes || 0) - (a.rapper.total_votes || 0);
        })
        .slice(0, 5)
        .map(item => ({
          ...item.rapper,
          shared_tags_count: item.sharedCount
        }));

      // Fetch top5_count for each rapper
      const rapperIds = filteredRappers.map(r => r.id);
      if (rapperIds.length > 0) {
        const { data: top5Data } = await supabase
          .from("user_top_rappers")
          .select("rapper_id")
          .in("rapper_id", rapperIds);

        const top5Counts = new Map<string, number>();
        top5Data?.forEach(item => {
          top5Counts.set(item.rapper_id, (top5Counts.get(item.rapper_id) || 0) + 1);
        });

        return filteredRappers.map(rapper => ({
          ...rapper,
          top5_count: top5Counts.get(rapper.id) || 0
        })) as SimilarRapper[];
      }

      return filteredRappers as SimilarRapper[];
    },
    enabled: !!rapperId && !tagsLoading && !!rapperTags && rapperTags.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    similarRappers,
    isLoading: tagsLoading || rappersLoading,
    error: error as Error | null,
  };
};
