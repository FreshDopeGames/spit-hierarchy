import GlobalStatsCards from "./GlobalStatsCards";
import CategoryPerformanceCard from "./CategoryPerformanceCard";
import TopVotedRappersCard from "./TopVotedRappersCard";
import RecentActivityCard from "./RecentActivityCard";
const VotingAnalytics = () => {
  return <div className="space-y-6">
      <h3 className="font-merienda text-rap-gold mb-4 font-extrabold text-2xl">Platform Analytics</h3>

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