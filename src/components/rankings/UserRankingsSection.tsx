
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Filter, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import RankingCard from "./RankingCard";
import { useOptimizedUserRankings } from "@/hooks/useOptimizedUserRankings";

const UserRankingsSection = () => {
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "trending">("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const { data: userRankings, isLoading, error } = useOptimizedUserRankings();

  // Get unique categories for filtering
  const uniqueCategories = Array.from(
    new Set(userRankings?.map(ranking => ranking.category).filter(Boolean))
  );

  // Filter and sort rankings
  const filteredRankings = userRankings?.filter(ranking => 
    categoryFilter === "all" || ranking.category === categoryFilter
  ) || [];

  const sortedRankings = [...filteredRankings].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "popular":
        return (b.views || 0) - (a.views || 0);
      case "trending":
        return (b.likes || 0) - (a.likes || 0);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-rap-platinum font-merienda">Loading community rankings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-carbon-fiber border-red-500/30">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-merienda">
            Failed to load community rankings. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="bg-carbon-fiber border-rap-burgundy/40">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-rap-burgundy" />
            <CardTitle className="text-2xl font-mogra text-rap-platinum">
              Member Made Rankings
            </CardTitle>
            <Badge variant="secondary" className="bg-rap-burgundy/20 text-rap-burgundy border-rap-burgundy/30">
              Community
            </Badge>
          </div>
          <p className="text-rap-smoke font-merienda">
            Discover unique perspectives from our community members
          </p>
        </CardHeader>
        
        {/* Filters and Sorting */}
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40 bg-rap-carbon border-rap-smoke/30 text-rap-platinum">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Most Views
                    </div>
                  </SelectItem>
                  <SelectItem value="trending">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Most Liked
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-rap-carbon border-rap-smoke/30 text-rap-platinum">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-rap-smoke font-merienda">
              {sortedRankings.length} ranking{sortedRankings.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings Grid */}
      {sortedRankings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRankings.map(ranking => (
            <RankingCard 
              key={ranking.id} 
              ranking={ranking} 
              isUserRanking={true}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-carbon-fiber border-rap-smoke/30">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-rap-smoke mx-auto mb-4" />
            <h3 className="text-xl font-mogra text-rap-platinum mb-2">
              No Community Rankings Found
            </h3>
            <p className="text-rap-smoke font-merienda">
              {categoryFilter !== "all" 
                ? `No rankings found in the "${categoryFilter}" category.`
                : "Be the first to create a community ranking!"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserRankingsSection;
