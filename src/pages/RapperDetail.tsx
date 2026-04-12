import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRefreshDiscography } from "@/hooks/useRapperDiscography";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { ArrowLeft, Search, Loader2, UserPlus } from "lucide-react";
import VoteModal from "@/components/VoteModal";
import { useRapperAutocomplete } from "@/hooks/useRapperAutocomplete";
import { useCanSuggestRappers } from "@/hooks/useCanSuggestRappers";
import RapperSuggestionModal from "@/components/RapperSuggestionModal";
import BackToTopButton from "@/components/BackToTopButton";
import RapperHeader from "@/components/rapper/RapperHeader";
import RapperBio from "@/components/rapper/RapperBio";
import RapperStats from "@/components/rapper/RapperStats";
import RapperAttributeStats from "@/components/rapper/RapperAttributeStats";
import CareerStatsCard from "@/components/rapper/CareerStatsCard";
import { RapperAliases } from "@/components/rapper/RapperAliases";
import HeaderNavigation from "@/components/HeaderNavigation";
import SEOHead from "@/components/seo/SEOHead";

import Footer from "@/components/Footer";
import { Tables } from "@/integrations/supabase/types";

// Lazy load below-fold components
const RapperDiscography = lazy(() => import("@/components/rapper/RapperDiscography"));
const RapperBestQuote = lazy(() => import("@/components/rapper/RapperBestQuote"));
const SimilarRappersCard = lazy(() => import("@/components/rapper/SimilarRappersCard"));
const CommentBubble = lazy(() => import("@/components/CommentBubble"));

type Rapper = Tables<"rappers"> & {
  top5_count?: number;
};

const RapperDetail = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedCategory] = useState("");
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const { searchTerm, setSearchTerm, searchResults, isSearching, hasMinLength } = useRapperAutocomplete();
  const { canSuggest } = useCanSuggestRappers();
  const refreshDiscography = useRefreshDiscography();

  const handleBackToAllRappers = () => {
    // First, check if there's a scrollPos in current URL (direct navigation)
    const scrollPosFromUrl = searchParams.get('scrollPos');
    
    // If no scroll position in URL, check navigation history
    if (!scrollPosFromUrl) {
      import('@/utils/navigationHistory').then(({ getLastAllRappersEntry }) => {
        const lastAllRappersVisit = getLastAllRappersEntry();
        
        if (lastAllRappersVisit && lastAllRappersVisit.scrollPos > 0) {
          // User came from /all-rappers, restore their scroll position
          navigate(`/all-rappers?scrollPos=${lastAllRappersVisit.scrollPos}`);
        } else {
          // User came from elsewhere, go to top
          navigate('/all-rappers');
        }
      });
    } else {
      // URL has scrollPos, use it
      navigate(`/all-rappers?scrollPos=${scrollPosFromUrl}`);
    }
  };

  const { data: rapper, isLoading } = useQuery({
    queryKey: ["rapper", id],
    queryFn: async () => {
      if (!id) throw new Error("No rapper ID provided");

      // Check if id is a UUID (old format) or slug (new format)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Fetch rapper data using either id or slug
      const { data: rapperData, error: rapperError } = await supabase
        .from("rappers")
        .select("*")
        .eq(isUUID ? "id" : "slug", id)
        .single();

      if (rapperError) throw rapperError;

      // Fetch Top 5 count using the database function
      const { data: countData, error: countError } = await supabase
        .rpc("get_rapper_top5_count", { rapper_uuid: rapperData.id });

      if (countError) {
        console.error("Error fetching Top 5 count:", countError);
        // Don't throw error, just set count to 0
        return { ...rapperData, top5_count: 0 };
      }

      return { ...rapperData, top5_count: countData || 0 };
    },
    enabled: !!id
  });

  // Track page view for activity scoring (using rapper UUID, not slug)
  usePageViewTracking({ 
    contentType: 'rapper', 
    contentId: rapper?.id, // Use UUID from loaded rapper data, not slug from URL
    debounceMs: 1000
  });

  // Ensure MusicBrainz fetch runs for artists without cached discography
  useEffect(() => {
    if (rapper && !rapper.discography_last_updated) {
      refreshDiscography.mutate(rapper.id);
    }
  }, [rapper?.id, rapper?.discography_last_updated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--theme-background))] via-[hsl(var(--theme-backgroundLight))] to-[hsl(var(--theme-background))] relative">
        <HeaderNavigation isScrolled={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--theme-background))]/80 via-[hsl(var(--theme-backgroundLight))]/80 to-[hsl(var(--theme-background))]/80 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto p-6 pt-28">
          <div className="animate-pulse">
            <div className="h-8 bg-[hsl(var(--theme-backgroundLight))] rounded w-32 mb-6"></div>
            <div className="h-96 bg-[hsl(var(--theme-backgroundLight))] rounded mb-6"></div>
            <div className="h-6 bg-[hsl(var(--theme-backgroundLight))] rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-[hsl(var(--theme-backgroundLight))] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rapper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--theme-background))] via-[hsl(var(--theme-backgroundLight))] to-[hsl(var(--theme-background))] relative">
        <HeaderNavigation isScrolled={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--theme-background))]/80 via-[hsl(var(--theme-backgroundLight))]/80 to-[hsl(var(--theme-background))]/80 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto p-6 pt-28">
          <ThemedButton 
            variant="outline" 
            className="mb-6 border-[var(--theme-primary)]/50 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 font-[var(--theme-font-body)]"
            onClick={handleBackToAllRappers}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back To All Rappers
          </ThemedButton>
          <ThemedCard className="bg-black border-4 border-[hsl(var(--theme-primary))] shadow-lg shadow-[hsl(var(--theme-primary))]/20">
            <ThemedCardContent className="p-8 text-center">
              <h2 className="text-2xl font-[var(--theme-font-heading)] text-[hsl(var(--theme-text))] mb-4">Rapper Not Found</h2>
              <p className="text-[hsl(var(--theme-text-muted))] font-[var(--theme-font-body)] mb-6">
                Our rapper database is growing, but we don't have that one yet! Try a different spelling, or suggest one to the admins.
              </p>

              {/* Inline Search */}
              <div className="max-w-md mx-auto mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--theme-text-muted))]" />
                  {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--theme-primary))] animate-spin" />}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a rapper..."
                    className="w-full h-10 pl-10 pr-10 rounded-md border border-[hsl(var(--theme-primary))]/50 bg-[hsl(var(--theme-background))] text-[hsl(var(--theme-text))] font-[var(--theme-font-body)] placeholder:text-[hsl(var(--theme-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--theme-primary))]"
                  />
                </div>

                {/* Search Results */}
                {hasMinLength && (
                  <div className="mt-2 rounded-md border border-[hsl(var(--theme-primary))]/30 bg-black overflow-hidden max-h-60 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.slice(0, 8).map((result: any) => (
                        <button
                          key={result.id}
                          onClick={() => navigate(`/rapper/${result.slug || result.id}`)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(var(--theme-primary))]/10 transition-colors text-left"
                        >
                          {result.image_url ? (
                            <img src={result.image_url} alt={result.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[hsl(var(--theme-primary))]/20 flex items-center justify-center">
                              <span className="text-xs text-[hsl(var(--theme-primary))]">{result.name?.[0]}</span>
                            </div>
                          )}
                          <span className="text-[hsl(var(--theme-text))] font-[var(--theme-font-body)] text-sm">{result.name}</span>
                        </button>
                      ))
                    ) : !isSearching ? (
                      <p className="px-4 py-3 text-sm text-[hsl(var(--theme-text-muted))]">No rappers found</p>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Suggest a Rapper */}
              {canSuggest && (
                <ThemedButton
                  variant="outline"
                  className="border-[hsl(var(--theme-primary))]/50 text-[hsl(var(--theme-primary))]"
                  onClick={() => setShowSuggestionModal(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Suggest a Rapper to Admins
                </ThemedButton>
              )}
            </ThemedCardContent>
          </ThemedCard>

          <RapperSuggestionModal
            open={showSuggestionModal}
            onOpenChange={setShowSuggestionModal}
          />
        </div>
      </div>
    );
  }

  // Generate SEO data
  const seoTitle = `${rapper.name} - Rapper Profile & Rankings | Spit Hierarchy`;
  const seoDescription = `Explore ${rapper.name}'s profile, vote on their skills, and see their rankings in our hip-hop community. ${rapper.bio ? rapper.bio.substring(0, 120) + '...' : `Learn about ${rapper.name}'s place in rap culture.`}`;
  const seoKeywords = [
    rapper.name,
    'rapper profile',
    'hip hop artist',
    'rap rankings',
    ...(rapper.origin ? [rapper.origin + ' rapper'] : [])
  ];

  return (
    <>
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={`/rapper/${rapper.slug}`}
        ogImage={rapper.image_url || undefined}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": rapper.name,
          "alternateName": rapper.real_name || undefined,
          "description": rapper.bio || `${rapper.name} is a rapper featured on Spit Hierarchy`,
          "birthPlace": rapper.origin || undefined,
          "birthDate": rapper.birth_year ? `${rapper.birth_year}` : undefined,
          "image": rapper.image_url || undefined,
          "url": `https://spithierarchy.com/rapper/${rapper.slug}`
        }}
      />
      
      <main className="min-h-screen bg-gradient-to-br from-[hsl(var(--theme-background))] via-[hsl(var(--theme-backgroundLight))] to-[hsl(var(--theme-background))] relative">
        <HeaderNavigation isScrolled={false} />
        
        <div className="relative z-10 max-w-4xl mx-auto p-3 sm:p-6 pt-24 sm:pt-28 pb-8">
          {/* Back Button - Now properly preserves navigation state */}
          <ThemedButton 
            variant="default" 
            className="font-[var(--theme-font-body)] text-black hover:text-black mb-6"
            onClick={handleBackToAllRappers}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back To All Rappers
          </ThemedButton>

          {/* Rapper Header */}
          <RapperHeader rapper={rapper} onVoteClick={() => setShowVoteModal(true)} />

          {/* Best Quote */}
          <Suspense fallback={null}>
            <RapperBestQuote topQuote={(rapper as any).top_quote} rapperName={rapper.name} rapperId={rapper.id} songTitle={(rapper as any).top_quote_song} />
          </Suspense>

          {/* Enhanced Bio Section with more content */}
          <RapperBio rapper={rapper} />

          {/* Attribute Stats - Sports-style performance stats */}
          <div className="mb-8">
            <RapperAttributeStats rapper={rapper} onVoteClick={() => setShowVoteModal(true)} />
          </div>

          {/* Career Overview - New sports-card style stats */}
          <div className="mb-8">
            <CareerStatsCard rapperId={rapper.id} isRefreshing={refreshDiscography.isPending} />
          </div>


          {/* Discography Section - MusicBrainz integration */}
          <Suspense fallback={<div className="mb-8 h-48 rounded-xl bg-[var(--theme-surface)]/20 animate-pulse" />}>
            <div className="mb-8">
              <RapperDiscography 
                rapperId={rapper.id} 
                rapperName={rapper.name}
                rapperSlug={rapper.slug}
                scrollPos={searchParams.get('scrollPos') || undefined}
              />
            </div>
          </Suspense>

          {/* Community Stats */}
          <div className="mb-8">
            <RapperStats rapper={rapper} />
          </div>

          {/* Similar Rappers Section */}
          <Suspense fallback={null}>
            <div className="mb-8">
              <SimilarRappersCard rapperId={rapper.id} />
            </div>
          </Suspense>
        </div>
      </main>

      {/* Footer - Outside main content for proper z-index */}
      <Footer />

      {/* Vote Modal */}
      {showVoteModal && (
        <VoteModal 
          rapper={rapper} 
          isOpen={showVoteModal} 
          onClose={() => setShowVoteModal(false)} 
          selectedCategory={selectedCategory} 
        />
      )}

      {/* Back to Top Button - positioned for pages with CommentBubble */}
      <BackToTopButton hasCommentBubble={true} />

      {/* Comment Bubble - Pinned to bottom */}
      <Suspense fallback={null}>
        <CommentBubble contentType="rapper" contentId={rapper.id} />
      </Suspense>
    </>
  );
};

export default RapperDetail;
