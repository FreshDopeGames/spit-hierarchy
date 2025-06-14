import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, ArrowLeft, BarChart3, User, TrendingUp, Network, Star, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserVotingDashboard from "@/components/analytics/UserVotingDashboard";
import UserAchievements from "@/components/analytics/UserAchievements";
import VotingAnalytics from "@/components/analytics/VotingAnalytics";
import VotingTrends from "@/components/analytics/VotingTrends";
import TopVoters from "@/components/analytics/TopVoters";
import RapperNetworkGraph from "@/components/analytics/RapperNetworkGraph";
import AstrologicalRankings from "@/components/analytics/AstrologicalRankings";
import InternalPageHeader from "@/components/InternalPageHeader";

const Analytics = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <InternalPageHeader 
          backLink="/"
          backText="Back to Home"
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-3 sm:p-6 pt-16 sm:pt-24">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-rap-silver" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-mogra bg-gradient-to-r from-rap-gold to-rap-silver bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-mogra text-rap-gold mb-2">
              Community Insights
            </h2>
            <p className="text-rap-platinum font-kaushan text-base sm:text-lg tracking-wide">
              Deep dive into voting patterns and community trends
            </p>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full min-w-[600px] sm:min-w-0 sm:max-w-4xl grid-cols-6 bg-carbon-fiber border border-rap-gold border-2 mb-4 sm:mb-6">
                <TabsTrigger value="personal" className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-merienda font-extrabold text-rap-platinum text-xs sm:text-sm p-2 sm:p-3">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">My Stats</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-merienda font-extrabold text-rap-platinum text-xs sm:text-sm p-2 sm:p-3">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">My Achievements</span>
                </TabsTrigger>
                <TabsTrigger value="platform" className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-merienda font-extrabold text-rap-platinum text-xs sm:text-sm p-2 sm:p-3">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Community</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-merienda font-extrabold text-rap-platinum text-xs sm:text-sm p-2 sm:p-3">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Trends</span>
                </TabsTrigger>
                <TabsTrigger value="network" className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-merienda font-extrabold text-rap-platinum text-xs sm:text-sm p-2 sm:p-3">
                  <Network className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Network</span>
                </TabsTrigger>
                <TabsTrigger value="astrology" className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-merienda font-extrabold text-rap-platinum text-xs sm:text-sm p-2 sm:p-3">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Astrology</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="personal" className="mt-4 sm:mt-6">
              <UserVotingDashboard />
            </TabsContent>

            <TabsContent value="achievements" className="mt-4 sm:mt-6">
              <UserAchievements />
            </TabsContent>

            <TabsContent value="platform" className="mt-4 sm:mt-6">
              <VotingAnalytics />
            </TabsContent>

            <TabsContent value="trends" className="mt-4 sm:mt-6">
              <div className="space-y-4 sm:space-y-6">
                <VotingTrends />
                <TopVoters />
              </div>
            </TabsContent>

            <TabsContent value="network" className="mt-4 sm:mt-6">
              <RapperNetworkGraph />
            </TabsContent>

            <TabsContent value="astrology" className="mt-4 sm:mt-6">
              <AstrologicalRankings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
