
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HeaderNavigation from "@/components/HeaderNavigation";
import PublicProfileHeader from "@/components/profile/PublicProfileHeader";
import PublicProfileRankings from "@/components/profile/PublicProfileRankings";
import PublicProfileLoading from "@/components/profile/PublicProfileLoading";
import PublicProfileNotFound from "@/components/profile/PublicProfileNotFound";
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
      
      <div className="max-w-6xl mx-auto pt-20 px-4">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link to="/rankings" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Rankings</span>
          </Link>
        </div>

        <PublicProfileHeader profile={profile} rankingsCount={rankings.length} />
        <PublicProfileRankings profile={profile} rankings={rankings} />
      </div>
    </div>
  );
};

export default PublicUserProfile;
