
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, User, Trophy, TrendingUp, Users, Music } from "lucide-react";
import UserVotingDashboard from "@/components/analytics/UserVotingDashboard";
import UserAchievements from "@/components/analytics/UserAchievements";
import VotingAnalytics from "@/components/analytics/VotingAnalytics";
import MemberAnalytics from "@/components/analytics/MemberAnalytics";
import RapperStatsAnalytics from "@/components/analytics/RapperStatsAnalytics";
import InternalPageHeader from "@/components/InternalPageHeader";
import Footer from "@/components/Footer";

const Analytics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'platform');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['platform', 'members', 'achievements', 'rapper-stats', 'stats'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <InternalPageHeader 
        title="Analytics Dashboard"
        subtitle="Track your progress and explore platform insights"
      />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-rap-carbon-light border border-rap-gold/30 mt-12 md:mt-16 lg:mt-20 relative z-10 min-h-[70px] sm:min-h-[60px] py-2">
            <TabsTrigger 
              value="platform" 
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Platform</span>
            </TabsTrigger>
            <TabsTrigger 
              value="rapper-stats" 
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Music className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Rappers</span>
            </TabsTrigger>
            <TabsTrigger 
              value="members" 
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Awards</span>
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">My Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="space-y-6">
            <VotingAnalytics />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MemberAnalytics />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <UserAchievements />
          </TabsContent>

          <TabsContent value="rapper-stats" className="space-y-6">
            <RapperStatsAnalytics />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <UserVotingDashboard />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Analytics;
