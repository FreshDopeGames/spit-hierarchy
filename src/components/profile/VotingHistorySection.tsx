import React from "react";
import { useVotingHistory } from "@/hooks/useVotingHistory";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, List, Star, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import RapperAvatar from "@/components/RapperAvatar";

const VotingHistorySection = () => {
  const { rankingVotes, attributeVotes, isLoading } = useVotingHistory();

  if (isLoading) {
    return (
      <Card className="bg-[var(--theme-background)] border border-[var(--theme-primary)]/30 rounded-lg shadow-lg shadow-[var(--theme-primary)]/20">
        <CardHeader>
          <CardTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] flex items-center gap-2 text-lg sm:text-xl">
            <History className="w-4 h-4 sm:w-5 sm:h-5" />
            Voting History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-[var(--theme-surface)] rounded" />
            <div className="space-y-3">
              <div className="h-16 bg-[var(--theme-surface)] rounded" />
              <div className="h-16 bg-[var(--theme-surface)] rounded" />
              <div className="h-16 bg-[var(--theme-surface)] rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[var(--theme-background)] border border-[var(--theme-primary)]/30 rounded-lg shadow-lg shadow-[var(--theme-primary)]/20 bg-black">
      <CardHeader>
        <CardTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] flex items-center gap-2 text-lg sm:text-xl">
          <History className="w-4 h-4 sm:w-5 sm:h-5" />
          Voting History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rankings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black border border-rap-gold/30 mb-4 p-1 rounded-lg">
            <TabsTrigger
              value="rankings"
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-black data-[state=active]:shadow-md text-rap-gold/60 hover:text-rap-gold hover:bg-rap-gold/20 transition-all text-xs sm:text-sm font-medium rounded-md"
            >
              <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Ranking Votes
            </TabsTrigger>
            <TabsTrigger
              value="ratings"
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-black data-[state=active]:shadow-md text-rap-gold/60 hover:text-rap-gold hover:bg-rap-gold/20 transition-all text-xs sm:text-sm font-medium rounded-md"
            >
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Attribute Ratings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rankings">
            {rankingVotes.length > 0 ? (
              <div className="space-y-2">
                {rankingVotes.map((vote) => (
                  <Link
                    key={vote.id}
                    to={`/rapper/${vote.rappers.slug}`}
                    className="block p-3 sm:p-4 rounded-lg border border-[var(--theme-primary)]/20 hover:border-[var(--theme-primary)]/40 hover:bg-[var(--theme-surface)]/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <RapperAvatar
                        rapper={{
                          id: vote.rappers.id,
                          name: vote.rappers.name,
                          slug: vote.rappers.slug,
                        }}
                        imageUrl={vote.rappers.image_url}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[var(--theme-text)] font-medium text-sm sm:text-base truncate">
                          {vote.rappers.name}
                        </h4>
                        <p className="text-[var(--theme-secondary)] text-xs sm:text-sm mt-1">
                          Voted on: {vote.official_rankings.title}
                        </p>
                        <p className="text-[var(--theme-text)]/50 text-xs mt-1">
                          {formatDistanceToNow(new Date(vote.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <List className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--theme-primary)]/50 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-[var(--theme-secondary)] mb-2">
                  No ranking votes yet
                </h3>
                <p className="text-[var(--theme-text)] text-xs sm:text-sm px-4">
                  Start voting on rankings to see your history here!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ratings">
            {attributeVotes.length > 0 ? (
              <div className="space-y-2">
                {attributeVotes.map((vote) => (
                  <Link
                    key={vote.rapper_id}
                    to={`/rapper/${vote.rappers.slug}`}
                    className="block p-3 sm:p-4 rounded-lg border border-[var(--theme-primary)]/20 hover:border-[var(--theme-primary)]/40 hover:bg-[var(--theme-surface)]/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <RapperAvatar
                        rapper={{
                          id: vote.rappers.id,
                          name: vote.rappers.name,
                          slug: vote.rappers.slug,
                        }}
                        imageUrl={vote.rappers.image_url}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[var(--theme-text)] font-medium text-sm sm:text-base truncate">
                          {vote.rappers.name}
                        </h4>
                        <p className="text-[var(--theme-secondary)] text-xs sm:text-sm mt-1 flex items-center gap-1">
                          Overall Rating: 
                          <span className="text-[var(--theme-primary)] font-semibold">
                            {vote.rappers.average_rating.toFixed(1)}/10
                          </span>
                        </p>
                        <p className="text-[var(--theme-text)]/50 text-xs mt-1">
                          {formatDistanceToNow(new Date(vote.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Star className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--theme-primary)]/50 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-[var(--theme-secondary)] mb-2">
                  No attribute ratings yet
                </h3>
                <p className="text-[var(--theme-text)] text-xs sm:text-sm px-4">
                  Rate your favorite rappers to see your history here!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VotingHistorySection;
