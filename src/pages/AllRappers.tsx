
import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Calendar, Verified, Music, ArrowLeft, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import BillboardAd from "@/components/BillboardAd";

type Rapper = Tables<"rappers">;

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="bg-black/40 border-purple-500/20 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const rappers = rappersData?.rappers || [];
  const total = rappersData?.total || 0;
  const hasMore = rappersData?.hasMore || false;

  // Split rappers into chunks to insert ads between sections
  const rappersWithAds = [];
  const chunkSize = itemsPerPage;
  
  for (let i = 0; i < rappers.length; i += chunkSize) {
    const chunk = rappers.slice(i, i + chunkSize);
    rappersWithAds.push({ type: 'rappers', data: chunk, isFirstChunk: i === 0 });
    
    // Add ad after each chunk except the last one
    if (i + chunkSize < rappers.length) {
      rappersWithAds.push({ 
        type: 'ad', 
        data: {
          title: "Discover New Music",
          description: "Find the latest hip-hop tracks and underground artists",
          ctaText: "Explore Now"
        }
      });
    }
  }

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
        <div className="bg-black/40 border border-purple-500/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search rappers..."
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="pl-10 bg-black/60 border-purple-500/30 text-white placeholder-gray-400"
              />
              {searchInput !== searchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Location Filter */}
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => handleLocationFilter(e.target.value)}
              className="bg-black/60 border-purple-500/30 text-white placeholder-gray-400"
            />

            {/* Sort By */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="bg-black/60 border-purple-500/30 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-purple-500/30 text-white">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="votes">Vote Count</SelectItem>
                <SelectItem value="origin">Location</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={handleOrderChange}>
              <SelectTrigger className="bg-black/60 border-purple-500/30 text-white">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-purple-500/30 text-white">
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rappers Grid with Ads */}
        {rappers.length === 0 ? (
          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-8 text-center">
              <Music className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Rappers Found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {rappersWithAds.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.type === 'rappers' ? (
                  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${section.isFirstChunk ? 'mb-8' : 'mb-8'}`}>
                    {section.data.map((rapper) => (
                      <Link key={rapper.id} to={`/rapper/${rapper.id}`}>
                        <Card className="bg-black/40 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
                          <CardContent className="p-6">
                            {/* Rapper Image Placeholder */}
                            <div className="w-full h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                              <Music className="w-12 h-12 text-white/70" />
                            </div>

                            {/* Rapper Info */}
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h3 className="text-white font-bold text-lg leading-tight">{rapper.name}</h3>
                                {rapper.verified && (
                                  <Verified className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                )}
                              </div>

                              {rapper.real_name && (
                                <p className="text-gray-400 text-sm">{rapper.real_name}</p>
                              )}

                              <div className="flex flex-wrap gap-2 text-xs">
                                {rapper.origin && (
                                  <div className="flex items-center gap-1 text-gray-300">
                                    <MapPin className="w-3 h-3" />
                                    <span>{rapper.origin}</span>
                                  </div>
                                )}
                                {rapper.birth_year && (
                                  <div className="flex items-center gap-1 text-gray-300">
                                    <Calendar className="w-3 h-3" />
                                    <span>{rapper.birth_year}</span>
                                  </div>
                                )}
                              </div>

                              {/* Stats */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="text-white font-semibold">
                                    {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
                                  </span>
                                </div>
                                <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                                  {rapper.total_votes || 0} votes
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <BillboardAd
                    title={section.data.title}
                    description={section.data.description}
                    ctaText={section.data.ctaText}
                  />
                )}
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading More...
                    </>
                  ) : (
                    `Load More Rappers (${total - rappers.length} remaining)`
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllRappers;
