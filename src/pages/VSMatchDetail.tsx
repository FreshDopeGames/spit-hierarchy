import { useParams } from "react-router-dom";
import { useVSMatchBySlug, useVSMatchVote } from "@/hooks/useVSMatches";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Swords, MapPin, Calendar, Star, Check, ThumbsUp, Music, Trophy, Target } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/seo/SEOHead";
import RapperAvatar from "@/components/RapperAvatar";
import VSMatchCommentsSection from "@/components/VSMatchCommentsSection";
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
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="text-center p-3 bg-[var(--theme-background)]/30 rounded-lg border border-[var(--theme-primary)]/20">
        <Star className="w-4 h-4 text-[var(--theme-primary)] mx-auto mb-1" />
        <div className="text-[var(--theme-primary)] font-bold text-lg">
          {rapper.average_rating?.toFixed(1) || "N/A"}
        </div>
        <div className="text-[var(--theme-textMuted)] text-xs">
          Overall Rating
        </div>
      </div>
      <div className="text-center p-3 bg-[var(--theme-background)]/30 rounded-lg border border-[var(--theme-primary)]/20">
        <Target className="w-4 h-4 text-[var(--theme-primary)] mx-auto mb-1" />
        <div className="text-[var(--theme-primary)] font-bold text-lg">
          {rapper.total_votes || 0}
        </div>
        <div className="text-[var(--theme-textMuted)] text-xs">
          Ranking Votes
        </div>
      </div>
      <div className="text-center p-3 bg-[var(--theme-background)]/30 rounded-lg border border-[var(--theme-primary)]/20">
        <Trophy className="w-4 h-4 text-[var(--theme-primary)] mx-auto mb-1" />
        <div className="text-[var(--theme-primary)] font-bold text-lg">
          {rapper.top_five_count || 0}
        </div>
        <div className="text-[var(--theme-textMuted)] text-xs">
          Member Top 5s
        </div>
      </div>
      <div className="text-center p-3 bg-[var(--theme-background)]/30 rounded-lg border border-[var(--theme-primary)]/20">
        <Music className="w-4 h-4 text-[var(--theme-primary)] mx-auto mb-1" />
        <div className="text-[var(--theme-primary)] font-bold text-lg">
          {rapper.album_count || 0}
        </div>
        <div className="text-[var(--theme-textMuted)] text-xs">
          Total Albums
        </div>
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
          : 'bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryLight)] text-[var(--theme-background)]'
        } font-bold transition-all duration-200 font-mogra text-lg`}
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
      <div className="min-h-screen bg-gradient-to-br from-[#D4AF37] via-[#E8C547] to-[#D4AF37]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-3/4 bg-black/20 mb-4" />
            <Skeleton className="h-4 w-full bg-black/20 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <Skeleton className="h-96 bg-black/20 rounded-lg" />
              <Skeleton className="h-96 bg-black/20 rounded-lg" />
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
      
      <div className="min-h-screen bg-gradient-to-br from-[#D4AF37] via-[#E8C547] to-[#D4AF37]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--theme-background)] mb-4 font-mogra drop-shadow-lg">
                {vsMatch!.title}
              </h1>
              {vsMatch!.description && (
                <p className="text-lg text-[var(--theme-background)]/80 max-w-2xl mx-auto drop-shadow-md">
                  {vsMatch!.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Badge variant="outline" className="text-[var(--theme-background)] border-[var(--theme-background)] bg-black/20 backdrop-blur-sm">
                  {vsMatch!.total_votes} total votes
                </Badge>
                <Badge variant="outline" className="text-[var(--theme-background)] border-[var(--theme-background)] bg-black/20 backdrop-blur-sm">
                  {new Date(vsMatch!.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </div>

            {/* VS Matchup */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Rapper 1 */}
              <Card className="bg-[var(--theme-backgroundLight)] border-4 border-[var(--theme-primary)] shadow-2xl shadow-[var(--theme-primary)]/30">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <RapperAvatar 
                      rapper={vsMatch!.rapper_1} 
                      size="xl"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--theme-textLight)] mb-2 font-mogra">
                        {vsMatch!.rapper_1.name}
                      </h2>
                      {vsMatch!.rapper_1.verified && (
                        <Badge className="mb-3 bg-[var(--theme-primary)] text-[var(--theme-background)]">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    {/* Vote Button */}
                    {getVoteButton(vsMatch!.rapper_1.id, vsMatch!.rapper_1.name, vsMatch!.rapper_1_votes)}
                    
                    {/* Vote Count */}
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-[var(--theme-primary)]">
                        {vsMatch!.rapper_1_votes}
                      </div>
                      <div className="text-sm text-[var(--theme-textMuted)]">
                        votes ({vsMatch!.total_votes > 0 ? Math.round((vsMatch!.rapper_1_votes / vsMatch!.total_votes) * 100) : 0}%)
                      </div>
                    </div>

                    {/* Rapper Stats */}
                    <div className="w-full pt-4 border-t border-[var(--theme-primary)]/20">
                      {getRapperStats(vsMatch!.rapper_1)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rapper 2 */}
              <Card className="bg-[var(--theme-backgroundLight)] border-4 border-[var(--theme-primary)] shadow-2xl shadow-[var(--theme-primary)]/30">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <RapperAvatar 
                      rapper={vsMatch!.rapper_2} 
                      size="xl"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--theme-textLight)] mb-2 font-mogra">
                        {vsMatch!.rapper_2.name}
                      </h2>
                      {vsMatch!.rapper_2.verified && (
                        <Badge className="mb-3 bg-[var(--theme-primary)] text-[var(--theme-background)]">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    {/* Vote Button */}
                    {getVoteButton(vsMatch!.rapper_2.id, vsMatch!.rapper_2.name, vsMatch!.rapper_2_votes)}
                    
                    {/* Vote Count */}
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-[var(--theme-primary)]">
                        {vsMatch!.rapper_2_votes}
                      </div>
                      <div className="text-sm text-[var(--theme-textMuted)]">
                        votes ({vsMatch!.total_votes > 0 ? Math.round((vsMatch!.rapper_2_votes / vsMatch!.total_votes) * 100) : 0}%)
                      </div>
                    </div>

                    {/* Rapper Stats */}
                    <div className="w-full pt-4 border-t border-[var(--theme-primary)]/20">
                      {getRapperStats(vsMatch!.rapper_2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* VS Indicator (Mobile) */}
            <div className="flex justify-center mb-12 lg:hidden">
              <div className="bg-[var(--theme-backgroundLight)] rounded-full p-4 border-4 border-[var(--theme-primary)] shadow-lg">
                <Swords className="w-8 h-8 text-[var(--theme-primary)]" />
              </div>
            </div>

            {/* Vote Distribution Bar */}
            {vsMatch!.total_votes > 0 && (
              <div className="mb-12">
                <div className="bg-[var(--theme-backgroundLight)] rounded-lg p-6 border-2 border-[var(--theme-primary)]/30">
                  <h3 className="text-lg font-bold text-[var(--theme-textLight)] mb-4 text-center font-mogra">
                    Vote Distribution
                  </h3>
                  <div className="relative w-full bg-[var(--theme-background)]/50 rounded-full h-8">
                    <div 
                      className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primaryLight)] h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                      style={{ 
                        width: `${(vsMatch!.rapper_1_votes / vsMatch!.total_votes) * 100}%` 
                      }}
                    >
                      {vsMatch!.rapper_1_votes > 0 && (
                        <span className="text-sm font-bold text-[var(--theme-background)]">
                          {Math.round((vsMatch!.rapper_1_votes / vsMatch!.total_votes) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-[var(--theme-textMuted)] mt-3 font-medium">
                    <span>{vsMatch!.rapper_1.name}: {vsMatch!.rapper_1_votes}</span>
                    <span>{vsMatch!.rapper_2.name}: {vsMatch!.rapper_2_votes}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <VSMatchCommentsSection 
              vsMatchId={vsMatch!.id}
              title={vsMatch!.title}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default VSMatchDetail;