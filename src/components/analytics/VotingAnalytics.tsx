import GlobalStatsCards from "./GlobalStatsCards";
import CategoryPerformanceCard from "./CategoryPerformanceCard";
import TopVotedRappersCard from "./TopVotedRappersCard";
import RecentActivityCard from "./RecentActivityCard";
const VotingAnalytics = () => {
  return <div className="space-y-4 sm:space-y-6">
      <h3 className="font-ceviche text-rap-gold mb-3 sm:mb-4 font-thin sm:text-6xl text-4xl">
        Platform Analytics
      </h3>

      {/* Global Stats */}
      <GlobalStatsCards />

      {/* Category Analytics */}
      <CategoryPerformanceCard />

      {/* Top Voted Rappers */}
      <TopVotedRappersCard />

      {/* Recent Activity */}
      <RecentActivityCard />
    </div>;
};
export default VotingAnalytics;