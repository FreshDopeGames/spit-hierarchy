import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useVSMatchBySlug, useVSMatchVote } from "@/hooks/useVSMatches";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemedButton } from "@/components/ui/themed-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Swords, MapPin, Calendar, Star, Check, ThumbsUp, Music, Trophy, Target } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/seo/SEOHead";
import RapperAvatar from "@/components/RapperAvatar";
import VSMatchCommentsSection from "@/components/VSMatchCommentsSection";
import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import NotFound from "@/pages/NotFound";
import { useIsMobile } from "@/hooks/use-mobile";

const VSMatchDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useSecureAuth();
  const isMobile = useIsMobile();
  const { data: vsMatch, isLoading, error } = useVSMatchBySlug(slug!);
  const voteMatch = useVSMatchVote();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <ThemedButton
        onClick={() => handleVote(rapperId)}
        disabled={!user || hasUserVoted || voteMatch.isPending}
        variant={hasVoted ? "default" : "gradient"}
        className={`w-full ${hasVoted 
          ? 'bg-green-600 hover:bg-green-500 text-white' 
          : ''
        } font-bold transition-all duration-200 font-mogra text-lg`}
        style={!hasVoted ? { 
          background: 'linear-gradient(to right, hsl(var(--theme-primary)) 0%, hsl(var(--theme-primaryLight)) 50%, hsl(var(--theme-primary)) 100%)',
          color: 'hsl(var(--theme-background))'
        } : {}}
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
      </ThemedButton>
    );
  };

  if (isLoading) {
    return (
      <>
        <HeaderNavigation isScrolled={isScrolled} />
        <div className="min-h-screen pt-20" style={{ 
          background: 'linear-gradient(135deg, #e59517 0%, #c1740c 100%)'
        }}>
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
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${vsMatch!.title} - VS Match`}
        description={vsMatch!.description || `Vote in the ultimate matchup between ${vsMatch!.rapper_1.name} and ${vsMatch!.rapper_2.name}. See who the community thinks is better!`}
        canonicalUrl={`/vs/${vsMatch!.slug}`}
      />
      
      <HeaderNavigation isScrolled={isScrolled} />
      
      <div className="min-h-screen pt-20" style={{ 
        background: 'linear-gradient(135deg, #e59517 0%, #c1740c 100%)'
      }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-black text-3xl md:text-4xl font-bold mb-4 font-mogra drop-shadow-lg">
                {vsMatch!.title}
              </h1>
              {vsMatch!.description && (
                <p className="text-black/80 text-lg max-w-2xl mx-auto drop-shadow-md">
                  {vsMatch!.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Badge variant="outline" className="text-black border-[var(--theme-primary)] bg-black/20 backdrop-blur-sm">
                  {vsMatch!.total_votes} total votes
                </Badge>
                <Badge variant="outline" className="text-black border-[var(--theme-primary)] bg-black/20 backdrop-blur-sm">
                  {new Date(vsMatch!.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </div>

            {/* VS Matchup */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 mb-12 items-center">
              {/* Rapper 1 */}
              <Card className="w-full lg:flex-1 lg:min-w-0 border-4 border-[var(--theme-primary)] shadow-2xl shadow-[var(--theme-primary)]/30" style={{
                background: 'var(--theme-gradient-dark-gradient)',
                // Fallback in case CSS variable isn't loaded
                backgroundImage: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)'
              }}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <RapperAvatar 
                      rapper={vsMatch!.rapper_1} 
                      size="2xl"
                      variant="square"
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

              {/* VS Sword Icon */}
              <div className="flex justify-center items-center lg:flex-shrink-0">
                <div className="bg-[var(--theme-backgroundLight)] rounded-full p-4 border-4 border-[var(--theme-primary)] shadow-lg">
                  <Swords className="w-8 h-8 text-[var(--theme-primary)] rotate-90 lg:rotate-0 transition-transform" />
                </div>
              </div>

              {/* Rapper 2 */}
              <Card className="w-full lg:flex-1 lg:min-w-0 border-4 border-[var(--theme-primary)] shadow-2xl shadow-[var(--theme-primary)]/30" style={{
                background: 'var(--theme-gradient-dark-gradient)',
                // Fallback in case CSS variable isn't loaded
                backgroundImage: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)'
              }}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <RapperAvatar 
                      rapper={vsMatch!.rapper_2} 
                      size="2xl"
                      variant="square"
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

            {/* Vote Distribution Bar */}
            {vsMatch!.total_votes > 0 && (
              <div className="mb-12">
                <div className="rounded-lg p-6 border-4 border-[var(--theme-primary)] shadow-2xl shadow-[var(--theme-primary)]/30" style={{
                  background: 'var(--theme-gradient-dark-gradient)',
                  backgroundImage: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)'
                }}>
                  <h3 className="text-white text-lg font-bold mb-4 text-center font-mogra">
                    Vote Distribution
                  </h3>
                  
                  {/* Distribution meter - 2x height with black border */}
                  <div className="relative w-full bg-[hsl(var(--theme-background))]/30 rounded-full h-4 border-2 border-black mb-3 overflow-hidden">
                    {/* Gold center divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-yellow-500 z-10 -translate-x-1/2" />
                    
                    {/* Green advantage bar extending from center */}
                  <div 
                    className="absolute top-0 h-4 bg-green-600 transition-all duration-500"
                    style={{
                      left: vsMatch!.rapper_1_votes >= vsMatch!.rapper_2_votes 
                        ? `${(vsMatch!.rapper_2_votes / vsMatch!.total_votes) * 50}%`
                        : '50%',
                      right: vsMatch!.rapper_1_votes >= vsMatch!.rapper_2_votes
                        ? '50%'
                        : `${(vsMatch!.rapper_2_votes / vsMatch!.total_votes) * 50}%`,
                      borderRadius: vsMatch!.rapper_1_votes >= vsMatch!.rapper_2_votes
                        ? '9999px 0 0 9999px'
                        : '0 9999px 9999px 0'
                    }}
                  />
                  </div>
                  
                  {/* Rapper names and vote counts */}
                  <div className="flex justify-between text-sm text-white mt-3 font-medium">
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
      
      <Footer />
    </>
  );
};

export default VSMatchDetail;
