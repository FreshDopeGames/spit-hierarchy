
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import VoteButton from "@/components/VoteButton";
import HotBadge from "@/components/analytics/HotBadge";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;
type RankingItem = Tables<"ranking_items"> & {
  rapper: Rapper;
};

interface OfficialRankingItemsProps {
  items: RankingItem[];
  onVote: (rapperName: string) => void;
  onVoteWithNote: (rapperName: string, note: string) => void;
  userLoggedIn: boolean;
  showAll?: boolean;
  maxItems?: number;
}

const OfficialRankingItems = ({ 
  items, 
  onVote, 
  onVoteWithNote, 
  userLoggedIn, 
  showAll = false,
  maxItems = 10
}: OfficialRankingItemsProps) => {
  if (items.length === 0) return null;

  // Show only ranked items by default, or all items if showAll is true
  const displayItems = showAll ? items : items.filter(item => item.is_ranked).slice(0, maxItems);
  const hasMoreItems = !showAll && items.length > displayItems.length;

  return (
    <Card className="bg-carbon-fiber border-rap-gold/40 mb-8 shadow-2xl shadow-rap-gold/20">
      <CardHeader>
        <CardTitle className="text-rap-gold flex items-center gap-2 font-mogra">
          <Trophy className="w-5 h-5" />
          Official Rankings {showAll && `(${items.length} total)`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayItems.map((item) => {
          const isHot = item.position <= 2;
          const voteVelocity = isHot ? Math.floor(Math.random() * 15) + 5 : 0;
          
          return (
            <div 
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 sm:p-4 bg-rap-carbon/30 rounded-lg hover:bg-rap-carbon/50 transition-colors relative border border-rap-gold/20"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rap-gold to-rap-burgundy rounded-full flex items-center justify-center">
                <span className="text-rap-carbon font-bold text-lg font-mogra">#{item.position}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-rap-platinum font-semibold text-lg font-mogra truncate">{item.rapper?.name}</h3>
                  {isHot && (
                    <HotBadge isHot={isHot} voteVelocity={voteVelocity} variant="compact" />
                  )}
                  {!item.is_ranked && (
                    <span className="text-xs text-rap-smoke bg-rap-carbon/50 px-2 py-1 rounded font-kaushan">Auto-added</span>
                  )}
                </div>
                <p className="text-rap-smoke font-merienda text-sm sm:text-base">
                  {item.reason || `${item.rapper?.real_name} • ${item.rapper?.origin}`}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <VoteButton
                  onVote={() => onVote(item.rapper?.name || "")}
                  onVoteWithNote={(note) => onVoteWithNote(item.rapper?.name || "", note)}
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
        
        {hasMoreItems && (
          <div className="text-center pt-4 border-t border-rap-gold/20">
            <p className="text-rap-smoke font-kaushan text-sm mb-2">
              Showing top {displayItems.length} ranked artists. {items.length - displayItems.length} more available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfficialRankingItems;
