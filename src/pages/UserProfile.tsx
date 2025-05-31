
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, MessageSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const UserProfile = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: memberStats } = useQuery({
    queryKey: ["member-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("member_stats")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: voteNotes } = useQuery({
    queryKey: ["vote-notes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("vote_notes")
        .select(`
          *,
          rappers (
            name,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-mogra text-rap-gold mb-4 animate-text-glow">Please sign in to view your profile</h2>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra text-rap-silver shadow-xl shadow-rap-gold/40">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-carbon-fiber/90 border-b border-rap-gold/30 p-4 shadow-lg shadow-rap-gold/20">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-2xl font-mogra bg-gradient-to-r from-rap-gold to-rap-silver bg-clip-text text-transparent animate-text-glow">
              Your Profile
            </h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6 pt-24">
          {/* Profile Header */}
          <div className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg p-6 mb-8 shadow-lg shadow-rap-gold/20">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-rap-silver">
                  {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-mogra text-rap-gold mb-2 animate-text-glow">
                  {profile?.full_name || profile?.username || user.email}
                </h2>
                
                {profile?.bio && (
                  <p className="text-rap-platinum mb-4 font-kaushan">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-rap-smoke">
                  {profile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {format(new Date(profile?.created_at || user.created_at), 'MMMM yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            {memberStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-rap-gold/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-rap-gold font-mogra">{memberStats.total_votes || 0}</div>
                  <div className="text-sm text-rap-smoke font-kaushan">Total Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rap-forest font-mogra">{memberStats.total_comments || 0}</div>
                  <div className="text-sm text-rap-smoke font-kaushan">Comments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rap-burgundy font-mogra">{memberStats.consecutive_voting_days || 0}</div>
                  <div className="text-sm text-rap-smoke font-kaushan">Voting Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rap-silver font-mogra capitalize">{memberStats.status || 'Bronze'}</div>
                  <div className="text-sm text-rap-smoke font-kaushan">Member Status</div>
                </div>
              </div>
            )}
          </div>

          {/* Vote Notes Section */}
          <div className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg p-6 shadow-lg shadow-rap-gold/20">
            <h3 className="text-xl font-mogra text-rap-gold mb-6 flex items-center gap-2 animate-text-glow">
              <MessageSquare className="w-5 h-5" />
              Your Vote Notes
            </h3>
            
            {voteNotes && voteNotes.length > 0 ? (
              <div className="space-y-4">
                {voteNotes.map((voteNote) => (
                  <div key={voteNote.id} className="bg-rap-carbon/30 border border-rap-gold/20 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {voteNote.rappers?.image_url && (
                        <img
                          src={voteNote.rappers.image_url}
                          alt={voteNote.rappers.name}
                          className="w-12 h-12 rounded-full object-cover border border-rap-gold/30"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-rap-gold font-kaushan">
                            {voteNote.rappers?.name}
                          </span>
                          <span className="text-xs text-rap-smoke">
                            {format(new Date(voteNote.created_at), 'MMM d, yyyy • h:mm a')}
                          </span>
                        </div>
                        <p className="text-rap-platinum font-kaushan">{voteNote.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-rap-smoke mx-auto mb-4" />
                <p className="text-rap-smoke font-kaushan">No vote notes yet</p>
                <p className="text-sm text-rap-smoke mt-2 font-kaushan">
                  Start voting with notes to see your thoughts here!
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
