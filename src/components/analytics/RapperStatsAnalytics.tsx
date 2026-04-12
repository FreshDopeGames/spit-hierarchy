import { useState } from "react";
import RapperAgeCard from "./RapperAgeCard";
import TopCitiesCard from "./TopCitiesCard";
import AlbumStatsCard from "./AlbumStatsCard";
import CareerLengthCard from "./CareerLengthCard";
import TopTagsCard from "./TopTagsCard";
import TopRappersByCategoryCard from "./TopRappersByCategoryCard";
import ZodiacDistributionCard from "./ZodiacDistributionCard";
import MostViewedCard from "./MostViewedCard";
import GeographicFilter, { GeoFilter } from "./GeographicFilter";

const RapperStatsAnalytics = () => {
  const [geoFilter, setGeoFilter] = useState<GeoFilter>({ countryCode: null, region: null });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="font-ceviche text-primary mb-3 sm:mb-4 text-4xl sm:text-6xl">
          Rapper Statistics
        </h3>
        <GeographicFilter value={geoFilter} onChange={setGeoFilter} />
      </div>

      <MostViewedCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AlbumStatsCard />
        <TopCitiesCard />
      </div>

      <TopRappersByCategoryCard countryCode={geoFilter.countryCode} region={geoFilter.region} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <RapperAgeCard />
        <CareerLengthCard />
      </div>

      <TopTagsCard />
      <ZodiacDistributionCard />
    </div>
  );
};

export default RapperStatsAnalytics;
