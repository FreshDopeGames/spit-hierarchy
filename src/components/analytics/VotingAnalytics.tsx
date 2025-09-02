import GlobalStatsCards from "./GlobalStatsCards";
import CategoryPerformanceCard from "./CategoryPerformanceCard";
import TopVotedRappersCard from "./TopVotedRappersCard";
const VotingAnalytics = () => {
  return <div className="space-y-4 sm:space-y-6">
      <h3 className="font-ceviche text-primary mb-3 sm:mb-4 text-4xl sm:text-6xl">
        Platform Analytics
      </h3>

      {/* Global Stats */}
      <GlobalStatsCards />

      {/* Category Analytics */}
      <CategoryPerformanceCard />

      {/* Top Voted Rappers */}
      <TopVotedRappersCard />
    </div>;
};
export default VotingAnalytics;