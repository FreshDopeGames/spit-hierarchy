import { useState } from "react";
import TopMembersCards from "./TopMembersCards";
import { ThemedButton } from "@/components/ui/themed-button";
import GeographicFilter, { GeoFilter } from "./GeographicFilter";

const MemberAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'all' | 'week'>('all');
  const [geoFilter, setGeoFilter] = useState<GeoFilter>({ countryCode: null, region: null });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <h3 className="font-ceviche text-primary text-4xl sm:text-6xl break-words max-w-full leading-tight">
          Community Members
        </h3>
        
        <div className="flex flex-wrap items-center gap-2">
          <GeographicFilter value={geoFilter} onChange={setGeoFilter} />
          <div className="flex gap-2">
            <ThemedButton
              variant="outline"
              size="sm"
              onClick={() => setTimeRange('all')}
              className={timeRange === 'all' ? 'bg-[hsl(var(--theme-primary))] text-black hover:bg-[hsl(var(--theme-primary))]/90' : ''}
            >
              All Time
            </ThemedButton>
            <ThemedButton
              variant="outline"
              size="sm"
              onClick={() => setTimeRange('week')}
              className={timeRange === 'week' ? 'bg-[hsl(var(--theme-primary))] text-black hover:bg-[hsl(var(--theme-primary))]/90' : ''}
            >
              This Week
            </ThemedButton>
          </div>
        </div>
      </div>

      <TopMembersCards timeRange={timeRange} countryCode={geoFilter.countryCode} region={geoFilter.region} />
    </div>
  );
};

export default MemberAnalytics;
