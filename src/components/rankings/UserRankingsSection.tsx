import React, { useState } from "react";
import { Users, Filter, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import RankingCard from "./RankingCard";
import { useOptimizedUserRankings } from "@/hooks/useOptimizedUserRankings";
import { transformUserRankings } from "@/utils/rankingTransformers";

const UserRankingsSection = () => {
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "trending">("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const { data: userRankingData, isLoading, error } = useOptimizedUserRankings();

  // Transform the data to unified format
  const [userRankings, setUserRankings] = useState<any[]>([]);

  // Transform rankings when data changes
  React.useEffect(() => {
    if (userRankingData) {
      transformUserRankings(userRankingData).then(setUserRankings);
    }
  }, [userRankingData]);

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
        return (b.totalVotes || 0) - (a.totalVotes || 0);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-rap-platinum font-merienda">
          Loading community rankings...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-black via-rap-carbon to-rap-charcoal border-red-500/30">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-merienda">
            Failed to load community rankings. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-rap-burgundy flex-shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold text-rap-platinum font-mogra">Community Rankings</h2>
          <Badge variant="secondary" className="bg-rap-burgundy/20 text-rap-burgundy border-rap-burgundy/30 font-kaushan text-xs sm:text-sm">
            Member Made
          </Badge>
        </div>
        
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
                  Most Votes
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
      </div>

      {sortedRankings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {sortedRankings.map(ranking => (
            <RankingCard 
              key={ranking.id} 
              ranking={ranking} 
              isUserRanking={true}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-black via-rap-carbon to-rap-charcoal border-rap-smoke/30">
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
