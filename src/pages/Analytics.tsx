
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, User, Trophy, TrendingUp } from "lucide-react";
import UserVotingDashboard from "@/components/analytics/UserVotingDashboard";
import UserAchievements from "@/components/analytics/UserAchievements";
import VotingAnalytics from "@/components/analytics/VotingAnalytics";
import InternalPageHeader from "@/components/InternalPageHeader";

const Analytics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'stats');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['stats', 'achievements', 'platform'].includes(tab)) {
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
          <TabsList className="grid w-full grid-cols-3 bg-rap-carbon-light border border-rap-gold/30 mt-6 md:mt-8 lg:mt-10 relative z-10">
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              My Stats
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger 
              value="platform" 
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Platform
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <UserVotingDashboard />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <UserAchievements />
          </TabsContent>

          <TabsContent value="platform" className="space-y-6">
            <VotingAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
