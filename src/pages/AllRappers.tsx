
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
  const [loadedCount, setLoadedCount] = useState(20);
  
  const itemsPerPage = 20;

  // Debounce search input with 2 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setLoadedCount(20); // Reset to initial load when search changes
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: rappersData, isLoading, isFetching } = useQuery({
    queryKey: ["all-rappers", sortBy, sortOrder, searchTerm, locationFilter, loadedCount],
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

      // Apply limit for "Load More" functionality
      const { data, error, count } = await query.limit(loadedCount);
      
      if (error) throw error;
      
      return {
        rappers: data || [],
        total: count || 0,
        hasMore: (count || 0) > loadedCount
      };
    }
  });

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setLoadedCount(20); // Reset to initial load when sorting changes
  };

  const handleOrderChange = (value: string) => {
    setSortOrder(value);
    setLoadedCount(20);
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
  };

  const handleLocationFilter = (value: string) => {
    setLocationFilter(value);
    setLoadedCount(20);
  };

  const handleLoadMore = () => {
    setLoadedCount(prev => prev + itemsPerPage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">All Rappers</h1>
          </div>
          
          <AllRappersLoadingSkeleton />
        </div>
      </div>
    );
  }

  const rappers = rappersData?.rappers || [];
  const total = rappersData?.total || 0;
  const hasMore = rappersData?.hasMore || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">All Rappers</h1>
            <p className="text-gray-300">{total} rappers total • Showing {rappers.length}</p>
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
        {rappers.length === 0 ? (
          <AllRappersEmptyState />
        ) : (
          <AllRappersGrid
            rappers={rappers}
            total={total}
            hasMore={hasMore}
            isFetching={isFetching}
            loadedCount={loadedCount}
            itemsPerPage={itemsPerPage}
            onLoadMore={handleLoadMore}
          />
        )}
      </div>
    </div>
  );
};

export default AllRappers;
