import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AllRappersFilters from "@/components/AllRappersFilters";
import AllRappersGrid from "@/components/AllRappersGrid";
import AllRappersLoadingSkeleton from "@/components/AllRappersLoadingSkeleton";
import AllRappersEmptyState from "@/components/AllRappersEmptyState";
import HeaderNavigation from "@/components/HeaderNavigation";
import BlogPageHeader from "@/components/blog/BlogPageHeader";
import AllRappersPage from "./AllRappersPage";

const AllRappers = () => {
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchInput, setSearchInput] = useState(""); // Input value for immediate UI updates
  const [searchTerm, setSearchTerm] = useState(""); // Debounced value for API calls
  const [locationFilter, setLocationFilter] = useState("");
  const [allRappers, setAllRappers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  
  const itemsPerPage = 20;

  // Debounce search input with 2 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only reset if the search term actually changed
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setCurrentPage(0); // Reset to first page when search changes
        setAllRappers([]); // Clear existing rappers only when search actually changes
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  const { data: rappersData, isLoading, isFetching } = useQuery({
    queryKey: ["all-rappers", sortBy, sortOrder, searchTerm, locationFilter, currentPage],
    queryFn: async () => {
      let query = supabase
        .from("rappers")
        .select("*", { count: "exact" });

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

      // Apply pagination - only fetch the current page
      const { data, error, count } = await query
        .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
      
      if (error) throw error;
      
      return {
        rappers: data || [],
        total: count || 0,
        hasMore: (count || 0) > (currentPage + 1) * itemsPerPage
      };
    }
  });

  // Update allRappers when new data comes in
  useEffect(() => {
    if (rappersData?.rappers) {
      if (currentPage === 0) {
        // First page or reset - replace all rappers
        setAllRappers(rappersData.rappers);
      } else {
        // Subsequent pages - append to existing rappers
        setAllRappers(prev => [...prev, ...rappersData.rappers]);
      }
    }
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
    setCurrentPage(prev => prev + 1);
  };

  if (isLoading && currentPage === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex flex-col">
        <HeaderNavigation isScrolled={false} />
        <main className="flex-1 max-w-7xl mx-auto p-6 pt-28">
          <BlogPageHeader title="All Rappers" />
          <div className="pt-10">
            <AllRappersLoadingSkeleton />
          </div>
        </main>
      </div>
    );
  }

  const total = rappersData?.total || 0;
  const hasMore = rappersData?.hasMore || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex flex-col">
      <HeaderNavigation isScrolled={false} />
      <main className="flex-1 max-w-7xl mx-auto p-6 pt-28">
        <BlogPageHeader title="All Rappers" />
        {/* Enhanced stats display */}
        <div className="mb-8">
          <div className="w-32 h-1 bg-gradient-to-r from-rap-burgundy via-rap-forest to-rap-silver rounded-full"></div>
        </div>
        {/* Subtitle with total rappers */}
        <p className="text-center text-rap-smoke text-xl font-kaushan mb-8">
          {total} legendary rappers • Showing {allRappers.length}
        </p>
        {/* Filters and Search */}
        <AllRappersFilters
          searchInput={searchInput}
          searchTerm={searchTerm}
          locationFilter={locationFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchInput={handleSearchInput}
          onLocationFilter={handleLocationFilter}
          onSortChange={handleSortChange}
          onOrderChange={handleOrderChange}
        />
        {/* Rappers Grid with Ads */}
        {allRappers.length === 0 && !isLoading ? (
          <AllRappersEmptyState />
        ) : (
          <AllRappersGrid
            rappers={allRappers}
            total={total}
            hasMore={hasMore}
            isFetching={isFetching}
            itemsPerPage={itemsPerPage}
            onLoadMore={handleLoadMore}
          />
        )}
      </main>
    </div>
  );
};

export default AllRappersPage;
