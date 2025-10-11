import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HeaderNavigation from "@/components/HeaderNavigation";
import PublicProfileHeader from "@/components/profile/PublicProfileHeader";
import PublicTopFiveSection from "@/components/profile/PublicTopFiveSection";
import PublicProfileLoading from "@/components/profile/PublicProfileLoading";
import PublicProfileNotFound from "@/components/profile/PublicProfileNotFound";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { PublicProfile } from "@/types/publicProfile";

const PublicUserProfileByUsername = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (username && user) { // Only authenticated users can view profiles
      fetchUserProfile();
    } else if (!user) {
      setNotFound(true);
      setLoading(false);
    }
  }, [username, user]);

  const fetchUserProfile = async () => {
    if (!username) return;

    try {
      setLoading(true);
      setNotFound(false);

      // Find user by username
      const { data: userData, error: userError } = await supabase
        .rpc('find_user_by_username', { search_username: username });

      if (userError || !userData || userData.length === 0) {
        console.error("Error finding user:", userError);
        setNotFound(true);
        return;
      }

      const userId = userData[0].id;

      // Get profile data with member stats
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_public_profile_full', { profile_user_id: userId });

      if (profileError || !profileData || profileData.length === 0) {
        console.error("Error fetching profile:", profileError);
        setNotFound(true);
        return;
      }

      // Fetch public profile stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_public_profile_stats', { profile_user_id: userId })
        .single();

      if (statsError) {
        console.error("Error fetching profile stats:", statsError);
      }

      // Transform the data to match the PublicProfile interface
      const profileWithStats: PublicProfile = {
        id: profileData[0].id,
        username: profileData[0].username,
        avatar_url: profileData[0].avatar_url,
        created_at: profileData[0].created_at,
        member_stats: {
          ...(profileData[0].member_stats as any),
          ...(statsData || {})
        }
      };

      setProfile(profileWithStats);

      // Fetch user rankings
      const { data: rankingsData, error: rankingsError } = await supabase
        .from("user_rankings")
        .select(`
          id,
          title,
          description,
          category,
          created_at,
          is_public,
          slug
        `)
        .eq("user_id", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (rankingsError) {
        console.error("Error fetching rankings:", rankingsError);
      } else {
        setRankings(rankingsData || []);
      }

    } catch (error) {
      console.error("Unexpected error:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PublicProfileLoading />;
  }

  if (notFound || !profile || !user) {
    return <PublicProfileNotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={false} />
      
      <div className="max-w-6xl mx-auto pt-20 px-4 pb-8">
        <PublicProfileHeader profile={profile} rankingsCount={rankings.length} />
        <PublicTopFiveSection userId={profile.id} username={profile.username} />
      </div>

      <Footer />
    </div>
  );
};

export default PublicUserProfileByUsername;