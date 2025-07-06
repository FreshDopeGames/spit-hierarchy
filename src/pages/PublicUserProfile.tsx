
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderNavigation from "@/components/HeaderNavigation";
import PublicProfileHeader from "@/components/profile/PublicProfileHeader";
import PublicProfileRankings from "@/components/profile/PublicProfileRankings";
import PublicProfileLoading from "@/components/profile/PublicProfileLoading";
import PublicProfileNotFound from "@/components/profile/PublicProfileNotFound";
import Footer from "@/components/Footer";
import { usePublicUserData } from "@/hooks/usePublicUserData";

const PublicUserProfile = () => {
  const { username } = useParams();
  const { profile, rankings, loading, notFound, fetchUserData } = usePublicUserData();

  useEffect(() => {
    if (username) {
      fetchUserData(username);
    }
  }, [username, fetchUserData]);

  if (loading) {
    return <PublicProfileLoading />;
  }

  if (notFound || !profile) {
    return <PublicProfileNotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={false} />
      
      <div className="max-w-6xl mx-auto pt-20 px-4 pb-8">
        <PublicProfileHeader profile={profile} rankingsCount={rankings.length} />
        <PublicProfileRankings profile={profile} rankings={rankings} />
      </div>

      <Footer />
    </div>
  );
};

export default PublicUserProfile;
