
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchUserRankingsOptimized, fetchUserRankingsCount } from "@/services/optimizedUserRankingService";
import { UserRanking } from "@/types/userRanking";

const RANKINGS_PER_PAGE = 12;

interface RankingsPage {
  rankings: UserRanking[];
  nextPage?: number;
  hasMore: boolean;
}

export const useOptimizedUserRankings = () => {
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useUserRankingsCount = () => {
  return useQuery<number, Error>({
    queryKey: ["user-rankings-count"],
    queryFn: fetchUserRankingsCount,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
