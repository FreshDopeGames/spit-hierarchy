import { useState } from "react";
import TopMembersCards from "./TopMembersCards";
import { ThemedButton } from "@/components/ui/themed-button";

const MemberAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'all' | 'week'>('all');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="font-ceviche text-primary text-4xl sm:text-6xl">
          Community Members
        </h3>
        
        <div className="flex gap-2">
          <ThemedButton
            variant={timeRange === 'all' ? 'gradient' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('all')}
          >
            All Time
          </ThemedButton>
          <ThemedButton
            variant={timeRange === 'week' ? 'gradient' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            This Week
          </ThemedButton>
        </div>
      </div>

      <TopMembersCards timeRange={timeRange} />
    </div>
  );
};

export default MemberAnalytics;
