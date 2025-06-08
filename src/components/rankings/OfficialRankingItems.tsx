
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import VoteButton from "@/components/VoteButton";
import HotBadge from "@/components/analytics/HotBadge";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;
type OfficialRankingItem = Tables<"official_ranking_items"> & {
  rapper: Rapper;
};

interface OfficialRankingItemsProps {
  items: OfficialRankingItem[];
  onVote: (rapperName: string) => void;
  onVoteWithNote: (rapperName: string, note: string) => void;
  userLoggedIn: boolean;
}

const OfficialRankingItems = ({ items, onVote, onVoteWithNote, userLoggedIn }: OfficialRankingItemsProps) => {
  if (items.length === 0) return null;

  return (
    <Card className="bg-carbon-fiber border-rap-gold/40 mb-8 shadow-2xl shadow-rap-gold/20">
      <CardHeader>
        <CardTitle className="text-rap-gold flex items-center gap-2 font-mogra">
          <Trophy className="w-5 h-5" />
          Official Rankings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const isHot = item.position <= 2;
          const voteVelocity = isHot ? Math.floor(Math.random() * 15) + 5 : 0;
          
          return (
            <div 
              key={item.id}
              className="flex items-center gap-4 p-4 bg-rap-carbon/30 rounded-lg hover:bg-rap-carbon/50 transition-colors relative border border-rap-gold/20"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rap-gold to-rap-burgundy rounded-full flex items-center justify-center">
                <span className="text-rap-carbon font-bold text-lg font-mogra">#{item.position}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-rap-platinum font-semibold text-lg font-mogra">{item.rapper?.name}</h3>
                  {isHot && (
                    <HotBadge isHot={isHot} voteVelocity={voteVelocity} variant="compact" />
                  )}
                </div>
                <p className="text-rap-smoke font-merienda">{item.reason}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <VoteButton
                  onVote={() => onVote(item.rapper?.name || "")}
                  onVoteWithNote={(note) => onVoteWithNote(item.rapper?.name || "", note)}
                  disabled={!userLoggedIn}
                  className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold text-lg px-6 py-3"
                />
                <Link to={`/rapper/${item.rapper?.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rap-gold hover:text-rap-gold-light font-kaushan"
                  >
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default OfficialRankingItems;
