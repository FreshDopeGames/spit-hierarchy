import React, { useState } from "react";
import { usePaginatedVotingHistory } from "@/hooks/usePaginatedVotingHistory";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { ThemedTabs, ThemedTabsContent, ThemedTabsList, ThemedTabsTrigger } from "@/components/ui/themed-tabs";
import { History, List, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import RapperAvatar from "@/components/RapperAvatar";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const PaginatedVotingHistory = () => {
  const [activeTab, setActiveTab] = useState<'ranking' | 'attribute'>('ranking');
  const [rankingPage, setRankingPage] = useState(1);
  const [attributePage, setAttributePage] = useState(1);

  const currentPage = activeTab === 'ranking' ? rankingPage : attributePage;
  const setCurrentPage = activeTab === 'ranking' ? setRankingPage : setAttributePage;

  const { data: historyData, isLoading } = usePaginatedVotingHistory(activeTab, currentPage);

  const renderPaginationNumbers = () => {
    if (!historyData || historyData.totalPages <= 1) return null;

    const pages = [];
    const totalPages = historyData.totalPages;
    
    // Always show first page
    pages.push(1);
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    // Always show last page
    if (!pages.includes(totalPages)) pages.push(totalPages);
    
    // Insert ellipsis where there are gaps
    const result = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) {
        result.push('ellipsis-' + i);
      }
      result.push(pages[i]);
    }
    
    return result;
  };

  if (isLoading) {
    return (
      <Card className="bg-[var(--theme-surface)]/90 border-4 border-[var(--theme-primary)]/30">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] flex items-center gap-2 text-lg sm:text-xl">
            <History className="w-4 h-4 sm:w-5 sm:h-5" />
            Voting History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-[hsl(var(--theme-surface))] rounded" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-[hsl(var(--theme-surface))] rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[var(--theme-surface)]/90 border-4 border-[var(--theme-primary)]/30">
      <CardHeader>
        <CardTitle className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] flex items-center justify-center gap-2 text-lg sm:text-xl">
          <History className="w-4 h-4 sm:w-5 sm:h-5" />
          Voting History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ThemedTabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value as 'ranking' | 'attribute');
            if (value === 'ranking') setRankingPage(1);
            else setAttributePage(1);
          }} 
          className="w-full"
        >
          <ThemedTabsList className="grid w-full grid-cols-2 mb-4">
            <ThemedTabsTrigger value="ranking" className="text-xs sm:text-sm">
              <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Ranking Votes
            </ThemedTabsTrigger>
            <ThemedTabsTrigger value="attribute" className="text-xs sm:text-sm">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Attribute Ratings
            </ThemedTabsTrigger>
          </ThemedTabsList>

          <ThemedTabsContent value="ranking">
            {historyData && historyData.data.length > 0 ? (
              <>
                <div className="space-y-2 mb-6">
                  {historyData.data.map((vote: any) => (
                    <Link
                      key={vote.id}
                      to={`/rapper/${vote.rappers.slug}`}
                      className="block p-3 sm:p-4 rounded-lg border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/40 hover:bg-[hsl(var(--theme-surface))]/50 transition-all"
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
                          <h4 className="text-[hsl(var(--theme-text))] font-medium text-sm sm:text-base truncate">
                            {vote.rappers.name}
                          </h4>
                          {vote.official_rankings && (
                            <p className="text-[hsl(var(--theme-accent))] text-xs sm:text-sm mt-1">
                              Voted on: {vote.official_rankings.title}
                            </p>
                          )}
                          <p className="text-[hsl(var(--theme-text))]/50 text-xs mt-1">
                            {formatDistanceToNow(new Date(vote.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {historyData.totalPages > 1 && (
                  <div className="w-full overflow-x-auto px-2">
                    <Pagination className="justify-center">
                      <PaginationContent className="flex-wrap justify-center gap-1 max-w-full">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={cn(
                              "text-xs sm:text-sm px-2 sm:px-3",
                              currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                            )}
                          />
                        </PaginationItem>

                        {renderPaginationNumbers()?.map((item, index) => {
                          if (typeof item === 'string' && item.startsWith('ellipsis')) {
                            return (
                              <PaginationItem key={item} className="hidden sm:block">
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          const pageNum = item as number;
                          return (
                            <PaginationItem key={pageNum} className="hidden sm:block">
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer text-xs sm:text-sm"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem className="sm:hidden">
                          <span className="text-xs text-[hsl(var(--theme-text))] px-3 py-2">
                            Page {currentPage} of {historyData.totalPages}
                          </span>
                        </PaginationItem>

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(Math.min(historyData.totalPages, currentPage + 1))}
                            className={cn(
                              "text-xs sm:text-sm px-2 sm:px-3",
                              currentPage === historyData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                            )}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}

                <div className="text-center mt-4 text-xs text-[hsl(var(--theme-text))]/60">
                  Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, historyData.totalCount)} of {historyData.totalCount} votes
                </div>
              </>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <List className="w-10 h-10 sm:w-12 sm:h-12 text-[hsl(var(--theme-primary))]/50 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-[hsl(var(--theme-secondary))] mb-2">
                  No ranking votes yet
                </h3>
                <p className="text-[hsl(var(--theme-text))] text-xs sm:text-sm px-4">
                  Start voting on rankings to see your history here!
                </p>
              </div>
            )}
          </ThemedTabsContent>

          <ThemedTabsContent value="attribute">
            {historyData && historyData.data.length > 0 ? (
              <>
                <div className="space-y-2 mb-6">
                  {historyData.data.map((vote: any) => (
                    <Link
                      key={vote.rapper_id}
                      to={`/rapper/${vote.rappers.slug}`}
                      className="block p-3 sm:p-4 rounded-lg border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/40 hover:bg-[hsl(var(--theme-surface))]/50 transition-all"
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
                          <h4 className="text-[hsl(var(--theme-text))] font-medium text-sm sm:text-base truncate">
                            {vote.rappers.name}
                          </h4>
                          <p className="text-[hsl(var(--theme-accent))] text-xs sm:text-sm mt-1 flex items-center gap-1">
                            Your Rating:
                            <span className="text-[hsl(var(--theme-primary))] font-semibold">
                              {(vote.user_avg_rating ?? 0).toFixed(1)}/10
                            </span>
                            <span className="text-[hsl(var(--theme-text))]/50 text-xs">
                              ({vote.vote_count} {vote.vote_count === 1 ? 'vote' : 'votes'})
                            </span>
                          </p>
                          <p className="text-[hsl(var(--theme-text))]/50 text-xs mt-1">
                            {formatDistanceToNow(new Date(vote.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {historyData.totalPages > 1 && (
                  <div className="w-full overflow-x-auto px-2">
                    <Pagination className="justify-center">
                      <PaginationContent className="flex-wrap justify-center gap-1 max-w-full">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={cn(
                              "text-xs sm:text-sm px-2 sm:px-3",
                              currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                            )}
                          />
                        </PaginationItem>

                        {renderPaginationNumbers()?.map((item, index) => {
                          if (typeof item === 'string' && item.startsWith('ellipsis')) {
                            return (
                              <PaginationItem key={item} className="hidden sm:block">
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          const pageNum = item as number;
                          return (
                            <PaginationItem key={pageNum} className="hidden sm:block">
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer text-xs sm:text-sm"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem className="sm:hidden">
                          <span className="text-xs text-[hsl(var(--theme-text))] px-3 py-2">
                            Page {currentPage} of {historyData.totalPages}
                          </span>
                        </PaginationItem>

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(Math.min(historyData.totalPages, currentPage + 1))}
                            className={cn(
                              "text-xs sm:text-sm px-2 sm:px-3",
                              currentPage === historyData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                            )}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}

                <div className="text-center mt-4 text-xs text-[hsl(var(--theme-text))]/60">
                  Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, historyData.totalCount)} of {historyData.totalCount} rappers rated
                </div>
              </>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Star className="w-10 h-10 sm:w-12 sm:h-12 text-[hsl(var(--theme-primary))]/50 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-[hsl(var(--theme-secondary))] mb-2">
                  No attribute ratings yet
                </h3>
                <p className="text-[hsl(var(--theme-text))] text-xs sm:text-sm px-4">
                  Rate your favorite rappers to see your history here!
                </p>
              </div>
            )}
          </ThemedTabsContent>
        </ThemedTabs>
      </CardContent>
    </Card>
  );
};

export default PaginatedVotingHistory;
