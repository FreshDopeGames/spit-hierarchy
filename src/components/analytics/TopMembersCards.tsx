import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import SmallAvatar from "@/components/avatar/SmallAvatar";
import { AvatarSkeleton, TextSkeleton } from "@/components/ui/skeleton";
import { MessageCircle, Vote, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

interface TopMembersCardsProps {
  timeRange?: 'all' | 'week';
  onRefresh?: () => void;
}

const TopMembersCards = ({ timeRange = 'all', onRefresh }: TopMembersCardsProps) => {
  // Expose refetch functions to parent via callback
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered for all member stats');
    refetchCommenters();
    refetchVoters();
    refetchJudges();
    onRefresh?.();
  };
  // Top Commenters Query
  const { data: topCommenters, isLoading: loadingCommenters, refetch: refetchCommenters } = useQuery({
    queryKey: ['top-commenters', timeRange],
    queryFn: async () => {
      console.log('Fetching top commenters for timeRange:', timeRange);
      
      if (timeRange === 'week') {
        // For weekly, count from comments table directly
        const { data: comments, error: commentsError } = await supabase
          .from('comments')
          .select('user_id')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
        if (commentsError) throw commentsError;
        if (!comments || comments.length === 0) return [];
        
        // Group by user and count
        const userCommentCounts = comments.reduce((acc: any, comment: any) => {
          const userId = comment.user_id;
          if (!acc[userId]) acc[userId] = { id: userId, total_comments: 0 };
          acc[userId].total_comments++;
          return acc;
        }, {});
        
        const memberStats = Object.values(userCommentCounts)
          .sort((a: any, b: any) => b.total_comments - a.total_comments)
          .slice(0, 5);
        
        const userIds = memberStats.map((stat: any) => stat.id);
        const { data: profiles } = await supabase
          .rpc('get_profiles_for_analytics', { profile_user_ids: userIds });
        
        return memberStats.map((stat: any) => ({
          id: stat.id,
          total_comments: stat.total_comments,
          profiles: profiles?.find(p => p.id === stat.id) || null
        }));
      }
      
      // All-time stats from member_stats
      const { data: memberStats, error: statsError } = await supabase
        .from('member_stats')
        .select('id, total_comments')
        .gt('total_comments', 0)
        .order('total_comments', { ascending: false })
        .limit(5);
      
      if (statsError) {
        console.error('Error fetching member stats:', statsError);
        throw statsError;
      }
      
      if (!memberStats || memberStats.length === 0) {
        console.log('No member stats found');
        return [];
      }
      
      // Get user IDs
      const userIds = memberStats.map(stat => stat.id);
      console.log('User IDs for commenters:', userIds);
      
      // Fetch profiles for these users using the secure batch function
      const { data: profiles, error: profilesError } = await supabase
        .rpc('get_profiles_for_analytics', { profile_user_ids: userIds });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('Profiles found:', profiles);
      
      // Merge the data
      const merged = memberStats.map(stat => ({
        id: stat.id,
        total_comments: stat.total_comments,
        profiles: profiles?.find(p => p.id === stat.id) || null
      }));
      
      console.log('Merged commenters data:', merged);
      return merged;
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Top Voters Query
  const { data: topVoters, isLoading: loadingVoters, refetch: refetchVoters } = useQuery({
    queryKey: ['top-voters', timeRange],
    queryFn: async () => {
      console.log('Fetching top voters for timeRange:', timeRange);
      
      if (timeRange === 'week') {
        // For weekly, count from ranking_votes table directly
        const { data: votes, error: votesError } = await supabase
          .from('ranking_votes')
          .select('user_id, vote_weight')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
        if (votesError) throw votesError;
        if (!votes || votes.length === 0) return [];
        
        // Group by user and sum vote weights
        const userVoteCounts = votes.reduce((acc: any, vote: any) => {
          const userId = vote.user_id;
          if (!acc[userId]) acc[userId] = { id: userId, total_votes: 0 };
          acc[userId].total_votes += vote.vote_weight || 1;
          return acc;
        }, {});
        
        const memberStats = Object.values(userVoteCounts)
          .sort((a: any, b: any) => b.total_votes - a.total_votes)
          .slice(0, 5);
        
        const userIds = memberStats.map((stat: any) => stat.id);
        const { data: profiles } = await supabase
          .rpc('get_profiles_for_analytics', { profile_user_ids: userIds });
        
        return memberStats.map((stat: any) => ({
          id: stat.id,
          total_votes: stat.total_votes,
          profiles: profiles?.find(p => p.id === stat.id) || null
        }));
      }
      
      // All-time stats from member_stats
      const { data: memberStats, error: statsError } = await supabase
        .from('member_stats')
        .select('id, total_votes')
        .gt('total_votes', 0)
        .order('total_votes', { ascending: false })
        .limit(5);
      
      if (statsError) {
        console.error('Error fetching member stats for voters:', statsError);
        throw statsError;
      }
      
      if (!memberStats || memberStats.length === 0) {
        console.log('No member stats found for voters');
        return [];
      }
      
      // Get user IDs
      const userIds = memberStats.map(stat => stat.id);
      console.log('User IDs for voters:', userIds);
      
      // Fetch profiles for these users using the secure batch function
      const { data: profiles, error: profilesError } = await supabase
        .rpc('get_profiles_for_analytics', { profile_user_ids: userIds });
      
      if (profilesError) {
        console.error('Error fetching profiles for voters:', profilesError);
        throw profilesError;
      }
      
      console.log('Profiles found for voters:', profiles);
      
      // Merge the data
      const merged = memberStats.map(stat => ({
        id: stat.id,
        total_votes: stat.total_votes,
        profiles: profiles?.find(p => p.id === stat.id) || null
      }));
      
      console.log('Merged voters data:', merged);
      return merged;
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Top Skill Judges Query (most attribute votes)
  const { data: topJudges, isLoading: loadingJudges, refetch: refetchJudges } = useQuery({
    queryKey: ['top-skill-judges', timeRange],
    queryFn: async () => {
      const queryStartTime = Date.now();
      console.log('🔍 Fetching top skill judges for timeRange:', timeRange, 'at', new Date().toISOString());
      
      // Build query with optional date filter
      let query = supabase.from('votes').select('user_id');
      
      if (timeRange === 'week') {
        query = query.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      }
      
      const { data: votes, error: votesError } = await query;
      
      if (votesError) {
        console.error('Error fetching votes:', votesError);
        throw votesError;
      }
      
      if (!votes || votes.length === 0) {
        console.log('⚠️ No votes found for timeRange:', timeRange);
        return [];
      }
      
      const queryEndTime = Date.now();
      console.log(`✅ Found ${votes.length} total skill votes for ${timeRange} (query took ${queryEndTime - queryStartTime}ms)`);
      
      // Group by user and count votes
      const userVoteCounts = votes.reduce((acc: any, vote: any) => {
        const userId = vote.user_id;
        if (!acc[userId]) {
          acc[userId] = { user_id: userId, vote_count: 0 };
        }
        acc[userId].vote_count++;
        return acc;
      }, {});

      // Convert to array and sort
      const sortedUsers = Object.values(userVoteCounts)
        .sort((a: any, b: any) => b.vote_count - a.vote_count)
        .slice(0, 5);
      
      console.log(`📊 Top skill judges (${timeRange}):`, sortedUsers.map((u: any) => ({
        user_id: u.user_id,
        vote_count: u.vote_count
      })));
      
      if (sortedUsers.length === 0) {
        return [];
      }
      
      // Get user IDs
      const userIds = sortedUsers.map((user: any) => user.user_id);
      console.log('User IDs for judges:', userIds);
      
      // Fetch profiles for these users using the secure batch function
      const { data: profiles, error: profilesError } = await supabase
        .rpc('get_profiles_for_analytics', { profile_user_ids: userIds });
      
      if (profilesError) {
        console.error('Error fetching profiles for judges:', profilesError);
        throw profilesError;
      }
      
      console.log('Profiles found for judges:', profiles);
      
      // Merge the data
      const merged = sortedUsers.map((user: any) => ({
        user_id: user.user_id,
        vote_count: user.vote_count,
        profiles: profiles?.find(p => p.id === user.user_id) || null
      }));
      
      console.log(`✨ Merged judges data (${timeRange}):`, merged.map((m: any) => ({
        username: m.profiles?.username || 'Unknown',
        vote_count: m.vote_count
      })));
      return merged;
    },
    staleTime: 30000, // Cache for 30 seconds only
    gcTime: 60000, // Keep in cache for 1 minute
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const MemberCard = ({ 
    title, 
    icon: Icon, 
    data, 
    isLoading, 
    metricKey, 
    metricLabel 
  }: {
    title: string;
    icon: any;
    data: any[];
    isLoading: boolean;
    metricKey: string;
    metricLabel: string;
  }) => (
    <ThemedCard className="bg-black border-[hsl(var(--theme-primary))] border-4 shadow-lg shadow-[var(--theme-primary)]/20">
      <ThemedCardHeader className="pb-4">
        <ThemedCardTitle className="flex items-center gap-2 text-[hsl(var(--theme-primary))] font-mogra text-xl">
          <Icon className="w-6 h-6" />
          {title}
        </ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <span className="text-[hsl(var(--theme-primary))]/60 font-bold text-base w-6">{i}</span>
                <AvatarSkeleton size="md" />
                <div className="flex-1">
                  <TextSkeleton width="w-32" height="h-5" className="mb-2" />
                  <TextSkeleton width="w-20" height="h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            {data.map((member: any, index: number) => (
              <div key={member.id || member.user_id} className="flex items-center space-x-4">
                <span className="text-[hsl(var(--theme-primary))] font-bold text-base w-6">
                  {index + 1}
                </span>
                {member.profiles?.username ? (
                  <Link to={`/user/${member.profiles.username}`}>
                    <SmallAvatar
                      avatarUrl={member.profiles?.avatar_url}
                      username={member.profiles?.username || 'Unknown'}
                      size="md"
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </Link>
                ) : (
                  <SmallAvatar
                    avatarUrl={member.profiles?.avatar_url}
                    username={member.profiles?.username || 'Unknown'}
                    size="md"
                  />
                )}
                <div className="flex-1 min-w-0">
                  {member.profiles?.username ? (
                    <Link 
                      to={`/user/${member.profiles.username}`}
                      className="text-[hsl(var(--theme-text))] font-semibold text-base truncate hover:text-[hsl(var(--theme-primary))] transition-colors cursor-pointer block"
                    >
                      {member.profiles.username}
                    </Link>
                  ) : (
                    <p className="text-[hsl(var(--theme-text))]/60 font-semibold text-base truncate">
                      Unknown User
                    </p>
                  )}
                  <p className="text-[hsl(var(--theme-text))]/70 text-sm font-medium">
                    {member[metricKey] || member.vote_count} {metricLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[hsl(var(--theme-text))]/60 text-base text-center py-8">
            No data available
          </p>
        )}
      </ThemedCardContent>
    </ThemedCard>
  );

  // Make handleRefresh available if needed by parent component
  React.useEffect(() => {
    if (onRefresh) {
      (window as any).__memberStatsRefresh = handleRefresh;
    }
  }, [onRefresh]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <MemberCard
        title="Top Voters"
        icon={Vote}
        data={topVoters || []}
        isLoading={loadingVoters}
        metricKey="total_votes"
        metricLabel="votes"
      />

      <MemberCard
        title="Top Skill Judges"
        icon={Trophy}
        data={topJudges || []}
        isLoading={loadingJudges}
        metricKey="vote_count"
        metricLabel="skill votes"
      />

      <MemberCard
        title="Top Commenters"
        icon={MessageCircle}
        data={topCommenters || []}
        isLoading={loadingCommenters}
        metricKey="total_comments"
        metricLabel="comments"
      />
    </div>
  );
};

export default TopMembersCards;
