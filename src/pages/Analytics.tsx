
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ThemedTabs, ThemedTabsContent, ThemedTabsList, ThemedTabsTrigger } from "@/components/ui/themed-tabs";
import { BarChart3, User, Trophy, TrendingUp, Users, Music } from "lucide-react";
import UserVotingDashboard from "@/components/analytics/UserVotingDashboard";
import UserAchievements from "@/components/analytics/UserAchievements";
import VotingAnalytics from "@/components/analytics/VotingAnalytics";
import MemberAnalytics from "@/components/analytics/MemberAnalytics";
import RapperStatsAnalytics from "@/components/analytics/RapperStatsAnalytics";
import GuestAnalyticsView from "@/components/analytics/GuestAnalyticsView";
import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { usePageVisitTracking } from "@/hooks/usePageVisitTracking";
import BackToTopButton from "@/components/BackToTopButton";
import SEOHead from "@/components/seo/SEOHead";

const Analytics = () => {
  const { user } = useAuth();

  // Track analytics page visit for achievements
  usePageVisitTracking('analytics_visits');

  // Show guest view for unauthenticated users
  if (!user) {
    return <GuestAnalyticsView />;
  }
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'rapper-stats');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['rapper-stats', 'platform', 'members', 'achievements', 'stats'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-[var(--theme-element-page-background-bg,var(--theme-background))]">
      <SEOHead
        title="Platform Analytics - Spit Hierarchy"
        description="View comprehensive analytics and insights about rapper rankings, voting trends, and community activity."
        robots="noindex, nofollow"
      />
      <HeaderNavigation isScrolled={false} />
      
      <div className="container mx-auto px-4 py-8 md:py-12 pt-24">
        <ThemedTabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <ThemedTabsList className="grid w-full grid-cols-5 mt-4 md:mt-8 lg:mt-12 relative z-10 min-h-[70px] sm:min-h-[60px] py-2">
            <ThemedTabsTrigger 
              value="rapper-stats" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              aria-label="Rapper Statistics"
            >
              <Music className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              <span className="hidden xs:inline">Rappers</span>
            </ThemedTabsTrigger>
            <ThemedTabsTrigger 
              value="platform" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              aria-label="Platform Analytics"
            >
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              <span className="hidden xs:inline">Platform</span>
            </ThemedTabsTrigger>
            <ThemedTabsTrigger 
              value="members" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              aria-label="Member Analytics"
            >
              <Users className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              <span className="hidden xs:inline">Members</span>
            </ThemedTabsTrigger>
            <ThemedTabsTrigger 
              value="achievements" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              aria-label="Awards and Achievements"
            >
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              <span className="hidden xs:inline">Awards</span>
            </ThemedTabsTrigger>
            <ThemedTabsTrigger 
              value="stats" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              aria-label="My Personal Statistics"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              <span className="hidden xs:inline">My Stats</span>
            </ThemedTabsTrigger>
          </ThemedTabsList>

          <ThemedTabsContent value="platform" className="space-y-6">
            <VotingAnalytics />
          </ThemedTabsContent>

          <ThemedTabsContent value="members" className="space-y-6">
            <MemberAnalytics />
          </ThemedTabsContent>

          <ThemedTabsContent value="achievements" className="space-y-6">
            <UserAchievements />
          </ThemedTabsContent>

          <ThemedTabsContent value="rapper-stats" className="space-y-6">
            <RapperStatsAnalytics />
          </ThemedTabsContent>

          <ThemedTabsContent value="stats" className="space-y-6">
            <UserVotingDashboard />
          </ThemedTabsContent>
        </ThemedTabs>
      </div>

      <BackToTopButton />
      <Footer />
    </div>
  );
};

export default Analytics;
