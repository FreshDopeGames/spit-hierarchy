import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Music2, Vote, Users, FileText, Star, Trophy, Flame, Heart, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface RapperData {
  id: string;
  name: string;
  slug: string;
  average_rating: number;
  image_url?: string;
  total_votes?: number;
}

interface TaggedRapperData extends RapperData {
  tag_name: string;
  tag_color: string;
}

interface RankingData {
  id: string;
  title: string;
  slug: string;
  vote_count: number;
}

interface MemberData {
  id: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
  stat_value: number;
}

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  likes_count: number;
}

const StatsOverviewRedesigned = () => {
  const getAvatarUrl = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return null;
    
    // If it's already a full URL, return as-is
    if (avatarUrl.startsWith('http')) return avatarUrl;
    
    // Otherwise, construct the Supabase Storage URL with thumb size
    return `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/avatars/${avatarUrl}/thumb.jpg`;
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ["homepage-stats-redesigned"],
    queryFn: async () => {
      // Rappers Section
      const { count: totalRappers } = await supabase
        .from("rappers")
        .select("*", { count: "exact", head: true });

      const { data: topRappers } = await supabase
        .from("rappers")
        .select("id, name, slug, average_rating, image_url")
        .gt("total_votes", 10)
        .order("average_rating", { ascending: false })
        .limit(5);

      // Randomly select one from top 5
      const topRapper = topRappers && topRappers.length > 0
        ? topRappers[Math.floor(Math.random() * topRappers.length)]
        : null;

      // Get random tag
      const { data: allTags } = await supabase
        .from("rapper_tags")
        .select("id, name, color");
      
      const randomTag = allTags?.[Math.floor(Math.random() * (allTags?.length || 1))];

      let topTaggedRapper: TaggedRapperData | null = null;
      if (randomTag) {
        const { data: taggedRappers } = await supabase
          .from("rapper_tag_assignments")
          .select(`
            rappers!inner(id, name, slug, average_rating, image_url, total_votes)
          `)
          .eq("tag_id", randomTag.id);

        const validRappers = taggedRappers
          ?.map(item => item.rappers)
          .filter((r) => r !== null && (r.total_votes ?? 0) > 5)
          .sort((a, b) => (b?.average_rating ?? 0) - (a?.average_rating ?? 0))
          .slice(0, 5); // Take only top 5

        if (validRappers && validRappers.length > 0) {
          // Randomly select one from top 5
          const randomIndex = Math.floor(Math.random() * validRappers.length);
          topTaggedRapper = {
            ...validRappers[randomIndex],
            tag_name: randomTag.name,
            tag_color: randomTag.color,
          };
        }
      }

      // Votes Section
      const { count: totalVotes } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true });

      const { data: rankingVotes } = await supabase
        .from("ranking_votes")
        .select("ranking_id, official_rankings(id, title, slug)");

      const voteCounts: Record<string, { ranking: any; count: number }> = {};
      rankingVotes?.forEach((vote) => {
        const ranking = vote.official_rankings;
        if (ranking && ranking.id) {
          if (!voteCounts[ranking.id]) {
            voteCounts[ranking.id] = { ranking, count: 0 };
          }
          voteCounts[ranking.id].count++;
        }
      });

      const mostActiveRanking = Object.values(voteCounts)
        .sort((a, b) => b.count - a.count)[0] as { ranking: RankingData; count: number } | undefined;

      const { data: topVoter } = await supabase
        .from("member_stats")
        .select("id, total_votes")
        .gt("total_votes", 0)
        .order("total_votes", { ascending: false })
        .limit(1)
        .maybeSingle();

      let topVoterProfile: MemberData | null = null;
      if (topVoter) {
        const { data: voterData } = await supabase
          .rpc("get_public_profile_minimal", {
            profile_user_id: topVoter.id,
          });
        if (voterData?.[0]) {
          topVoterProfile = {
            id: topVoter.id,
            username: voterData[0].username,
            avatar_url: voterData[0].avatar_url,
            stat_value: topVoter.total_votes,
          };
        }
      }

      // Members Section
      const { data: totalMembersCount } = await supabase.rpc("get_total_member_count");

      const { data: newestMemberData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();


      // Query to get user with most achievements using secure RPC
      const { data: topAchiever } = await supabase
        .rpc('get_member_with_most_achievements')
        .maybeSingle();

      let mostAchievementsProfile: MemberData | null = null;
      if (topAchiever) {
        mostAchievementsProfile = {
          id: topAchiever.id,
          username: topAchiever.username,
          avatar_url: topAchiever.avatar_url,
          stat_value: topAchiever.achievement_count,
        };
      }

      // Blog Section
      const { count: totalBlogPosts } = await supabase
        .from("blog_posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

      const { data: mostLikedPost } = await supabase
        .from("blog_posts")
        .select("id, title, slug, likes_count")
        .eq("status", "published")
        .order("likes_count", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        rappers: {
          total: totalRappers || 0,
          topOverall: topRapper,
          topTagged: topTaggedRapper,
        },
        votes: {
          total: totalVotes || 0,
          mostActiveRanking: mostActiveRanking ? {
            ...mostActiveRanking.ranking,
            vote_count: mostActiveRanking.count,
          } : null,
          topVoter: topVoterProfile,
        },
        members: {
          total: totalMembersCount || 0,
          newest: newestMemberData,
          mostAchievements: mostAchievementsProfile,
        },
        blog: {
          total: totalBlogPosts || 0,
          mostLiked: mostLikedPost,
        },
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="mb-8 sm:mb-12">
        <div className="text-center mb-6 sm:mb-8 px-4">
          <h2 className="font-ceviche text-primary mb-2 tracking-wider text-4xl sm:text-6xl">
            Site Statistics
          </h2>
          <p className="text-[hsl(var(--theme-text))] font-[var(--theme-font-body)] text-base sm:text-lg">
            Real-time community insights
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[300px] bg-black border-4 border-[hsl(var(--theme-primary))] rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const getTimeSince = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  return (
    <div className="mb-8 sm:mb-12">
      <div className="text-center mb-6 sm:mb-8 px-4">
        <h2 className="font-ceviche text-primary mb-2 tracking-wider text-4xl sm:text-6xl">
          Site Statistics
        </h2>
        <p className="text-[hsl(var(--theme-text))] font-[var(--theme-font-body)] text-base sm:text-lg">
          Real-time community insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Rappers Card */}
        <div className="bg-black border-4 border-[hsl(var(--theme-primary))] rounded-xl p-6 sm:p-8 shadow-2xl shadow-[hsl(var(--theme-primary))]/30 hover:shadow-[hsl(var(--theme-primary))]/50 transition-all duration-300 hover:scale-[1.02] min-h-[300px] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-primaryLight))] flex items-center justify-center shadow-lg">
              <Music2 className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
              Rappers
            </h3>
          </div>

          <div className="text-5xl sm:text-6xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] mb-6 text-center">
            {stats?.rappers.total || 0}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
            {stats?.rappers.topOverall && (
              <Link to={`/rapper/${stats.rappers.topOverall.slug}`} className="group">
                <div className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-3 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all">
                  {stats.rappers.topOverall.image_url ? (
                    <img
                      src={stats.rappers.topOverall.image_url}
                      alt={stats.rappers.topOverall.name}
                      className="w-16 h-16 rounded-lg object-cover mb-2 border-2 border-[hsl(var(--theme-primary))]/40 mx-auto"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-primary))]/20 to-[hsl(var(--theme-primaryLight))]/20 mb-2 flex items-center justify-center border-2 border-[hsl(var(--theme-primary))]/40 mx-auto">
                      <Music2 className="w-8 h-8 text-[hsl(var(--theme-primary))]" />
                    </div>
                  )}
                  <p className="text-xs text-[hsl(var(--theme-text))] font-bold truncate group-hover:text-[hsl(var(--theme-primary))] transition-colors text-center">
                    {stats.rappers.topOverall.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1 justify-center">
                    <Star className="w-3 h-3 text-[hsl(var(--theme-primary))]" fill="currentColor" />
                    <span className="text-sm font-bold text-[hsl(var(--theme-primary))]">
                      {stats.rappers.topOverall.average_rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--theme-textMuted))] mt-1 text-center">Top Overall</p>
                </div>
              </Link>
            )}

            {stats?.rappers.topTagged && (
              <Link to={`/rapper/${stats.rappers.topTagged.slug}`} className="group">
                <div className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-3 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all">
                  {stats.rappers.topTagged.image_url ? (
                    <img
                      src={stats.rappers.topTagged.image_url}
                      alt={stats.rappers.topTagged.name}
                      className="w-16 h-16 rounded-lg object-cover mb-2 border-2 border-[hsl(var(--theme-primary))]/40 mx-auto"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-primary))]/20 to-[hsl(var(--theme-primaryLight))]/20 mb-2 flex items-center justify-center border-2 border-[hsl(var(--theme-primary))]/40 mx-auto">
                      <Music2 className="w-8 h-8 text-[hsl(var(--theme-primary))]" />
                    </div>
                  )}
                  <p className="text-xs text-[hsl(var(--theme-text))] font-bold truncate group-hover:text-[hsl(var(--theme-primary))] transition-colors text-center">
                    {stats.rappers.topTagged.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1 justify-center">
                    <Star className="w-3 h-3 text-[hsl(var(--theme-primary))]" fill="currentColor" />
                    <span className="text-sm font-bold text-[hsl(var(--theme-primary))]">
                      {stats.rappers.topTagged.average_rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--theme-textMuted))] mt-1 truncate text-center">
                    Top {stats.rappers.topTagged.tag_name}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Total Votes Card */}
        <div className="bg-black border-4 border-[hsl(var(--theme-primary))] rounded-xl p-6 sm:p-8 shadow-2xl shadow-[hsl(var(--theme-primary))]/30 hover:shadow-[hsl(var(--theme-primary))]/50 transition-all duration-300 hover:scale-[1.02] min-h-[300px] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-accent))] to-[hsl(var(--theme-primary))] flex items-center justify-center shadow-lg">
              <Vote className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
              Total Votes
            </h3>
          </div>

          <div className="text-5xl sm:text-6xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] mb-6 text-center">
            {(stats?.votes.total || 0).toLocaleString()}
          </div>

          <div className="space-y-4 mt-auto">
            {stats?.votes.mostActiveRanking && (
              <Link to={`/rankings/${stats.votes.mostActiveRanking.slug}`} className="block group">
                <div className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-4 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                    <p className="text-sm font-bold text-[hsl(var(--theme-text))] group-hover:text-[hsl(var(--theme-primary))] transition-colors line-clamp-1">
                      {stats.votes.mostActiveRanking.title}
                    </p>
                  </div>
                  <p className="text-xs text-[hsl(var(--theme-textMuted))]">
                    {stats.votes.mostActiveRanking.vote_count.toLocaleString()} votes • Most Active Ranking
                  </p>
                </div>
              </Link>
            )}

            {stats?.votes.topVoter && (
              <Link to={`/user/${stats.votes.topVoter.username}`} className="block group">
                <div className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-4 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all">
                  <div className="flex items-center gap-3">
                    {getAvatarUrl(stats.votes.topVoter.avatar_url) ? (
                      <img
                        src={getAvatarUrl(stats.votes.topVoter.avatar_url)!}
                        alt={stats.votes.topVoter.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[hsl(var(--theme-primary))]/40"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--theme-primary))]/20 to-[hsl(var(--theme-primaryLight))]/20 flex items-center justify-center border-2 border-[hsl(var(--theme-primary))]/40">
                        <Users className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-[hsl(var(--theme-text))] group-hover:text-[hsl(var(--theme-primary))] transition-colors">
                        {stats.votes.topVoter.username}
                      </p>
                      <p className="text-xs text-[hsl(var(--theme-textMuted))]">
                        {stats.votes.topVoter.stat_value.toLocaleString()} votes • Top Voter
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Members Card */}
        <div className="bg-black border-4 border-[hsl(var(--theme-primary))] rounded-xl p-6 sm:p-8 shadow-2xl shadow-[hsl(var(--theme-primary))]/30 hover:shadow-[hsl(var(--theme-primary))]/50 transition-all duration-300 hover:scale-[1.02] min-h-[300px] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-secondary))] to-[hsl(var(--theme-primary))] flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
              Members
            </h3>
          </div>

          <div className="text-5xl sm:text-6xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] mb-6 text-center">
            {(stats?.members.total || 0).toLocaleString()}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
            {stats?.members.newest && (
              <Link to={`/user/${stats.members.newest.username}`} className="group">
                <div className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-3 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all">
                  {getAvatarUrl(stats.members.newest.avatar_url) ? (
                    <img
                      src={getAvatarUrl(stats.members.newest.avatar_url)!}
                      alt={stats.members.newest.username}
                      className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-[hsl(var(--theme-primary))]/40 mx-auto"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--theme-primary))]/20 to-[hsl(var(--theme-primaryLight))]/20 mb-2 flex items-center justify-center border-2 border-[hsl(var(--theme-primary))]/40 mx-auto">
                      <Users className="w-8 h-8 text-[hsl(var(--theme-primary))]" />
                    </div>
                  )}
                  <p className="text-xs text-[hsl(var(--theme-text))] font-bold truncate text-center group-hover:text-[hsl(var(--theme-primary))] transition-colors">
                    {stats.members.newest.username}
                  </p>
                  <p className="text-xs text-[hsl(var(--theme-textMuted))] mt-1 text-center">
                    Joined {getTimeSince(stats.members.newest.created_at)}
                  </p>
                </div>
              </Link>
            )}

            {stats?.members.mostAchievements && (
              <Link to={`/user/${stats.members.mostAchievements.username}`} className="group">
                <div className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-3 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all">
                  {getAvatarUrl(stats.members.mostAchievements.avatar_url) ? (
                    <img
                      src={getAvatarUrl(stats.members.mostAchievements.avatar_url)!}
                      alt={stats.members.mostAchievements.username}
                      className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-[hsl(var(--theme-primary))]/40 mx-auto"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--theme-primary))]/20 to-[hsl(var(--theme-primaryLight))]/20 mb-2 flex items-center justify-center border-2 border-[hsl(var(--theme-primary))]/40 mx-auto">
                      <Trophy className="w-8 h-8 text-[hsl(var(--theme-primary))]" />
                    </div>
                  )}
                  <p className="text-xs text-[hsl(var(--theme-text))] font-bold truncate text-center group-hover:text-[hsl(var(--theme-primary))] transition-colors">
                    {stats.members.mostAchievements.username}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Trophy className="w-3 h-3 text-[hsl(var(--theme-primary))]" />
                    <span className="text-sm font-bold text-[hsl(var(--theme-primary))]">
                      {stats.members.mostAchievements.stat_value}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--theme-textMuted))] mt-1 text-center">Most Achievements</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Slick Talk (Blog) Card */}
        <div className="bg-black border-4 border-[hsl(var(--theme-primary))] rounded-xl p-6 sm:p-8 shadow-2xl shadow-[hsl(var(--theme-primary))]/30 hover:shadow-[hsl(var(--theme-primary))]/50 transition-all duration-300 hover:scale-[1.02] min-h-[300px] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-primaryLight))] to-[hsl(var(--theme-secondary))] flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
              Slick Talk
            </h3>
          </div>

          <div className="text-center mb-6">
            <div className="text-5xl sm:text-6xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
              {stats?.blog.total || 0}
            </div>
            <div className="text-sm text-[hsl(var(--theme-textMuted))] mt-2 font-medium">
              Blog Posts
            </div>
          </div>

          {stats?.blog.mostLiked && (
            <Link to={`/blog/${stats.blog.mostLiked.slug}`} className="mt-auto block group">
              <div className="bg-gradient-to-br from-[hsl(var(--theme-surface))]/40 to-[hsl(var(--theme-surface))]/20 rounded-lg p-4 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-[hsl(var(--theme-primary))] flex-shrink-0 mt-1" />
                  <p className="text-sm font-bold text-[hsl(var(--theme-text))] group-hover:text-[hsl(var(--theme-primary))] transition-colors line-clamp-2">
                    {stats.blog.mostLiked.title}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[hsl(var(--theme-primary))]" fill="currentColor" />
                  <span className="text-sm font-bold text-[hsl(var(--theme-primary))]">
                    {stats.blog.mostLiked.likes_count} likes
                  </span>
                  <span className="text-xs text-[hsl(var(--theme-textMuted))]">• Most Liked Post</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsOverviewRedesigned;
