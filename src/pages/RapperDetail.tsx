import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRefreshDiscography } from "@/hooks/useRapperDiscography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  // Ensure MusicBrainz fetch runs for artists without cached discography
  useEffect(() => {
    if (rapper && !rapper.discography_last_updated) {
      refreshDiscography.mutate(rapper.id);
    }
  }, [rapper?.id, rapper?.discography_last_updated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
        <HeaderNavigation isScrolled={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto p-6 pt-28">
          <div className="animate-pulse">
            <div className="h-8 bg-rap-carbon-light rounded w-32 mb-6"></div>
            <div className="h-96 bg-rap-carbon-light rounded mb-6"></div>
            <div className="h-6 bg-rap-carbon-light rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-rap-carbon-light rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rapper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
        <HeaderNavigation isScrolled={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto p-6 pt-28">
          <Link to="/all-rappers">
            <Button variant="outline" className="mb-6 border-rap-gold/50 text-rap-gold hover:bg-rap-gold/10 font-kaushan">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back To All Rappers
            </Button>
          </Link>
          <Card className="bg-carbon-fiber border-rap-burgundy/30 shadow-lg shadow-rap-burgundy/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-mogra text-rap-silver mb-4">Pharaoh Not Found</h2>
              <p className="text-rap-smoke font-kaushan">This pharaoh has vanished from the dynasty.</p>
            </CardContent>
          </Card>
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
      
      <main className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
        <HeaderNavigation isScrolled={false} />
        
        <div className="relative z-10 max-w-4xl mx-auto p-6 pt-28 pb-8">
          {/* Back Button - Now properly preserves navigation state */}
          <Link to="/all-rappers" className="inline-block mb-6">
            <Button variant="outline" className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/10 hover:border-rap-gold font-kaushan shadow-lg shadow-rap-gold/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back To All Rappers
            </Button>
          </Link>

          {/* Rapper Header */}
          <RapperHeader rapper={rapper} onVoteClick={() => setShowVoteModal(true)} />

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
            <RapperDiscography rapperId={rapper.id} />
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
