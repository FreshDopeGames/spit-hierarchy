import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AllRappersFilters from "@/components/AllRappersFilters";
import AllRappersGrid from "@/components/AllRappersGrid";
import AllRappersLoadingSkeleton from "@/components/AllRappersLoadingSkeleton";
import AllRappersEmptyState from "@/components/AllRappersEmptyState";
import HeaderNavigation from "@/components/HeaderNavigation";
import BlogPageHeader from "@/components/blog/BlogPageHeader";
import BackToTopButton from "@/components/BackToTopButton";
import Footer from "@/components/Footer";

const AllRappers = () => {
  const [sortBy, setSortBy] = useState("activity");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [ratedFilter, setRatedFilter] = useState("all");
  const [allRappers, setAllRappers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  // Helper function to merge rappers without duplicates
  const mergeRappersWithoutDuplicates = (existingRappers: any[], newRappers: any[]) => {
    const existingIds = new Set(existingRappers.map(rapper => rapper.id));
    const uniqueNewRappers = newRappers.filter(rapper => !existingIds.has(rapper.id));
    console.log(`Merging rappers: ${existingRappers.length} existing + ${newRappers.length} new = ${uniqueNewRappers.length} unique new rappers`);
    return [...existingRappers, ...uniqueNewRappers];
  };

  // Debounce search input with 2 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only reset if the search term actually changed
      if (searchTerm !== searchInput) {
        console.log(`Search term changing from "${searchTerm}" to "${searchInput}"`);
        setSearchTerm(searchInput);
        setCurrentPage(0); // Reset to first page when search changes
        setAllRappers([]); // Clear existing rappers only when search actually changes
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  // Debounce location input with 2 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationFilter !== locationInput) {
        console.log(`Location filter changing from "${locationFilter}" to "${locationInput}"`);
        setLocationFilter(locationInput);
        setCurrentPage(0);
        setAllRappers([]);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [locationInput, locationFilter]);

  const {
    data: rappersData,
    isLoading,
    isFetching
  } = useQuery({
    queryKey: ["all-rappers", sortBy, sortOrder, searchTerm, locationFilter, ratedFilter, currentPage],
    queryFn: async () => {
      const startRange = currentPage * itemsPerPage;
      const endRange = (currentPage + 1) * itemsPerPage - 1;
      
      console.log(`Fetching page ${currentPage}: range ${startRange}-${endRange}`);
      
      let query = supabase.from("rappers").select("*", {
        count: "exact"
      });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,real_name.ilike.%${searchTerm}%`);
      }

      // Apply location filter
      if (locationFilter) {
        query = query.ilike("origin", `%${locationFilter}%`);
      }

      // Apply rated/not rated filter
      if (ratedFilter !== "all") {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: votedRappers } = await supabase
            .from("votes")
            .select("rapper_id")
            .eq("user_id", user.id);
          
          const votedRapperIds = votedRappers?.map(v => v.rapper_id) || [];
          
          if (ratedFilter === "rated") {
            if (votedRapperIds.length > 0) {
              query = query.in("id", votedRapperIds);
            } else {
              return { rappers: [], total: 0, hasMore: false };
            }
          } else if (ratedFilter === "not_rated") {
            if (votedRapperIds.length > 0) {
              query = query.not("id", "in", `(${votedRapperIds.join(",")})`);
            }
          }
        } else if (ratedFilter !== "all") {
          return { rappers: [], total: 0, hasMore: false };
        }
      }

      // Apply sorting
      if (sortBy === "activity") {
        query = query.order("activity_score", {
          ascending: sortOrder === "asc",
          nullsFirst: false
        });
      } else if (sortBy === "name") {
        query = query.order("name", {
          ascending: sortOrder === "asc"
        });
      } else if (sortBy === "rating") {
        query = query.order("average_rating", {
          ascending: sortOrder === "asc",
          nullsFirst: false
        });
      } else if (sortBy === "votes") {
        query = query.order("total_votes", {
          ascending: sortOrder === "asc",
          nullsFirst: false
        });
      } else if (sortBy === "origin") {
        query = query.order("origin", {
          ascending: sortOrder === "asc",
          nullsFirst: false
        });
      }

      // Apply pagination
      const {
        data,
        error,
        count
      } = await query.range(startRange, endRange);
      
      if (error) throw error;
      
      console.log(`Received ${data?.length || 0} rappers for page ${currentPage}, total count: ${count}`);
      
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
        console.log(`Setting initial rappers: ${rappersData.rappers.length} items`);
        setAllRappers(rappersData.rappers);
      } else {
        // Subsequent pages - merge without duplicates
        console.log(`Appending page ${currentPage} rappers`);
        setAllRappers(prev => mergeRappersWithoutDuplicates(prev, rappersData.rappers));
      }
    }
  }, [rappersData, currentPage]);

  const handleSortChange = (value: string) => {
    console.log(`Sort changing to: ${value}`);
    setSortBy(value);
    setCurrentPage(0);
    setAllRappers([]);
  };

  const handleOrderChange = (value: string) => {
    console.log(`Sort order changing to: ${value}`);
    setSortOrder(value);
    setCurrentPage(0);
    setAllRappers([]);
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
  };

  // Input handler for city/state field
  const handleLocationInput = (value: string) => {
    setLocationInput(value);
  };

  const handleRatedFilterChange = (value: string) => {
    console.log(`Rated filter changing to: ${value}`);
    setRatedFilter(value);
    setCurrentPage(0);
    setAllRappers([]);
  };

  const handleLoadMore = () => {
    console.log(`Loading more: current page ${currentPage} -> ${currentPage + 1}`);
    setCurrentPage(prev => prev + 1);
  };

  if (isLoading && currentPage === 0) {
    return <div className="min-h-screen bg-[var(--theme-element-page-background-bg,var(--theme-background))] flex flex-col overflow-x-hidden">
        <HeaderNavigation isScrolled={false} />
        <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 pt-28 overflow-x-hidden">
          <BlogPageHeader title="All Rappers" />
          <div className="pt-10">
            <AllRappersLoadingSkeleton />
          </div>
        </main>
        <BackToTopButton />
        <Footer />
      </div>;
  }

  const total = rappersData?.total || 0;
  const hasMore = rappersData?.hasMore || false;

  return <div className="min-h-screen bg-[var(--theme-element-page-background-bg,var(--theme-background))] flex flex-col overflow-x-hidden">
      <HeaderNavigation isScrolled={false} />
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 pt-28 overflow-x-hidden">
        <BlogPageHeader title="All Rappers" />
        {/* Enhanced stats display */}
        <div className="mb-8">
          
        </div>
        {/* Subtitle with total rappers */}
        <p className="text-center text-[var(--theme-textMuted)] text-xl font-[var(--theme-font-display)] mb-8">
          {total} legendary rappers • Showing {allRappers.length}
        </p>
        {/* Filters and Search */}
        <AllRappersFilters searchInput={searchInput} searchTerm={searchTerm} locationInput={locationInput} locationFilter={locationFilter} sortBy={sortBy} sortOrder={sortOrder} ratedFilter={ratedFilter} onSearchInput={handleSearchInput} onLocationInput={handleLocationInput} onSortChange={handleSortChange} onOrderChange={handleOrderChange} onRatedFilterChange={handleRatedFilterChange} />
        {/* Rappers Grid with Ads */}
        {allRappers.length === 0 && !isLoading ? <AllRappersEmptyState /> : <AllRappersGrid rappers={allRappers} total={total} hasMore={hasMore} isFetching={isFetching} itemsPerPage={itemsPerPage} onLoadMore={handleLoadMore} currentPage={currentPage} />}
      </main>
      <BackToTopButton />
      <Footer />
    </div>;
};

export default AllRappers;
