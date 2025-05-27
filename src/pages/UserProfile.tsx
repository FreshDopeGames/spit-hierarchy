
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please sign in to view your profile</h2>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/40 border-b border-purple-500/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-purple-300 hover:text-purple-200">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Your Profile
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-black/40 border border-purple-500/20 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {profile?.full_name || profile?.username || user.email}
              </h2>
              
              {profile?.bio && (
                <p className="text-gray-300 mb-4">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-500/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{memberStats.total_votes || 0}</div>
                <div className="text-sm text-gray-400">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{memberStats.total_comments || 0}</div>
                <div className="text-sm text-gray-400">Comments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{memberStats.consecutive_voting_days || 0}</div>
                <div className="text-sm text-gray-400">Voting Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 capitalize">{memberStats.status || 'Bronze'}</div>
                <div className="text-sm text-gray-400">Member Status</div>
              </div>
            </div>
          )}
        </div>

        {/* Vote Notes Section */}
        <div className="bg-black/40 border border-purple-500/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Your Vote Notes
          </h3>
          
          {voteNotes && voteNotes.length > 0 ? (
            <div className="space-y-4">
              {voteNotes.map((voteNote) => (
                <div key={voteNote.id} className="bg-black/30 border border-purple-500/10 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {voteNote.rappers?.image_url && (
                      <img
                        src={voteNote.rappers.image_url}
                        alt={voteNote.rappers.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-purple-300">
                          {voteNote.rappers?.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(voteNote.created_at), 'MMM d, yyyy • h:mm a')}
                        </span>
                      </div>
                      <p className="text-gray-300">{voteNote.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No vote notes yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Start voting with notes to see your thoughts here!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
