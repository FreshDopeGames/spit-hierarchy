
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import VoteModal from "@/components/VoteModal";
import CommentBubble from "@/components/CommentBubble";
import RapperHeader from "@/components/rapper/RapperHeader";
import RapperBio from "@/components/rapper/RapperBio";
import RapperStats from "@/components/rapper/RapperStats";
import RapperAttributeStats from "@/components/rapper/RapperAttributeStats";
import HeaderNavigation from "@/components/HeaderNavigation";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers"> & {
  top5_count?: number;
};

const RapperDetail = () => {
  const { id } = useParams<{ id: string; }>();
  const { user } = useAuth();
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedCategory] = useState("");

  const { data: rapper, isLoading } = useQuery({
    queryKey: ["rapper", id],
    queryFn: async () => {
      if (!id) throw new Error("No rapper ID provided");

      // Fetch rapper data
      const { data: rapperData, error: rapperError } = await supabase
        .from("rappers")
        .select("*")
        .eq("id", id)
        .single();

      if (rapperError) throw rapperError;

      // Fetch Top 5 count using the database function
      const { data: countData, error: countError } = await supabase
        .rpc("get_rapper_top5_count", { rapper_uuid: id });

      if (countError) {
        console.error("Error fetching Top 5 count:", countError);
        // Don't throw error, just set count to 0
        return { ...rapperData, top5_count: 0 };
      }

      return { ...rapperData, top5_count: countData || 0 };
    },
    enabled: !!id
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
      <HeaderNavigation isScrolled={false} />
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto p-6 pt-28">
        {/* Back Button - Now properly preserves navigation state */}
        <Link to="/all-rappers" className="inline-block mb-6">
          <Button variant="outline" className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/10 hover:border-rap-gold font-kaushan shadow-lg shadow-rap-gold/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back To All Rappers
          </Button>
        </Link>

        {/* Rapper Header */}
        <RapperHeader rapper={rapper} onVoteClick={() => setShowVoteModal(true)} />

        {/* Bio Section */}
        <RapperBio rapper={rapper} />

        {/* Attribute Stats - New sports-style stats */}
        <div className="mb-8 bg-rap-carbon">
          <RapperAttributeStats rapper={rapper} />
        </div>

        {/* Community Stats */}
        <RapperStats rapper={rapper} />
      </div>

      {/* Vote Modal */}
      {showVoteModal && (
        <VoteModal 
          rapper={rapper} 
          isOpen={showVoteModal} 
          onClose={() => setShowVoteModal(false)} 
          selectedCategory={selectedCategory} 
        />
      )}

      {/* Comment Bubble - Pinned to bottom */}
      <CommentBubble contentType="rapper" contentId={rapper.id} />
    </div>
  );
};

export default RapperDetail;
