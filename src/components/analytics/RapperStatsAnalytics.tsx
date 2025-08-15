import RapperAgeCard from "./RapperAgeCard";
import TopCitiesCard from "./TopCitiesCard";
import AlbumStatsCard from "./AlbumStatsCard";
import CareerLengthCard from "./CareerLengthCard";
import TopTagsCard from "./TopTagsCard";
import TopRappersByCategoryCard from "./TopRappersByCategoryCard";

const RapperStatsAnalytics = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="font-ceviche text-rap-gold mb-3 sm:mb-4 font-thin sm:text-6xl text-4xl">
        Rapper Statistics
      </h3>

      {/* Basic Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <RapperAgeCard />
        <CareerLengthCard />
        <AlbumStatsCard />
        <TopCitiesCard />
      </div>

      {/* Top Tags */}
      <TopTagsCard />

      {/* Top Rappers by Category */}
      <TopRappersByCategoryCard />
    </div>
  );
};

export default RapperStatsAnalytics;