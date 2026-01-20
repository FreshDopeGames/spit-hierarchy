
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createSearchOrQuery } from "@/utils/textNormalization";
import { useNavigationState } from "./useNavigationState";

export interface UseAllRappersOptions {
  itemsPerPage?: number;
}

// Get zodiac date ranges for filtering
const getZodiacDateRanges = (signName: string): { month1: number; dayStart1: number; dayEnd1: number; month2: number; dayStart2: number; dayEnd2: number } | null => {
  const ranges: Record<string, { month1: number; dayStart1: number; dayEnd1: number; month2: number; dayStart2: number; dayEnd2: number }> = {
    'Aries': { month1: 3, dayStart1: 21, dayEnd1: 31, month2: 4, dayStart2: 1, dayEnd2: 19 },
    'Taurus': { month1: 4, dayStart1: 20, dayEnd1: 30, month2: 5, dayStart2: 1, dayEnd2: 20 },
    'Gemini': { month1: 5, dayStart1: 21, dayEnd1: 31, month2: 6, dayStart2: 1, dayEnd2: 20 },
    'Cancer': { month1: 6, dayStart1: 21, dayEnd1: 30, month2: 7, dayStart2: 1, dayEnd2: 22 },
    'Leo': { month1: 7, dayStart1: 23, dayEnd1: 31, month2: 8, dayStart2: 1, dayEnd2: 22 },
    'Virgo': { month1: 8, dayStart1: 23, dayEnd1: 31, month2: 9, dayStart2: 1, dayEnd2: 22 },
    'Libra': { month1: 9, dayStart1: 23, dayEnd1: 30, month2: 10, dayStart2: 1, dayEnd2: 22 },
    'Scorpio': { month1: 10, dayStart1: 23, dayEnd1: 31, month2: 11, dayStart2: 1, dayEnd2: 21 },
    'Sagittarius': { month1: 11, dayStart1: 22, dayEnd1: 30, month2: 12, dayStart2: 1, dayEnd2: 21 },
    'Capricorn': { month1: 12, dayStart1: 22, dayEnd1: 31, month2: 1, dayStart2: 1, dayEnd2: 19 },
    'Aquarius': { month1: 1, dayStart1: 20, dayEnd1: 31, month2: 2, dayStart2: 1, dayEnd2: 18 },
    'Pisces': { month1: 2, dayStart1: 19, dayEnd1: 29, month2: 3, dayStart2: 1, dayEnd2: 20 },
  };
  return ranges[signName] || null;
};

export const useAllRappers = ({ itemsPerPage = 20 }: UseAllRappersOptions = {}) => {
  const { getAllFilters, setAllFilters } = useNavigationState();
  const urlFilters = getAllFilters();
  
  // Initialize all state from URL parameters
  const [sortBy, setSortBy] = useState(urlFilters.sort || "activity");
  const [sortOrder, setSortOrder] = useState(urlFilters.order || "desc");
  const [searchInput, setSearchInput] = useState(urlFilters.search || "");
  const [searchTerm, setSearchTerm] = useState(urlFilters.search || "");
  const [locationInput, setLocationInput] = useState(urlFilters.location || "");
  const [locationFilter, setLocationFilter] = useState(urlFilters.location || "");
  const [ratedFilter, setRatedFilter] = useState(urlFilters.rated || "all");
  const [zodiacFilter, setZodiacFilter] = useState(urlFilters.zodiac || "all");
  const [allRappers, setAllRappers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(urlFilters.page || 0);
  const [isInitialMount, setIsInitialMount] = useState(true);
  
  // Phase 3: Micro-batch mode for rapid initial loading
  const [isMicroBatchMode, setIsMicroBatchMode] = useState(true);
  const effectiveItemsPerPage = isMicroBatchMode ? 5 : itemsPerPage;

  // Helper function to merge rappers without duplicates
  const mergeRappersWithoutDuplicates = (existingRappers: any[], newRappers: any[]) => {
    const existingIds = new Set(existingRappers.map(rapper => rapper.id));
    const uniqueNewRappers = newRappers.filter(rapper => !existingIds.has(rapper.id));
    console.log(`[Hook] Merging rappers: ${existingRappers.length} existing + ${newRappers.length} new = ${uniqueNewRappers.length} unique new rappers`);
    return [...existingRappers, ...uniqueNewRappers];
  };

  // Debounce search input with 300ms delay for instant feedback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchInput) {
        console.log(`[Hook] Search term changing from "${searchTerm}" to "${searchInput}"`);
        setSearchTerm(searchInput);
        setCurrentPage(0);
        setAllRappers([]);
        setAllFilters({ search: searchInput, page: 0 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchTerm, setAllFilters]);

  // Debounce location input with 300ms delay (like search)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationFilter !== locationInput) {
        console.log(`[Hook] Location filter changing from "${locationFilter}" to "${locationInput}"`);
        setLocationFilter(locationInput);
        setCurrentPage(0);
        setAllRappers([]);
        setAllFilters({ location: locationInput, page: 0 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [locationInput, locationFilter, setAllFilters]);

  // Disable micro-batch mode after loading 60 rappers (3 full pages)
  useEffect(() => {
    if (allRappers.length >= 60 && isMicroBatchMode) {
      console.log('[Hook] Switching to normal batch mode after 60 rappers');
      setIsMicroBatchMode(false);
    }
  }, [allRappers.length, isMicroBatchMode]);

  const { data: rappersData, isLoading, isFetching } = useQuery({
    queryKey: ["all-rappers", sortBy, sortOrder, searchTerm, locationFilter, ratedFilter, zodiacFilter, currentPage, isMicroBatchMode],
    queryFn: async () => {
      // Always load from page 0 to allow scrolling to earlier pages
      const effectiveStartPage = 0;
      
      // Phase 3: Use micro-batch size for rapid loading (first 3 pages)
      const batchSize = isMicroBatchMode ? effectiveItemsPerPage : itemsPerPage;
      
      // On initial mount with a non-zero page, load from effectiveStartPage to currentPage
      const startRange = isInitialMount && currentPage > 0 
        ? effectiveStartPage * itemsPerPage 
        : currentPage * itemsPerPage;
      const endRange = (currentPage + 1) * itemsPerPage - 1;
      
      // Tier 1: Calculate correct limit for initial mount (load multiple pages)
      // In micro-batch mode, we load smaller chunks rapidly
      const fetchLimit = isInitialMount && currentPage > 0
        ? (currentPage - effectiveStartPage + 1) * itemsPerPage
        : batchSize;
      
      console.log(`[Hook] Fetching page ${currentPage}: range ${startRange}-${endRange}, limit ${fetchLimit}, batchSize ${batchSize}${isMicroBatchMode ? ' (micro-batch mode)' : ''}${isInitialMount && currentPage > 0 ? ` (initial load from page ${effectiveStartPage})` : ''}`);
      
      // Use efficient RPCs for rated/not_rated filters
      if (ratedFilter === "rated" || ratedFilter === "not_rated") {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("[Hook] User not logged in, returning empty result for rated filter");
          return { rappers: [], total: 0, hasMore: false };
        }

        const rpcName = ratedFilter === "rated" ? "get_rated_rappers" : "get_unrated_rappers";
        const sortByMap: Record<string, string> = {
          activity: "activity_score",
          name: "name",
          rating: "average_rating",
          votes: "total_votes",
          origin: "origin"
        };

        console.log(`[Hook] Calling RPC: ${rpcName} with ${sortByMap[sortBy]} ${sortOrder}, limit: ${fetchLimit}, offset: ${startRange}`);

        const { data, error } = await supabase.rpc(rpcName, {
          p_user_id: user.id,
          p_search: searchTerm || null,
          p_origin: locationFilter || null,
          p_sort_by: sortByMap[sortBy],
          p_sort_order: sortOrder,
          p_limit: fetchLimit,
          p_offset: startRange
        });

        if (error) {
          console.error(`[Hook] RPC ${rpcName} error:`, error);
          throw error;
        }

        const total = data?.[0]?.total_count || 0;
        console.log(`[Hook] RPC returned ${data?.length || 0} rappers, total: ${total}`);

        return {
          rappers: data || [],
          total: Number(total),
          hasMore: (Number(total) || 0) > (currentPage + 1) * itemsPerPage,
        };
      }

      // Standard query for "all" rappers
      let query = supabase.from("rappers").select("*", { count: "exact" });

      // Apply enhanced search filter with normalization
      if (searchTerm) {
        const searchOrQuery = createSearchOrQuery(searchTerm, ['name', 'real_name']);
        query = query.or(searchOrQuery);
      }

      // Apply location filter
      if (locationFilter) {
        query = query.ilike("origin", `%${locationFilter}%`);
      }

      // Apply zodiac filter
      if (zodiacFilter && zodiacFilter !== "all") {
        const ranges = getZodiacDateRanges(zodiacFilter);
        if (ranges) {
          // Build OR condition for the two month ranges of the zodiac sign
          query = query.or(
            `and(birth_month.eq.${ranges.month1},birth_day.gte.${ranges.dayStart1},birth_day.lte.${ranges.dayEnd1}),and(birth_month.eq.${ranges.month2},birth_day.gte.${ranges.dayStart2},birth_day.lte.${ranges.dayEnd2})`
          );
        }
      }

      // Apply sorting with secondary sort for consistent ordering
      if (sortBy === "activity") {
        query = query
          .order("activity_score", { ascending: sortOrder === "asc", nullsFirst: false })
          .order("name", { ascending: true });
      } else if (sortBy === "name") {
        query = query.order("name", { ascending: sortOrder === "asc" });
      } else if (sortBy === "rating") {
        query = query
          .order("average_rating", { ascending: sortOrder === "asc", nullsFirst: false })
          .order("name", { ascending: true });
      } else if (sortBy === "votes") {
        query = query
          .order("total_votes", { ascending: sortOrder === "asc", nullsFirst: false })
          .order("name", { ascending: true });
      } else if (sortBy === "origin") {
        query = query
          .order("origin", { ascending: sortOrder === "asc", nullsFirst: false })
          .order("name", { ascending: true });
      }

      // Apply pagination
      const { data, error, count } = await query.range(startRange, endRange);
      if (error) {
        console.error("[Hook] Query error:", error);
        throw error;
      }
      
      console.log(`[Hook] Received ${data?.length || 0} rappers for page ${currentPage}, total count: ${count}`);
      
      return {
        rappers: data || [],
        total: count || 0,
        hasMore: (count || 0) > (currentPage + 1) * itemsPerPage,
      };
    },
    staleTime: 30000,
  });

  // Real-time subscription for rapper updates
  useEffect(() => {
    const channel = supabase
      .channel('rappers-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rappers'
        },
        (payload) => {
          console.log('[Hook] Rapper updated via realtime:', payload);
          // Update the specific rapper in our local state
          setAllRappers(prev => prev.map(rapper => 
            rapper.id === payload.new.id ? { ...rapper, ...payload.new } : rapper
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (rappersData?.rappers) {
      if (currentPage === 0 || isInitialMount) {
        console.log(`[Hook] Setting initial rappers: ${rappersData.rappers.length} items (isInitialMount: ${isInitialMount})`);
        setAllRappers(rappersData.rappers);
        if (isInitialMount) {
          setIsInitialMount(false);
        }
      } else {
        console.log(`[Hook] Appending page ${currentPage} rappers`);
        setAllRappers((prev) => mergeRappersWithoutDuplicates(prev, rappersData.rappers));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rappersData, currentPage]);

  const handleSortChange = (value: string) => {
    console.log(`[Hook] Sort changing to: ${value}`);
    setSortBy(value);
    setCurrentPage(0);
    setAllRappers([]);
    setAllFilters({ sort: value, page: 0 });
  };

  const handleOrderChange = (value: string) => {
    console.log(`[Hook] Sort order changing to: ${value}`);
    setSortOrder(value);
    setCurrentPage(0);
    setAllRappers([]);
    setAllFilters({ order: value, page: 0 });
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    // Search term will be updated by debounce effect
  };

  const handleLocationInput = (value: string) => {
    setLocationInput(value);
    // Location filter will be updated by debounce effect
  };

  const handleRatedFilterChange = (value: string) => {
    console.log(`[Hook] Rated filter changing to: ${value}`);
    setRatedFilter(value);
    setCurrentPage(0);
    setAllRappers([]);
    setAllFilters({ rated: value, page: 0 });
  };

  const handleZodiacFilterChange = (value: string) => {
    console.log(`[Hook] Zodiac filter changing to: ${value}`);
    setZodiacFilter(value);
    setCurrentPage(0);
    setAllRappers([]);
    setAllFilters({ zodiac: value, page: 0 });
  };

  const handleLoadMore = () => {
    console.log(`[Hook] Loading more: current page ${currentPage} -> ${currentPage + 1}`);
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    setAllFilters({ page: newPage });
  };

  return {
    sortBy,
    sortOrder,
    searchInput,
    searchTerm,
    locationInput,
    locationFilter,
    ratedFilter,
    zodiacFilter,
    allRappers,
    currentPage,
    itemsPerPage: effectiveItemsPerPage, // Return effective size
    rappersData,
    isLoading,
    isFetching,
    total: rappersData?.total || 0,
    hasMore: rappersData?.hasMore || false,
    handleSortChange,
    handleOrderChange,
    handleSearchInput,
    handleLocationInput,
    handleRatedFilterChange,
    handleZodiacFilterChange,
    handleLoadMore,
  };
};
