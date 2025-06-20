
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Star, Trophy, Plus, ChevronDown } from "lucide-react";
import RankingCard from "./RankingCard";
import { useAuth } from "@/hooks/useAuth";
import CreateRankingDialog from "./CreateRankingDialog";

// Interface for the ranking data expected by this component
interface RankingData {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  timeAgo: string;
  rappers: Array<{
    rank: number;
    name: string;
    reason: string;
  }>;
  likes: number;
  views: number;
  isOfficial: boolean;
  tags: string[];
  slug: string;
  comments: number;
  category: string;
  isPublic: boolean;
  createdAt: string;
}

interface UserRankingsSectionProps {
  rankings: RankingData[];
  onRankingClick: (id: string) => void;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

const UserRankingsSection = ({
  rankings,
  onRankingClick,
  hasNextPage,
  onLoadMore,
  isLoadingMore
}: UserRankingsSectionProps) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "my-rankings" | "popular">("all");

  const filteredRankings = rankings.filter(ranking => {
    if (filter === "my-rankings") return user && ranking.authorId === user.id;
    if (filter === "popular") return ranking.likes > 200;
    return true;
  });

  // Transform rankings to match RankingCard props
  const transformedRankings = filteredRankings.map(ranking => ({
    ...ranking,
    views: ranking.views || 0,
    isOfficial: false
  }));

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-rap-forest flex-shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold text-rap-platinum font-mogra">Member Made Rankings</h2>
        </div>
        
        {/* Filter Tabs and Create Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            onClick={() => setFilter("all")} 
            size="sm" 
            className={filter === "all" ? "bg-rap-gold hover:bg-rap-gold-light text-rap-charcoal font-mogra text-xs sm:text-sm" : "border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-charcoal font-mogra text-xs sm:text-sm"}
          >
            All
          </Button>
          <Button 
            variant={filter === "popular" ? "default" : "outline"} 
            onClick={() => setFilter("popular")} 
            size="sm" 
            className={filter === "popular" ? "bg-rap-gold hover:bg-rap-gold-light text-rap-charcoal font-mogra text-xs sm:text-sm" : "border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-charcoal font-mogra text-xs sm:text-sm"}
          >
            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Popular
          </Button>
          {user && (
            <Button 
              variant={filter === "my-rankings" ? "default" : "outline"} 
              onClick={() => setFilter("my-rankings")} 
              size="sm" 
              className={filter === "my-rankings" ? "bg-rap-gold hover:bg-rap-gold-light text-rap-charcoal font-mogra text-xs sm:text-sm" : "border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-charcoal font-mogra text-xs sm:text-sm"}
            >
              Mine
            </Button>
          )}
          
          {/* Create Ranking Button */}
          {user && (
            <CreateRankingDialog>
              <Button className="bg-rap-gold hover:bg-rap-gold-light text-rap-charcoal font-mogra shadow-xl shadow-rap-gold/40 border border-rap-gold/30 text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Create Ranking
              </Button>
            </CreateRankingDialog>
          )}
        </div>
      </div>

      {/* User Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-0 my-[30px]">
        {transformedRankings.map(ranking => (
          <RankingCard 
            key={ranking.id} 
            {...ranking} 
            onClick={onRankingClick} 
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && onLoadMore && (
        <div className="text-center mt-8">
          <Button 
            onClick={onLoadMore} 
            disabled={isLoadingMore} 
            variant="outline" 
            className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon font-mogra"
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            {isLoadingMore ? "Loading..." : "Load More Rankings"}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredRankings.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-rap-smoke mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-rap-platinum mb-2 font-mogra">
            {filter === "my-rankings" ? "No rankings created yet" : "No rankings found"}
          </h3>
          <p className="text-rap-smoke mb-6 font-kaushan">
            {filter === "my-rankings" ? "Create your first ranking to share your opinions with the community." : "Be the first to create a ranking for this category."}
          </p>
          {user && (
            <CreateRankingDialog>
              <Button className="bg-rap-gold hover:bg-rap-gold-light text-rap-charcoal font-mogra">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Ranking
              </Button>
            </CreateRankingDialog>
          )}
        </div>
      )}

      {!user && (
        <Card className="bg-carbon-fiber border-rap-gold/20 mt-8">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-rap-forest mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-rap-platinum mb-2 font-mogra">Join the Community</h3>
            <p className="text-rap-smoke mb-6 font-kaushan">
              Sign up to create your own rapper rankings and engage with other hip-hop fans.
            </p>
            <Link to="/auth">
              <Button className="bg-rap-gold hover:bg-rap-gold-light text-rap-charcoal font-mogra">
                Sign Up Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserRankingsSection;
