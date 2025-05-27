
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
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

const RapperDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedCategory] = useState("overall");

  const { data: rapper, isLoading } = useQuery({
    queryKey: ["rapper", id],
    queryFn: async () => {
      if (!id) throw new Error("No rapper ID provided");
      
      const { data, error } = await supabase
        .from("rappers")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-32 mb-6"></div>
            <div className="h-96 bg-gray-700 rounded mb-6"></div>
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rapper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto p-6">
          <Link to="/">
            <Button variant="outline" className="mb-6 border-purple-500/30 text-purple-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Rapper Not Found</h2>
              <p className="text-gray-400">The rapper you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <Link to="/">
          <Button variant="outline" className="mb-6 border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Rapper Header */}
        <RapperHeader rapper={rapper} onVoteClick={() => setShowVoteModal(true)} />

        {/* Bio Section */}
        <RapperBio rapper={rapper} />

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
