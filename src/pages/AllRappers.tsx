
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AllRappersFilters from "@/components/AllRappersFilters";
import AllRappersGrid from "@/components/AllRappersGrid";
import AllRappersLoadingSkeleton from "@/components/AllRappersLoadingSkeleton";
import AllRappersEmptyState from "@/components/AllRappersEmptyState";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="outline" className="border-hip-hop-gold/50 text-hip-hop-gold hover:bg-hip-hop-gold/20 font-street">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-graffiti text-hip-hop-gold animate-text-glow">All Rappers</h1>
              <p className="text-hip-hop-platinum font-street">Loading the culture...</p>
            </div>
          </div>
          
          <AllRappersLoadingSkeleton />
        </div>
      </div>
    );
  }

  const total = rappersData?.total || 0;
  const hasMore = rappersData?.hasMore || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" className="border-hip-hop-gold/50 text-hip-hop-gold hover:bg-hip-hop-gold/20 font-street transition-all duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-graffiti text-hip-hop-gold animate-text-glow mb-2">All Rappers</h1>
            <p className="text-hip-hop-platinum font-street text-lg">
              {total} artists in the culture • Showing {allRappers.length}
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-hip-hop-gold to-hip-hop-electric-blue mt-2"></div>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default AllRappers;
