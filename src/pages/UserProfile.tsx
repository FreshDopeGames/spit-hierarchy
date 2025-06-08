import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import VoteNotesSection from "@/components/profile/VoteNotesSection";
const UserProfile = () => {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const {
        data,
        error
      } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
  const {
    data: memberStats
  } = useQuery({
    queryKey: ["member-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const {
        data,
        error
      } = await supabase.from("member_stats").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
  const {
    data: voteNotes
  } = useQuery({
    queryKey: ["vote-notes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const {
        data,
        error
      } = await supabase.from("vote_notes").select(`
          *,
          rappers (
            name,
            image_url
          )
        `).eq("user_id", user.id).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-mogra text-rap-gold mb-4 animate-text-glow">Please sign in to view your profile</h2>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra text-rap-silver shadow-xl shadow-rap-gold/40">
              Sign In
            </Button>
          </Link>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative font-merienda">
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-carbon-fiber/90 border-b border-rap-gold/30 p-4 shadow-lg shadow-rap-gold/20">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-2xl font-merienda bg-gradient-to-r from-rap-gold to-rap-silver bg-clip-text text-transparent">MY PROFILE</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6 pt-24">
          <ProfileHeader user={user} profile={profile} />
          
          <div className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg p-6 mb-8 shadow-lg shadow-rap-gold/20">
            <ProfileStats memberStats={memberStats} />
          </div>

          <VoteNotesSection voteNotes={voteNotes || []} />
        </main>
      </div>
    </div>;
};
export default UserProfile;