
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SmallAvatar from "@/components/avatar/SmallAvatar";
import { AvatarSkeleton, TextSkeleton } from "@/components/ui/skeleton";
import { MessageCircle, Vote, Trophy } from "lucide-react";

const TopMembersCards = () => {
  // Top Commenters Query
  const { data: topCommenters, isLoading: loadingCommenters } = useQuery({
    queryKey: ['top-commenters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_stats')
        .select(`
          id,
          total_comments,
          profiles!inner (
            username,
            avatar_url
          )
        `)
        .gt('total_comments', 0)
        .order('total_comments', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  // Top Voters Query
  const { data: topVoters, isLoading: loadingVoters } = useQuery({
    queryKey: ['top-voters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_stats')
        .select(`
          id,
          total_votes,
          profiles!inner (
            username,
            avatar_url
          )
        `)
        .gt('total_votes', 0)
        .order('total_votes', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  // Top Skill Judges Query (most attribute votes)
  const { data: topJudges, isLoading: loadingJudges } = useQuery({
    queryKey: ['top-skill-judges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          user_id,
          profiles!inner (
            username,
            avatar_url
          )
        `);
      
      if (error) throw error;
      
      // Group by user and count votes
      const userVoteCounts = data.reduce((acc: any, vote: any) => {
        const userId = vote.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            vote_count: 0,
            profiles: vote.profiles
          };
        }
        acc[userId].vote_count++;
        return acc;
      }, {});

      // Convert to array and sort
      return Object.values(userVoteCounts)
        .sort((a: any, b: any) => b.vote_count - a.vote_count)
        .slice(0, 5);
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
                <SmallAvatar
                  avatarUrl={member.profiles?.avatar_url}
                  username={member.profiles?.username || 'Unknown'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-rap-platinum font-medium text-sm truncate">
                    {member.profiles?.username || 'Unknown User'}
                  </p>
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
