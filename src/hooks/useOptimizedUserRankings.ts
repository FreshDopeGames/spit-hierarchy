
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchUserRankingsOptimized, fetchUserRankingsCount } from "@/services/optimizedUserRankingService";

const RANKINGS_PER_PAGE = 12;

export const useOptimizedUserRankings = () => {
  return useInfiniteQuery({
    queryKey: ["optimized-user-rankings"],
    queryFn: async ({ pageParam = 0 }) => {
      const rankings = await fetchUserRankingsOptimized(RANKINGS_PER_PAGE, pageParam * RANKINGS_PER_PAGE);
      return {
        rankings,
        nextPage: rankings.length === RANKINGS_PER_PAGE ? pageParam + 1 : undefined,
        hasMore: rankings.length === RANKINGS_PER_PAGE
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserRankingsCount = () => {
  return useQuery({
    queryKey: ["user-rankings-count"],
    queryFn: fetchUserRankingsCount,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
