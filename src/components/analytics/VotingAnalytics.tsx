import { useState } from "react";
import GlobalStatsCards from "./GlobalStatsCards";
import CategoryPerformanceCard from "./CategoryPerformanceCard";
import TopVotedRappersCard from "./TopVotedRappersCard";
import MostRatedRappersCard from "./MostRatedRappersCard";
import GeographicFilter, { GeoFilter } from "./GeographicFilter";

const VotingAnalytics = () => {
  const [geoFilter, setGeoFilter] = useState<GeoFilter>({ countryCode: null, region: null });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="font-ceviche text-primary mb-3 sm:mb-4 text-4xl sm:text-6xl">
          Platform Analytics
        </h3>
        <GeographicFilter value={geoFilter} onChange={setGeoFilter} />
      </div>

      <GlobalStatsCards countryCode={geoFilter.countryCode} region={geoFilter.region} />
      <CategoryPerformanceCard countryCode={geoFilter.countryCode} region={geoFilter.region} />
      <TopVotedRappersCard countryCode={geoFilter.countryCode} region={geoFilter.region} />
      <MostRatedRappersCard countryCode={geoFilter.countryCode} region={geoFilter.region} />
    </div>
  );
};

export default VotingAnalytics;
