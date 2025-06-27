
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Star, Users, Calendar, Eye, Award, Music } from "lucide-react";
import CommentBubble from "@/components/CommentBubble";
import VoteButton from "@/components/VoteButton";
import HotBadge from "@/components/analytics/HotBadge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Rapper {
  rank: number;
  name: string;
  reason: string;
}

interface RankingData {
  id: string;
  title: string;
  description: string;
  author: string;
  timeAgo: string;
  rappers: Rapper[];
  likes: number;
  views: number;
  isOfficial: boolean;
  tags: string[];
}

interface RankingDetailViewProps {
  ranking: RankingData;
  onBack: () => void;
}

const RankingDetailView = ({ ranking, onBack }: RankingDetailViewProps) => {
  const { user } = useAuth();

  const handleVote = (rapperName: string) => {
    if (!user) {
      toast.error("Please sign in to vote for rappers.");
      return;
    }

    toast.success(`Your vote for ${rapperName} has been recorded.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      {/* Header */}
      <header className="bg-carbon-fiber/90 border-b border-rap-gold/30 p-4 shadow-lg shadow-rap-gold/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-rap-gold hover:text-rap-gold-light font-kaushan"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rankings
          </Button>
          
          <div className="flex items-center gap-2">
            {ranking.isOfficial && (
              <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 font-kaushan">
                <Award className="w-3 h-3 mr-1" />
                Official
              </Badge>
            )}
            <Badge variant="secondary" className="bg-rap-forest/20 text-rap-forest border-rap-forest/30 font-kaushan">
              <Eye className="w-3 h-3 mr-1" />
              {ranking.views}
            </Badge>
            <Badge variant="secondary" className="bg-rap-burgundy/20 text-rap-burgundy border-rap-burgundy/30 font-kaushan">
              <Star className="w-3 h-3 mr-1" />
              {ranking.likes}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Ranking Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {ranking.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-rap-burgundy/20 text-rap-burgundy border-rap-burgundy/30 font-kaushan">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-rap-platinum mb-4 leading-tight font-mogra">
            {ranking.title}
          </h1>
          
          <p className="text-xl text-rap-smoke mb-6 leading-relaxed font-kaushan">
            {ranking.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-rap-smoke mb-6 font-kaushan">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>by {ranking.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{ranking.timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Ranking List */}
        <Card className="bg-carbon-fiber border-rap-gold/30">
          <CardHeader>
            <CardTitle className="text-rap-platinum flex items-center gap-2 font-mogra">
              <Trophy className="w-5 h-5 text-rap-gold" />
              The Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.rappers.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-rap-gold/50 mx-auto mb-4" />
                <h3 className="text-xl font-mogra text-rap-platinum mb-2">No Rappers Ranked Yet</h3>
                <p className="text-rap-smoke font-kaushan mb-4">
                  This ranking is being prepared and will be populated with rappers soon.
                </p>
                <p className="text-rap-smoke/70 font-kaushan text-sm">
                  Check back later or explore other rankings in the meantime.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ranking.rappers.map((rapper) => {
                  const isHot = rapper.rank <= 2;
                  const voteVelocity = isHot ? Math.floor(Math.random() * 15) + 5 : 0;
                  
                  return (
                    <div 
                      key={rapper.rank}
                      className="flex items-center gap-4 p-4 bg-rap-carbon-light/30 rounded-lg hover:bg-rap-carbon-light/50 transition-colors relative"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rap-burgundy to-rap-forest rounded-full flex items-center justify-center">
                        <span className="text-rap-platinum font-bold text-lg font-ceviche">#{rapper.rank}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-rap-platinum font-semibold text-lg font-mogra">{rapper.name}</h3>
                          {isHot && (
                            <HotBadge isHot={isHot} voteVelocity={voteVelocity} variant="compact" />
                          )}
                        </div>
                        <p className="text-rap-smoke font-kaushan">{rapper.reason}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <VoteButton
                          onVote={() => handleVote(rapper.name)}
                          disabled={!user}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rap-gold hover:text-rap-gold-light font-kaushan"
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Comment Bubble */}
      <CommentBubble contentType="ranking" contentId={ranking.id} />
    </div>
  );
};

export default RankingDetailView;
