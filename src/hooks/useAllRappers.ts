
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createSearchOrQuery } from "@/utils/textNormalization";
import { useNavigationState } from "./useNavigationState";

export interface UseAllRappersOptions {
  itemsPerPage?: number;
}

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
  const [allRappers, setAllRappers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(urlFilters.page || 0);
  const [isInitialMount, setIsInitialMount] = useState(true);

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

  const { data: rappersData, isLoading, isFetching } = useQuery({
    queryKey: ["all-rappers", sortBy, sortOrder, searchTerm, locationFilter, ratedFilter, currentPage],
    queryFn: async () => {
      // Tier 2: Smart windowing for deep pagination (only load last 2 pages + current for page >= 5)
      const isDeepPagination = currentPage >= 5 && isInitialMount;
      const effectiveStartPage = isDeepPagination ? Math.max(0, currentPage - 2) : 0;
      
      // On initial mount with a non-zero page, load from effectiveStartPage to currentPage
      const startRange = isInitialMount && currentPage > 0 
        ? effectiveStartPage * itemsPerPage 
        : currentPage * itemsPerPage;
      const endRange = (currentPage + 1) * itemsPerPage - 1;
      
      // Tier 1: Calculate correct limit for initial mount (load multiple pages)
      const fetchLimit = isInitialMount && currentPage > 0
        ? (currentPage - effectiveStartPage + 1) * itemsPerPage
        : itemsPerPage;
      
      console.log(`[Hook] Fetching page ${currentPage}: range ${startRange}-${endRange}, limit ${fetchLimit}${isInitialMount && currentPage > 0 ? ` (initial load, ${isDeepPagination ? 'windowed' : 'full'} fetch from page ${effectiveStartPage})` : ''}`);
      
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
    allRappers,
    currentPage,
    itemsPerPage,
    rappersData,
    isLoading,
    isFetching,
    handleSortChange,
    handleOrderChange,
    handleSearchInput,
    handleLocationInput,
    handleRatedFilterChange,
    handleLoadMore,
  };
};
