import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRefreshDiscography } from "@/hooks/useRapperDiscography";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { ArrowLeft } from "lucide-react";
import VoteModal from "@/components/VoteModal";
import CommentBubble from "@/components/CommentBubble";
import BackToTopButton from "@/components/BackToTopButton";
import RapperHeader from "@/components/rapper/RapperHeader";
import RapperBioExpanded from "@/components/content/RapperBioExpanded";
import RapperStats from "@/components/rapper/RapperStats";
import RapperAttributeStats from "@/components/rapper/RapperAttributeStats";
import CareerStatsCard from "@/components/rapper/CareerStatsCard";
import RapperDiscography from "@/components/rapper/RapperDiscography";
import { RapperAliases } from "@/components/rapper/RapperAliases";
import HeaderNavigation from "@/components/HeaderNavigation";
import SEOHead from "@/components/seo/SEOHead";
import ContentAdUnit from "@/components/ads/ContentAdUnit";
import Footer from "@/components/Footer";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers"> & {
  top5_count?: number;
};

const RapperDetail = () => {
  const { id } = useParams<{ id: string; }>();
  const { user } = useAuth();
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedCategory] = useState("");
  const refreshDiscography = useRefreshDiscography();

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
          <Link to="/all-rappers">
            <ThemedButton variant="outline" className="mb-6 border-[var(--theme-primary)]/50 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 font-[var(--theme-font-body)]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back To All Rappers
            </ThemedButton>
          </Link>
          <ThemedCard className="bg-black border-4 border-[hsl(var(--theme-primary))] shadow-lg shadow-[var(--theme-primary)]/20">
            <ThemedCardContent className="p-8 text-center">
              <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)] mb-4">Pharaoh Not Found</h2>
              <p className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">This pharaoh has vanished from the dynasty.</p>
            </ThemedCardContent>
          </ThemedCard>
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
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": rapper.name,
          "alternateName": rapper.real_name || undefined,
          "description": rapper.bio || `${rapper.name} is a rapper featured on Spit Hierarchy`,
          "birthPlace": rapper.origin || undefined,
          "birthDate": rapper.birth_year ? `${rapper.birth_year}` : undefined,
          "url": typeof window !== 'undefined' ? window.location.href : undefined
        }}
      />
      
      <main className="min-h-screen bg-gradient-to-br from-[hsl(var(--theme-background))] via-[hsl(var(--theme-backgroundLight))] to-[hsl(var(--theme-background))] relative">
        <HeaderNavigation isScrolled={false} />
        
        <div className="relative z-10 max-w-4xl mx-auto p-6 pt-28 pb-8">
          {/* Back Button - Now properly preserves navigation state */}
          <Link to="/all-rappers" className="inline-block mb-6">
            <ThemedButton variant="outline" className="border-[var(--theme-primary)]/50 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 hover:border-[var(--theme-primary)] font-[var(--theme-font-body)] shadow-lg shadow-[var(--theme-primary)]/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back To All Rappers
            </ThemedButton>
          </Link>

          {/* Rapper Header */}
          <RapperHeader rapper={rapper} onVoteClick={() => setShowVoteModal(true)} />

          {/* Aliases */}
          {rapper.aliases && rapper.aliases.length > 0 && (
            <div className="mb-6">
              <RapperAliases aliases={rapper.aliases} />
            </div>
          )}

          {/* Enhanced Bio Section with more content */}
          <RapperBioExpanded rapper={rapper} />

          {/* Career Overview - New sports-card style stats */}
          <div className="mb-8">
            <CareerStatsCard rapperId={rapper.id} />
          </div>

          {/* Ad placement between content sections */}
          <ContentAdUnit size="medium" />

          {/* Discography Section - MusicBrainz integration */}
          <div className="mb-8">
            <RapperDiscography rapperId={rapper.id} rapperName={rapper.name} />
          </div>

          {/* Attribute Stats - Sports-style performance stats */}
          <div className="mb-8">
            <RapperAttributeStats rapper={rapper} onVoteClick={() => setShowVoteModal(true)} />
          </div>

          {/* Community Stats */}
          <div className="mb-8">
            <RapperStats rapper={rapper} />
          </div>
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
      <CommentBubble contentType="rapper" contentId={rapper.id} />
    </>
  );
};

export default RapperDetail;
