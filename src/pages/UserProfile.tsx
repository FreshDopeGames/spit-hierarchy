import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import MyTopFiveSection from "@/components/profile/MyTopFiveSection";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileAchievements from "@/components/profile/ProfileAchievements";
import VoteNotesSection from "@/components/profile/VoteNotesSection";
import CypherJournalSection from "@/components/profile/CypherJournalSection";
import VotingHistorySection from "@/components/profile/VotingHistorySection";
import { AvatarSkeleton, TextSkeleton } from "@/components/ui/skeleton";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { useProfileAccessTracking } from "@/hooks/useProfileAccessTracking";

const UserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { openOnboarding } = useOnboarding();

  // Track profile access for achievements (self view)
  useProfileAccessTracking({
    accessedProfileId: user?.id || '',
    isSelf: true
  });

  // Set page title
  useEffect(() => {
    document.title = user ? "My Profile - Spit Hierarchy" : "Sign In Required - Spit Hierarchy";
  }, [user]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .rpc('get_own_profile')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: memberStats, isLoading: memberStatsLoading } = useQuery({
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

  const { data: voteNotes, isLoading: voteNotesLoading } = useQuery({
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

  const { data: publicStats, isLoading: publicStatsLoading } = useQuery({
    queryKey: ["public-profile-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .rpc('get_public_profile_stats', { profile_user_id: user.id })
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Show loading screen while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
        <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
        <HeaderNavigation isScrolled={false} />
        
        <div className="relative z-10 pt-24 sm:pt-28 max-w-4xl mx-auto p-3 sm:p-6">
          {/* Profile Header Skeleton */}
          <div className="bg-carbon-fiber/90 border-4 border-rap-gold/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-rap-gold/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <AvatarSkeleton size="lg" className="w-24 h-24 sm:w-32 sm:h-32" />
              </div>
              <div className="flex-1 text-center sm:text-left w-full">
                <TextSkeleton width="w-48" height="h-8" className="mb-2 mx-auto sm:mx-0" />
                <TextSkeleton width="w-32" height="h-4" className="mb-4 mx-auto sm:mx-0" />
                <TextSkeleton width="w-24" height="h-4" className="mx-auto sm:mx-0" />
              </div>
            </div>
          </div>
          
          {/* Additional skeleton elements for other sections */}
          <div className="space-y-6">
            <div className="bg-carbon-fiber/90 border-4 border-rap-gold/30 rounded-lg p-4 sm:p-6 shadow-lg shadow-rap-gold/20">
              <TextSkeleton width="w-32" height="h-6" className="mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <TextSkeleton width="w-12" height="h-8" className="mx-auto mb-2" />
                    <TextSkeleton width="w-16" height="h-4" className="mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
        <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-mogra text-rap-gold mb-4 animate-text-glow">
                Please sign in to view your profile
              </h2>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra text-rap-silver shadow-xl shadow-rap-gold/40">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  // Combined loading state for profile data
  const isDataLoading = profileLoading || memberStatsLoading || voteNotesLoading || publicStatsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative font-merienda">
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <HeaderNavigation isScrolled={false} />

        <main className="flex-1 max-w-4xl mx-auto p-3 sm:p-6 pt-24 sm:pt-28">
          {isDataLoading ? (
            // Show skeleton while profile data loads
            <>
              <div className="bg-carbon-fiber/90 border-4 border-rap-gold/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-rap-gold/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <AvatarSkeleton size="lg" className="w-24 h-24 sm:w-32 sm:h-32" />
                  </div>
                  <div className="flex-1 text-center sm:text-left w-full">
                    <TextSkeleton width="w-48" height="h-8" className="mb-2 mx-auto sm:mx-0" />
                    <TextSkeleton width="w-32" height="h-4" className="mb-4 mx-auto sm:mx-0" />
                    <TextSkeleton width="w-24" height="h-4" className="mx-auto sm:mx-0" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-carbon-fiber/90 border-4 border-rap-gold/30 rounded-lg p-4 sm:p-6 shadow-lg shadow-rap-gold/20">
                  <TextSkeleton width="w-32" height="h-6" className="mb-4" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="text-center">
                        <TextSkeleton width="w-12" height="h-8" className="mx-auto mb-2" />
                        <TextSkeleton width="w-16" height="h-4" className="mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Show actual content when loaded
            <>
              <ProfileHeader user={user} profile={profile} memberStats={memberStats} />
              
              <MyTopFiveSection />

              {/* Show onboarding trigger if user has no top 5 */}
              {memberStats?.top_five_created === 0 && (
                <div 
                  className="border-4 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg text-center"
                  style={{
                    backgroundColor: 'hsl(var(--theme-surface))',
                    borderColor: 'hsl(var(--theme-border))',
                    boxShadow: '0 10px 25px -5px hsl(var(--theme-primary)/0.1), 0 4px 6px -2px hsl(var(--theme-primary)/0.05)'
                  }}
                >
                  <h3 
                    className="text-lg font-bold mb-2"
                    style={{ 
                      color: 'hsl(var(--theme-primary))',
                      fontFamily: 'var(--theme-font-heading)'
                    }}
                  >
                    Get Started with Your Top 5
                  </h3>
                  <p 
                    className="mb-4"
                    style={{ 
                      color: 'hsl(var(--theme-textMuted))',
                      fontFamily: 'var(--theme-font-body)'
                    }}
                  >
                    Select your favorite rappers to personalize your experience and connect with the community.
                  </p>
                  <Button
                    onClick={openOnboarding}
                    style={{
                      backgroundColor: 'hsl(var(--theme-primary))',
                      color: 'hsl(var(--theme-textLight))'
                    }}
                    className="hover:opacity-90"
                  >
                    Choose My Top 5
                  </Button>
                </div>
              )}

              <ProfileStats memberStats={memberStats} publicStats={publicStats} />

              {/* Voting History */}
              <div className="mb-6 sm:mb-8">
                <VotingHistorySection />
              </div>

              {/* Achievements */}
              <div className="mb-6 sm:mb-8">
                <ProfileAchievements />
              </div>

              <VoteNotesSection voteNotes={voteNotes || []} />

              {/* Cypher Journal */}
              <div className="mt-6 sm:mt-8">
                <CypherJournalSection userId={user.id} />
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default UserProfile;
