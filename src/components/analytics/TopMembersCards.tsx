import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import SmallAvatar from "@/components/avatar/SmallAvatar";
import { AvatarSkeleton, TextSkeleton } from "@/components/ui/skeleton";
import { MessageCircle, Vote, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const TopMembersCards = () => {
  // Top Commenters Query
  const { data: topCommenters, isLoading: loadingCommenters } = useQuery({
    queryKey: ['top-commenters'],
    queryFn: async () => {
      console.log('Fetching top commenters...');
      
      // First get member stats for users with comments
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
        .rpc('get_public_profiles_batch', { profile_user_ids: userIds });
      
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
    }
  });

  // Top Voters Query
  const { data: topVoters, isLoading: loadingVoters } = useQuery({
    queryKey: ['top-voters'],
    queryFn: async () => {
      console.log('Fetching top voters...');
      
      // First get member stats for users with votes
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
        .rpc('get_public_profiles_batch', { profile_user_ids: userIds });
      
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
    }
  });

  // Top Skill Judges Query (most attribute votes)
  const { data: topJudges, isLoading: loadingJudges } = useQuery({
    queryKey: ['top-skill-judges'],
    queryFn: async () => {
      console.log('Fetching top skill judges...');
      
      // Get all votes and count by user
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('user_id');
      
      if (votesError) {
        console.error('Error fetching votes:', votesError);
        throw votesError;
      }
      
      if (!votes || votes.length === 0) {
        console.log('No votes found');
        return [];
      }
      
      console.log(`Found ${votes.length} total votes`);
      
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
      
      console.log('Top skill judges (sorted):', sortedUsers);
      
      if (sortedUsers.length === 0) {
        return [];
      }
      
      // Get user IDs
      const userIds = sortedUsers.map((user: any) => user.user_id);
      console.log('User IDs for judges:', userIds);
      
      // Fetch profiles for these users using the secure batch function
      const { data: profiles, error: profilesError } = await supabase
        .rpc('get_public_profiles_batch', { profile_user_ids: userIds });
      
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
      
      console.log('Merged judges data:', merged);
      return merged;
    }
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
    <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-rap-gold font-kaushan text-lg">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <span className="text-rap-gold/60 font-bold text-sm w-4">{i}</span>
                <AvatarSkeleton size="sm" />
                <div className="flex-1">
                  <TextSkeleton width="w-24" height="h-4" className="mb-1" />
                  <TextSkeleton width="w-16" height="h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map((member: any, index: number) => (
              <div key={member.id || member.user_id} className="flex items-center space-x-3">
                <span className="text-rap-gold font-bold text-sm w-4">
                  {index + 1}
                </span>
                {member.profiles?.username ? (
                  <Link to={`/user/${member.profiles.username}`}>
                    <SmallAvatar
                      avatarUrl={member.profiles?.avatar_url}
                      username={member.profiles?.username || 'Unknown'}
                      size="sm"
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </Link>
                ) : (
                  <SmallAvatar
                    avatarUrl={member.profiles?.avatar_url}
                    username={member.profiles?.username || 'Unknown'}
                    size="sm"
                  />
                )}
                <div className="flex-1 min-w-0">
                  {member.profiles?.username ? (
                    <Link 
                      to={`/user/${member.profiles.username}`}
                      className="text-rap-platinum font-medium text-sm truncate hover:text-rap-gold transition-colors cursor-pointer block"
                    >
                      {member.profiles.username}
                    </Link>
                  ) : (
                    <p className="text-rap-platinum font-medium text-sm truncate">
                      Unknown User
                    </p>
                  )}
                  <p className="text-rap-gold/70 text-xs">
                    {member[metricKey] || member.vote_count} {metricLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-rap-platinum/60 text-sm text-center py-4">
            No data available
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <MemberCard
        title="Top Commenters"
        icon={MessageCircle}
        data={topCommenters || []}
        isLoading={loadingCommenters}
        metricKey="total_comments"
        metricLabel="comments"
      />
      
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
    </div>
  );
};

export default TopMembersCards;
