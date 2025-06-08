
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import VoteButton from "@/components/VoteButton";
import BillboardAd from "@/components/BillboardAd";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface AllRappersSectionProps {
  rappers: Rapper[];
  officialItemsCount: number;
  onVote: (rapperName: string) => void;
  onVoteWithNote: (rapperName: string, note: string) => void;
  userLoggedIn: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

const AllRappersSection = ({ 
  rappers, 
  officialItemsCount, 
  onVote, 
  onVoteWithNote, 
  userLoggedIn, 
  hasMore, 
  loadingMore, 
  onLoadMore 
}: AllRappersSectionProps) => {
  const shouldShowAd = (index: number) => (index + 1) % 50 === 0;

  return (
    <Card className="bg-carbon-fiber border-rap-silver/40 shadow-2xl shadow-rap-silver/20">
      <CardHeader>
        <CardTitle className="text-rap-silver flex items-center gap-2 font-mogra">
          <Star className="w-5 h-5" />
          6, 7, ... etc.
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rappers.map((rapper, index) => {
          const globalIndex = officialItemsCount + index + 1;
          
          return (
            <div key={rapper.id}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 sm:p-4 bg-rap-carbon/30 rounded-lg hover:bg-rap-carbon/50 transition-colors relative">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rap-silver to-rap-platinum rounded-full flex items-center justify-center">
                  <span className="text-rap-carbon font-bold text-lg font-mogra">#{globalIndex}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-rap-platinum font-semibold text-lg font-mogra truncate">{rapper.name}</h3>
                  </div>
                  <p className="text-rap-smoke font-merienda text-sm sm:text-base">{rapper.real_name} • {rapper.origin}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-rap-gold" />
                    <span className="text-rap-platinum font-merienda text-sm">
                      {rapper.average_rating ? parseFloat(rapper.average_rating.toString()).toFixed(1) : "0.0"}
                    </span>
                    <span className="text-rap-smoke font-merienda text-sm">
                      ({rapper.total_votes || 0} votes)
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <VoteButton
                    onVote={() => onVote(rapper.name)}
                    onVoteWithNote={(note) => onVoteWithNote(rapper.name, note)}
                    disabled={!userLoggedIn}
                    className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold text-sm sm:text-lg px-3 py-2 sm:px-6 sm:py-3"
                  />
                  <Link to={`/rapper/${rapper.id}`} className="w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rap-silver hover:text-rap-platinum font-kaushan w-full sm:w-auto text-sm"
                    >
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
              
              {shouldShowAd(index + 1) && (
                <div className="my-6">
                  <BillboardAd />
                </div>
              )}
            </div>
          );
        })}
        
        {hasMore && (
          <div className="text-center pt-6">
            <Button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra shadow-xl shadow-rap-gold/40 border border-rap-gold/30 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
            >
              {loadingMore ? "Loading..." : "Load More Rappers"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllRappersSection;
