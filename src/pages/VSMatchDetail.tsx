import { useParams } from "react-router-dom";
import { useVSMatchBySlug, useVSMatchVote } from "@/hooks/useVSMatches";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Swords, MapPin, Calendar, Star, Check, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/seo/SEOHead";
import RapperAvatar from "@/components/RapperAvatar";
import CommentBubble from "@/components/CommentBubble";
import NotFound from "@/pages/NotFound";
import { useIsMobile } from "@/hooks/use-mobile";

const VSMatchDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useSecureAuth();
  const isMobile = useIsMobile();
  const { data: vsMatch, isLoading, error } = useVSMatchBySlug(slug!);
  const voteMatch = useVSMatchVote();

  if (error || (!isLoading && !vsMatch)) {
    return <NotFound />;
  }

  const handleVote = async (rapperChoiceId: string) => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    if (vsMatch?.user_vote) {
      toast.error("You've already voted on this matchup today!");
      return;
    }

    try {
      await voteMatch.mutateAsync({
        matchId: vsMatch!.id,
        rapperChoiceId,
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const getRapperStats = (rapper: any) => (
    <div className="text-sm text-rap-smoke space-y-1">
      {rapper.real_name && (
        <div className="flex items-center gap-1">
          <span className="font-medium">Real name:</span> {rapper.real_name}
        </div>
      )}
      {rapper.origin && (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {rapper.origin}
        </div>
      )}
      {rapper.birth_year && (
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {rapper.birth_year}
        </div>
      )}
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 text-rap-gold" />
        {rapper.average_rating || "No rating"} ({rapper.total_votes || 0} votes)
      </div>
    </div>
  );

  const getVoteButton = (rapperId: string, rapperName: string, voteCount: number) => {
    const hasVoted = vsMatch?.user_vote === rapperId;
    const hasUserVoted = !!vsMatch?.user_vote;

    return (
      <Button
        onClick={() => handleVote(rapperId)}
        disabled={!user || hasUserVoted || voteMatch.isPending}
        className={`w-full ${hasVoted 
          ? 'bg-green-600 hover:bg-green-500 text-white' 
          : 'bg-rap-gold hover:bg-rap-gold-light text-rap-carbon'
        } font-bold transition-all duration-200`}
        size={isMobile ? "sm" : "default"}
      >
        {hasVoted ? (
          <>
            <Check className="w-4 h-4 mr-1" />
            {isMobile ? "Voted" : "Your Choice"}
          </>
        ) : (
          <>
            <ThumbsUp className="w-4 h-4 mr-1" />
            {isMobile ? "Vote" : `Vote for ${rapperName}`}
          </>
        )}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rap-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-3/4 bg-rap-smoke/20 mb-4" />
            <Skeleton className="h-4 w-full bg-rap-smoke/20 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <Skeleton className="h-96 bg-rap-smoke/20 rounded-lg" />
              <Skeleton className="h-96 bg-rap-smoke/20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${vsMatch!.title} - VS Match`}
        description={vsMatch!.description || `Vote in the ultimate matchup between ${vsMatch!.rapper_1.name} and ${vsMatch!.rapper_2.name}. See who the community thinks is better!`}
        canonicalUrl={`/vs/${vsMatch!.slug}`}
      />
      
      <div className="min-h-screen bg-rap-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-rap-platinum mb-4 font-mogra">
                {vsMatch!.title}
              </h1>
              {vsMatch!.description && (
                <p className="text-lg text-rap-smoke max-w-2xl mx-auto">
                  {vsMatch!.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Badge variant="outline" className="text-rap-gold border-rap-gold">
                  {vsMatch!.total_votes} total votes
                </Badge>
                <Badge variant="outline">
                  {new Date(vsMatch!.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </div>

            {/* VS Matchup */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Rapper 1 */}
              <Card className="bg-rap-charcoal border-rap-burgundy/30">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <RapperAvatar 
                      rapper={vsMatch!.rapper_1} 
                      size="xl"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-rap-platinum mb-2 font-mogra">
                        {vsMatch!.rapper_1.name}
                      </h2>
                      {vsMatch!.rapper_1.verified && (
                        <Badge className="mb-3 bg-rap-gold text-rap-carbon">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    {/* Vote Button */}
                    {getVoteButton(vsMatch!.rapper_1.id, vsMatch!.rapper_1.name, vsMatch!.rapper_1_votes)}
                    
                    {/* Vote Count */}
                    <div className="text-center py-2">
                      <div className="text-2xl font-bold text-rap-gold">
                        {vsMatch!.rapper_1_votes}
                      </div>
                      <div className="text-sm text-rap-smoke">
                        votes ({vsMatch!.total_votes > 0 ? Math.round((vsMatch!.rapper_1_votes / vsMatch!.total_votes) * 100) : 0}%)
                      </div>
                    </div>

                    {/* Rapper Stats */}
                    <div className="w-full pt-4 border-t border-rap-smoke/20">
                      {getRapperStats(vsMatch!.rapper_1)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rapper 2 */}
              <Card className="bg-rap-charcoal border-rap-burgundy/30">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <RapperAvatar 
                      rapper={vsMatch!.rapper_2} 
                      size="xl"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-rap-platinum mb-2 font-mogra">
                        {vsMatch!.rapper_2.name}
                      </h2>
                      {vsMatch!.rapper_2.verified && (
                        <Badge className="mb-3 bg-rap-gold text-rap-carbon">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    {/* Vote Button */}
                    {getVoteButton(vsMatch!.rapper_2.id, vsMatch!.rapper_2.name, vsMatch!.rapper_2_votes)}
                    
                    {/* Vote Count */}
                    <div className="text-center py-2">
                      <div className="text-2xl font-bold text-rap-gold">
                        {vsMatch!.rapper_2_votes}
                      </div>
                      <div className="text-sm text-rap-smoke">
                        votes ({vsMatch!.total_votes > 0 ? Math.round((vsMatch!.rapper_2_votes / vsMatch!.total_votes) * 100) : 0}%)
                      </div>
                    </div>

                    {/* Rapper Stats */}
                    <div className="w-full pt-4 border-t border-rap-smoke/20">
                      {getRapperStats(vsMatch!.rapper_2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* VS Indicator (Mobile) */}
            <div className="flex justify-center mb-12 lg:hidden">
              <div className="bg-rap-charcoal rounded-full p-4 border-2 border-rap-gold/50">
                <Swords className="w-8 h-8 text-rap-gold" />
              </div>
            </div>

            {/* Vote Distribution Bar */}
            {vsMatch!.total_votes > 0 && (
              <div className="mb-12">
                <div className="bg-rap-charcoal rounded-lg p-6">
                  <h3 className="text-lg font-bold text-rap-platinum mb-4 text-center">
                    Vote Distribution
                  </h3>
                  <div className="relative w-full bg-rap-dark rounded-full h-6">
                    <div 
                      className="bg-gradient-to-r from-rap-gold to-rap-gold-light h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ 
                        width: `${(vsMatch!.rapper_1_votes / vsMatch!.total_votes) * 100}%` 
                      }}
                    >
                      {vsMatch!.rapper_1_votes > 0 && (
                        <span className="text-xs font-bold text-rap-carbon">
                          {Math.round((vsMatch!.rapper_1_votes / vsMatch!.total_votes) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-rap-smoke mt-2">
                    <span>{vsMatch!.rapper_1.name}: {vsMatch!.rapper_1_votes}</span>
                    <span>{vsMatch!.rapper_2.name}: {vsMatch!.rapper_2_votes}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="mt-12">
              <CommentBubble 
                contentType="vs_match"
                contentId={vsMatch!.id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VSMatchDetail;