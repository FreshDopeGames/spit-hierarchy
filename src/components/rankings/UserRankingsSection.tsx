
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Star, Trophy, Plus } from "lucide-react";
import RankingCard from "./RankingCard";
import { useAuth } from "@/hooks/useAuth";

interface Rapper {
  rank: number;
  name: string;
  reason: string;
}

interface UserRanking {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  timeAgo: string;
  rappers: Rapper[];
  likes: number;
  views: number;
  isOfficial: boolean;
  tags: string[];
}

interface UserRankingsSectionProps {
  rankings: UserRanking[];
  onRankingClick: (id: string) => void;
}

const UserRankingsSection = ({ rankings, onRankingClick }: UserRankingsSectionProps) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "my-rankings" | "popular">("all");

  const filteredRankings = rankings.filter(ranking => {
    if (filter === "my-rankings") return user && ranking.authorId === user.id;
    if (filter === "popular") return ranking.likes > 200;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-rap-forest" />
          <h2 className="text-3xl font-bold text-rap-platinum font-mogra">Member Made Rankings</h2>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-4">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
            className={filter === "all" 
              ? "bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-kaushan" 
              : "border-rap-forest/30 text-rap-forest hover:bg-rap-forest/20 font-kaushan"
            }
          >
            All
          </Button>
          <Button
            variant={filter === "popular" ? "default" : "outline"}
            onClick={() => setFilter("popular")}
            size="sm"
            className={filter === "popular" 
              ? "bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-kaushan" 
              : "border-rap-forest/30 text-rap-forest hover:bg-rap-forest/20 font-kaushan"
            }
          >
            <Star className="w-4 h-4 mr-2" />
            Popular
          </Button>
          {user && (
            <Button
              variant={filter === "my-rankings" ? "default" : "outline"}
              onClick={() => setFilter("my-rankings")}
              size="sm"
              className={filter === "my-rankings" 
                ? "bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-kaushan" 
                : "border-rap-forest/30 text-rap-forest hover:bg-rap-forest/20 font-kaushan"
              }
            >
              Mine
            </Button>
          )}
        </div>
      </div>

      {/* User Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRankings.map((ranking) => (
          <RankingCard
            key={ranking.id}
            {...ranking}
            onClick={onRankingClick}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRankings.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-rap-smoke mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-rap-platinum mb-2 font-mogra">
            {filter === "my-rankings" ? "No rankings created yet" : "No rankings found"}
          </h3>
          <p className="text-rap-smoke mb-6 font-kaushan">
            {filter === "my-rankings" 
              ? "Create your first ranking to share your opinions with the community."
              : "Be the first to create a ranking for this category."
            }
          </p>
          {user && (
            <Button className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Ranking
            </Button>
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
              <Button className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra">
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
