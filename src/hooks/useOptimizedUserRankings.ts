
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchUserRankingsOptimized, fetchUserRankingsCount } from "@/services/optimizedUserRankingService";
import { UserRanking } from "@/types/userRanking";
import { useAdaptivePolling } from "./useAdaptivePolling";

const RANKINGS_PER_PAGE = 12;

interface RankingsPage {
  rankings: UserRanking[];
  nextPage?: number;
  hasMore: boolean;
}

export const useOptimizedUserRankings = () => {
  const { refetchInterval, refetchIntervalInBackground } = useAdaptivePolling({
    baseInterval: 60000, // 1 minute for user rankings
    maxInterval: 600000, // Max 10 minutes
    enabled: true
  });

  return useInfiniteQuery<RankingsPage, Error>({
    queryKey: ["optimized-user-rankings"],
    queryFn: async ({ pageParam }): Promise<RankingsPage> => {
      const pageNumber = (pageParam as number) || 0;
      const rankings = await fetchUserRankingsOptimized(RANKINGS_PER_PAGE, pageNumber * RANKINGS_PER_PAGE);
      return {
        rankings,
        nextPage: rankings.length === RANKINGS_PER_PAGE ? pageNumber + 1 : undefined,
        hasMore: rankings.length === RANKINGS_PER_PAGE
      };
    },
    getNextPageParam: (lastPage: RankingsPage) => lastPage.nextPage,
    staleTime: 20 * 60 * 1000, // 20 minutes - user rankings change infrequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval,
    refetchIntervalInBackground,
  });
};

export const useUserRankingsCount = () => {
  return useQuery<number, Error>({
    queryKey: ["user-rankings-count"],
    queryFn: fetchUserRankingsCount,
    staleTime: 30 * 60 * 1000, // 30 minutes - count changes very infrequently
    refetchOnWindowFocus: false,
  });
};
