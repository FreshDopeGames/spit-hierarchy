
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import VoteButton from "@/components/VoteButton";
import HotBadge from "@/components/analytics/HotBadge";
import { RankingItemWithDelta } from "@/hooks/useRankingData";

interface OfficialRankingItemsProps {
  items: RankingItemWithDelta[];
  onVote: (rapperName: string) => void;
  userLoggedIn: boolean;
  hotThreshold: number;
  displayCount: number;
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
}

const OfficialRankingItems = ({ 
  items, 
  onVote, 
  userLoggedIn,
  hotThreshold,
  displayCount,
  onLoadMore,
  hasMore,
  loading = false
}: OfficialRankingItemsProps) => {
  if (items.length === 0) return null;

  const displayItems = items.slice(0, displayCount);

  const getDeltaIcon = (delta: number) => {
    if (delta < 0) {
      return <ChevronUp className="w-4 h-4 text-green-500" />;
    } else if (delta > 0) {
      return <ChevronDown className="w-4 h-4 text-red-500" />;
    } else {
      return <Minus className="w-4 h-4 text-rap-gold" />;
    }
  };

  return (
    <Card className="bg-carbon-fiber border-rap-gold/40 mb-8 shadow-2xl shadow-rap-gold/20">
      <CardHeader>
        <CardTitle className="text-rap-gold flex items-center gap-2 font-mogra">
          <Trophy className="w-5 h-5" />
          Official Rankings ({items.length} total)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayItems.map((item) => {
          const isHot = (item.vote_velocity_24_hours || 0) >= hotThreshold && hotThreshold > 0;
          
          return (
            <div 
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 sm:p-4 bg-rap-carbon/30 rounded-lg hover:bg-rap-carbon/50 transition-colors relative border border-rap-gold/20"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rap-gold to-rap-burgundy rounded-full flex items-center justify-center relative">
                <span className="text-rap-carbon font-bold text-lg font-mogra">#{item.position}</span>
                <div className="absolute -top-1 -right-1">
                  {getDeltaIcon(item.position_delta)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-rap-platinum font-semibold text-lg font-mogra truncate">{item.rapper?.name}</h3>
                  {isHot && (
                    <HotBadge isHot={isHot} voteVelocity={item.vote_velocity_24_hours || 0} variant="compact" />
                  )}
                </div>
                <p className="text-rap-smoke font-merienda text-sm sm:text-base">
                  {item.reason || `${item.rapper?.origin || 'Unknown Origin'}`}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <VoteButton
                  onVote={() => onVote(item.rapper?.name || "")}
                  disabled={!userLoggedIn}
                  className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold text-sm sm:text-lg px-3 py-2 sm:px-6 sm:py-3"
                />
                <Link to={`/rapper/${item.rapper?.id}`} className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rap-gold hover:text-rap-gold-light font-kaushan w-full sm:w-auto text-sm"
                  >
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
        
        {hasMore && (
          <div className="text-center pt-4 border-t border-rap-gold/20">
            <p className="text-rap-smoke font-kaushan text-sm mb-4">
              Showing {displayCount} of {items.length} rappers.
            </p>
            <Button
              onClick={onLoadMore}
              disabled={loading}
              variant="outline"
              className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold/20 font-kaushan"
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfficialRankingItems;
