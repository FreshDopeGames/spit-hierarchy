
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createSearchOrQuery } from "@/utils/textNormalization";

export interface UseAllRappersOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

export const useAllRappers = ({ itemsPerPage = 20, initialPage = 0 }: UseAllRappersOptions = {}) => {
  const [sortBy, setSortBy] = useState("activity");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [ratedFilter, setRatedFilter] = useState("all");
  const [allRappers, setAllRappers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);

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
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  // Debounce location input with 300ms delay (like search)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationFilter !== locationInput) {
        console.log(`[Hook] Location filter changing from "${locationFilter}" to "${locationInput}"`);
        setLocationFilter(locationInput);
        setCurrentPage(0);
        setAllRappers([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [locationInput, locationFilter]);

  const { data: rappersData, isLoading, isFetching } = useQuery({
    queryKey: ["all-rappers", sortBy, sortOrder, searchTerm, locationFilter, ratedFilter, currentPage],
    queryFn: async () => {
      const startRange = currentPage * itemsPerPage;
      const endRange = (currentPage + 1) * itemsPerPage - 1;
      
      console.log(`[Hook] Fetching page ${currentPage}: range ${startRange}-${endRange}`);
      
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

      // Apply rated/not rated filter
      if (ratedFilter !== "all") {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: votedRappers, error: votesError } = await supabase
            .from("votes")
            .select("rapper_id")
            .eq("user_id", user.id);

          if (votesError) {
            console.error("[Hook] Error fetching user votes:", votesError);
            return { rappers: [], total: 0, hasMore: false };
          }
          
          const votedRapperIds = votedRappers?.map(v => v.rapper_id) || [];
          console.log(`[Hook] User has voted on ${votedRapperIds.length} rappers`);
          
          if (ratedFilter === "rated") {
            if (votedRapperIds.length > 0) {
              console.log(`[Hook] Filtering to show only ${votedRapperIds.length} rated rappers`);
              query = query.in("id", votedRapperIds);
            } else {
              console.log("[Hook] User has no votes, returning empty result for 'rated' filter");
              return { rappers: [], total: 0, hasMore: false };
            }
          } else if (ratedFilter === "not_rated") {
            if (votedRapperIds.length > 0) {
              console.log(`[Hook] Excluding ${votedRapperIds.length} voted rappers`);
              query = query.filter('id', 'not.in', `(${votedRapperIds.join(',')})`);
            } else {
              console.log("[Hook] User has no votes, showing all rappers as 'not rated'");
            }
          }
        } else if (ratedFilter !== "all") {
          console.log("[Hook] User not logged in, returning empty result for rated filter");
          return { rappers: [], total: 0, hasMore: false };
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
      if (error) throw error;
      
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
      if (currentPage === 0) {
        console.log(`[Hook] Setting initial rappers: ${rappersData.rappers.length} items`);
        setAllRappers(rappersData.rappers);
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
  };

  const handleOrderChange = (value: string) => {
    console.log(`[Hook] Sort order changing to: ${value}`);
    setSortOrder(value);
    setCurrentPage(0);
    setAllRappers([]);
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
  };

  const handleLocationInput = (value: string) => {
    setLocationInput(value);
  };

  const handleRatedFilterChange = (value: string) => {
    console.log(`[Hook] Rated filter changing to: ${value}`);
    setRatedFilter(value);
    setCurrentPage(0);
    setAllRappers([]);
  };

  const handleLoadMore = () => {
    console.log(`[Hook] Loading more: current page ${currentPage} -> ${currentPage + 1}`);
    setCurrentPage((prev) => prev + 1);
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
