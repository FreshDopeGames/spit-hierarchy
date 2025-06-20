
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HeaderNavigation from "@/components/HeaderNavigation";
import RankingHeader from "@/components/rankings/RankingHeader";
import OfficialRankingsSection from "@/components/rankings/OfficialRankingsSection";
import UserRankingsSection from "@/components/rankings/UserRankingsSection";
import RankingDetailView from "@/components/rankings/RankingDetailView";
import { useRankingsData } from "@/hooks/useRankingsData";
import { transformOfficialRankings, transformUserRankings } from "@/utils/rankingTransformers";

const Rankings = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedRanking, setSelectedRanking] = useState<string | null>(null);
  
  const { officialRankings, userRankingData, loading } = useRankingsData();

  // Add scroll detection for header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transform database data to match component props
  const transformedOfficialRankings = transformOfficialRankings(officialRankings);
  const transformedUserRankings = transformUserRankings(userRankingData);

  // Combine all rankings for selection
  const allRankings = [...transformedOfficialRankings, ...transformedUserRankings];
  const selectedRankingData = allRankings.find(r => r.id === selectedRanking);

  if (selectedRanking && selectedRankingData) {
    return (
      <RankingDetailView 
        ranking={selectedRankingData} 
        onBack={() => setSelectedRanking(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-gold font-mogra text-xl">Loading rankings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon overflow-x-hidden">
      {/* Sticky Header - same as home page */}
      <HeaderNavigation isScrolled={isScrolled} />

      {/* Main Content with increased top padding to account for fixed header */}
      <main className="pt-20 sm:pt-24 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-8 sm:pt-12 lg:pt-16">
          
          {/* Back to Home Link */}
          <div className="mb-8">
            <Link to="/" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <RankingHeader 
            title="Top Rapper Rankings" 
            description="Discover comprehensive rapper rankings with every artist in our database. Official rankings now include all 112+ rappers, while community rankings let you create your own complete lists." 
          />

          <OfficialRankingsSection 
            rankings={transformedOfficialRankings} 
            onRankingClick={setSelectedRanking} 
          />

          <UserRankingsSection 
            rankings={transformedUserRankings} 
            onRankingClick={setSelectedRanking} 
            hasNextPage={userRankingData?.hasMore || false} 
            onLoadMore={() => {}} 
            isLoadingMore={false} 
          />
        </div>
      </main>
    </div>
  );
};

export default Rankings;
