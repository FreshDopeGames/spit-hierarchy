
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UseAllRappersOptions {
  itemsPerPage?: number;
}

export const useAllRappers = ({ itemsPerPage = 20 }: UseAllRappersOptions = {}) => {
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [allRappers, setAllRappers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Debounce search input with 2 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setCurrentPage(0);
        setAllRappers([]);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  const { data: rappersData, isLoading, isFetching } = useQuery({
    queryKey: ["all-rappers", sortBy, sortOrder, searchTerm, locationFilter, currentPage],
    queryFn: async () => {
      let query = supabase.from("rappers").select("*", { count: "exact" });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,real_name.ilike.%${searchTerm}%`);
      }

      // Apply location filter
      if (locationFilter) {
        query = query.ilike("origin", `%${locationFilter}%`);
      }

      // Apply sorting
      if (sortBy === "name") {
        query = query.order("name", { ascending: sortOrder === "asc" });
      } else if (sortBy === "rating") {
        query = query.order("average_rating", { ascending: sortOrder === "asc", nullsFirst: false });
      } else if (sortBy === "votes") {
        query = query.order("total_votes", { ascending: sortOrder === "asc" });
      } else if (sortBy === "origin") {
        query = query.order("origin", { ascending: sortOrder === "asc", nullsFirst: false });
      }

      // Apply pagination
      const { data, error, count } = await query.range(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage - 1
      );
      if (error) throw error;
      return {
        rappers: data || [],
        total: count || 0,
        hasMore: (count || 0) > (currentPage + 1) * itemsPerPage,
      };
    },
  });

  useEffect(() => {
    if (rappersData?.rappers) {
      if (currentPage === 0) {
        setAllRappers(rappersData.rappers);
      } else {
        setAllRappers((prev) => [...prev, ...rappersData.rappers]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rappersData, currentPage]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(0);
    setAllRappers([]);
  };

  const handleOrderChange = (value: string) => {
    setSortOrder(value);
    setCurrentPage(0);
    setAllRappers([]);
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
  };

  const handleLocationFilter = (value: string) => {
    setLocationFilter(value);
    setCurrentPage(0);
    setAllRappers([]);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return {
    sortBy,
    sortOrder,
    searchInput,
    searchTerm,
    locationFilter,
    allRappers,
    currentPage,
    itemsPerPage,
    rappersData,
    isLoading,
    isFetching,
    handleSortChange,
    handleOrderChange,
    handleSearchInput,
    handleLocationFilter,
    handleLoadMore,
  };
};
