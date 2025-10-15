import { useState } from "react";
import TopMembersCards from "./TopMembersCards";
import { ThemedButton } from "@/components/ui/themed-button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const MemberAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'all' | 'week'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info("Refreshing member stats...");
    
    // Trigger refresh through the exposed function
    if ((window as any).__memberStatsRefresh) {
      (window as any).__memberStatsRefresh();
    }
    
    // Reset loading state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Member stats refreshed!");
    }, 1000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="font-ceviche text-primary text-4xl sm:text-6xl">
          Community Members
        </h3>
        
        <div className="flex gap-2 flex-wrap">
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
          <ThemedButton
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </ThemedButton>
        </div>
      </div>

      <TopMembersCards timeRange={timeRange} onRefresh={handleRefresh} />
    </div>
  );
};

export default MemberAnalytics;
