import RapperAgeCard from "./RapperAgeCard";
import TopCitiesCard from "./TopCitiesCard";
import AlbumStatsCard from "./AlbumStatsCard";
import CareerLengthCard from "./CareerLengthCard";
import TopTagsCard from "./TopTagsCard";
import TopRappersByCategoryCard from "./TopRappersByCategoryCard";
import ZodiacDistributionCard from "./ZodiacDistributionCard";

const RapperStatsAnalytics = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="font-ceviche text-primary mb-3 sm:mb-4 text-4xl sm:text-6xl">
        Rapper Statistics
      </h3>

      {/* Top Rappers by Category */}
      <TopRappersByCategoryCard />

      {/* Basic Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <RapperAgeCard />
        <CareerLengthCard />
        <AlbumStatsCard />
        <TopCitiesCard />
      </div>

      {/* Top Tags */}
      <TopTagsCard />

      {/* Zodiac Distribution */}
      <ZodiacDistributionCard />
    </div>
  );
};

export default RapperStatsAnalytics;