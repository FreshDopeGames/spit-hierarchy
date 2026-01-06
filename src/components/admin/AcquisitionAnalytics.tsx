import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Target, Globe, Calendar, RefreshCw } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface AcquisitionSource {
  source: string;
  medium: string;
  signup_count: number;
}

interface CampaignPerformance {
  campaign: string;
  source: string;
  medium: string;
  signup_count: number;
  first_signup: string;
  last_signup: string;
}

interface DailySignup {
  signup_date: string;
  source: string;
  signup_count: number;
}

const AcquisitionAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');
  
  const startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: sourceData, isLoading: sourcesLoading, refetch: refetchSources } = useQuery({
    queryKey: ['acquisition-sources', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_acquisition_by_source', {
        start_date: startDate,
        end_date: endDate
      });
      if (error) throw error;
      return data as AcquisitionSource[];
    }
  });

  const { data: campaignData, isLoading: campaignsLoading, refetch: refetchCampaigns } = useQuery({
    queryKey: ['campaign-performance', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_campaign_performance', {
        start_date: startDate,
        end_date: endDate
      });
      if (error) throw error;
      return data as CampaignPerformance[];
    }
  });

  const { data: dailyData, isLoading: dailyLoading, refetch: refetchDaily } = useQuery({
    queryKey: ['daily-signups', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_signups_by_source', {
        start_date: startDate,
        end_date: endDate
      });
      if (error) throw error;
      return data as DailySignup[];
    }
  });

  const totalSignups = sourceData?.reduce((sum, s) => sum + Number(s.signup_count), 0) || 0;
  const topSource = sourceData?.[0];

  const handleRefresh = () => {
    refetchSources();
    refetchCampaigns();
    refetchDaily();
  };

  const getSourceColor = (source: string): string => {
    const colors: Record<string, string> = {
      'tiktok': 'bg-pink-500',
      'instagram': 'bg-purple-500',
      'linkedin': 'bg-blue-600',
      'twitter': 'bg-sky-500',
      'facebook': 'bg-blue-500',
      'youtube': 'bg-red-500',
      'google': 'bg-green-500',
      'reddit': 'bg-orange-500',
      'discord': 'bg-indigo-500',
      'direct': 'bg-gray-500',
    };
    return colors[source.toLowerCase()] || 'bg-[var(--theme-primary)]';
  };

  return (
    <div className="space-y-6">
      {/* Header with date filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--theme-text)] font-[var(--theme-font-heading)]">
            Acquisition Analytics
          </h2>
          <p className="text-[var(--theme-textMuted)]">
            Track where your users are coming from
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--theme-bg)]/50 rounded-lg p-1">
            {(['7', '30', '90'] as const).map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateRange === days
                    ? 'bg-[var(--theme-primary)] text-[var(--theme-text)]'
                    : 'text-[var(--theme-textMuted)] hover:text-[var(--theme-text)]'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-[var(--theme-textMuted)]/20"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[var(--theme-card)] border-[var(--theme-textMuted)]/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-[var(--theme-textMuted)]">Total Signups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--theme-primary)]" />
              <span className="text-3xl font-bold text-[var(--theme-text)]">
                {sourcesLoading ? '...' : totalSignups}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--theme-card)] border-[var(--theme-textMuted)]/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-[var(--theme-textMuted)]">Top Source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--theme-primary)]" />
              <span className="text-3xl font-bold text-[var(--theme-text)] capitalize">
                {sourcesLoading ? '...' : (topSource?.source || 'N/A')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--theme-card)] border-[var(--theme-textMuted)]/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-[var(--theme-textMuted)]">Active Campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[var(--theme-primary)]" />
              <span className="text-3xl font-bold text-[var(--theme-text)]">
                {campaignsLoading ? '...' : campaignData?.filter(c => c.campaign !== 'none').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Breakdown */}
      <Card className="bg-[var(--theme-card)] border-[var(--theme-textMuted)]/20">
        <CardHeader>
          <CardTitle className="text-[var(--theme-text)] font-[var(--theme-font-heading)] flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Signups by Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sourcesLoading ? (
            <div className="text-[var(--theme-textMuted)]">Loading...</div>
          ) : sourceData && sourceData.length > 0 ? (
            <div className="space-y-3">
              {sourceData.map((item, index) => {
                const percentage = totalSignups > 0 ? (Number(item.signup_count) / totalSignups) * 100 : 0;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${getSourceColor(item.source)}`} />
                        <span className="text-[var(--theme-text)] capitalize">{item.source}</span>
                        <span className="text-[var(--theme-textMuted)] text-sm">({item.medium})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--theme-text)] font-medium">{item.signup_count}</span>
                        <span className="text-[var(--theme-textMuted)] text-sm">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-[var(--theme-bg)] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getSourceColor(item.source)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--theme-textMuted)]">
              <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No signups in this period</p>
              <p className="text-sm mt-1">Share your UTM-tagged links to start tracking!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Performance */}
      <Card className="bg-[var(--theme-card)] border-[var(--theme-textMuted)]/20">
        <CardHeader>
          <CardTitle className="text-[var(--theme-text)] font-[var(--theme-font-heading)] flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="text-[var(--theme-textMuted)]">Loading...</div>
          ) : campaignData && campaignData.filter(c => c.campaign !== 'none').length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--theme-textMuted)]/20">
                    <th className="text-left py-2 text-[var(--theme-textMuted)] font-medium">Campaign</th>
                    <th className="text-left py-2 text-[var(--theme-textMuted)] font-medium">Source</th>
                    <th className="text-right py-2 text-[var(--theme-textMuted)] font-medium">Signups</th>
                    <th className="text-right py-2 text-[var(--theme-textMuted)] font-medium hidden sm:table-cell">First</th>
                    <th className="text-right py-2 text-[var(--theme-textMuted)] font-medium hidden sm:table-cell">Last</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignData
                    .filter(c => c.campaign !== 'none')
                    .map((campaign, index) => (
                      <tr key={index} className="border-b border-[var(--theme-textMuted)]/10">
                        <td className="py-3 text-[var(--theme-text)]">{campaign.campaign}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${getSourceColor(campaign.source)}`} />
                            <span className="text-[var(--theme-text)] capitalize">{campaign.source}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-[var(--theme-text)] font-medium">{campaign.signup_count}</td>
                        <td className="py-3 text-right text-[var(--theme-textMuted)] text-sm hidden sm:table-cell">
                          {format(new Date(campaign.first_signup), 'MMM d')}
                        </td>
                        <td className="py-3 text-right text-[var(--theme-textMuted)] text-sm hidden sm:table-cell">
                          {format(new Date(campaign.last_signup), 'MMM d')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--theme-textMuted)]">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No campaign data yet</p>
              <p className="text-sm mt-1">Use utm_campaign parameter to track campaigns</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Signups */}
      <Card className="bg-[var(--theme-card)] border-[var(--theme-textMuted)]/20">
        <CardHeader>
          <CardTitle className="text-[var(--theme-text)] font-[var(--theme-font-heading)] flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Daily Signups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyLoading ? (
            <div className="text-[var(--theme-textMuted)]">Loading...</div>
          ) : dailyData && dailyData.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dailyData.slice(0, 20).map((day, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 px-3 bg-[var(--theme-bg)]/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--theme-textMuted)] text-sm">
                      {format(new Date(day.signup_date), 'MMM d, yyyy')}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${getSourceColor(day.source)}`} />
                      <span className="text-[var(--theme-text)] capitalize">{day.source}</span>
                    </div>
                  </div>
                  <span className="text-[var(--theme-text)] font-medium">{day.signup_count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--theme-textMuted)]">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No daily data yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* UTM Builder Helper */}
      <Card className="bg-[var(--theme-card)] border-[var(--theme-textMuted)]/20">
        <CardHeader>
          <CardTitle className="text-[var(--theme-text)] font-[var(--theme-font-heading)]">
            Quick UTM Link Examples
          </CardTitle>
          <CardDescription className="text-[var(--theme-textMuted)]">
            Use these URL formats for your marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 font-mono text-sm">
            <div className="p-3 bg-[var(--theme-bg)]/50 rounded-lg overflow-x-auto">
              <p className="text-[var(--theme-textMuted)] mb-1">TikTok:</p>
              <code className="text-[var(--theme-primary)] break-all">
                {window.location.origin}/?utm_source=tiktok&utm_medium=social&utm_campaign=puppet_podcast
              </code>
            </div>
            <div className="p-3 bg-[var(--theme-bg)]/50 rounded-lg overflow-x-auto">
              <p className="text-[var(--theme-textMuted)] mb-1">Instagram:</p>
              <code className="text-[var(--theme-primary)] break-all">
                {window.location.origin}/?utm_source=instagram&utm_medium=social&utm_campaign=puppet_podcast
              </code>
            </div>
            <div className="p-3 bg-[var(--theme-bg)]/50 rounded-lg overflow-x-auto">
              <p className="text-[var(--theme-textMuted)] mb-1">LinkedIn:</p>
              <code className="text-[var(--theme-primary)] break-all">
                {window.location.origin}/?utm_source=linkedin&utm_medium=social&utm_campaign=professional_launch
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcquisitionAnalytics;
