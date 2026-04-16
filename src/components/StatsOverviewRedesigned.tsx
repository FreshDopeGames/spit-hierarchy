import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Music2, Users, FileText, Star, Trophy, Flame, Heart, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

import AnalyticsButton from "@/components/AnalyticsButton";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";

const DECADE_COLORS: Record<string, string> = {
  '1970s': '#FF6B35',
  '1980s': '#E91E63',
  '1990s': '#9C27B0',
  '2000s': '#2196F3',
  '2010s': '#00BCD4',
  '2020s': '#4CAF50',
};

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

  const fetchStats = async () => {
    // PHASE 1: Critical counts (parallel)
    const [
      rappersCount,
      votesCount,
      rankingVotesCount,
      membersCount,
      blogCount
    ] = await Promise.all([
      supabase.from("rappers").select("*", { count: "exact", head: true }),
      supabase.from("votes").select("*", { count: "exact", head: true }),
      supabase.from("ranking_votes").select("*", { count: "exact", head: true }),
      supabase.rpc("get_total_member_count"),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "published")
    ]);

    // PHASE 2: Secondary data (parallel)
    const [
      careerDataResult,
      mostLikedPostResult,
      newestMemberResult,
      topAchieverResult,
      mostRatedRapperResult,
      rankingVotesResult
    ] = await Promise.all([
      supabase.from("rappers")
        .select("career_start_year")
        .not("career_start_year", "is", null),
      supabase.from("blog_posts")
        .select("id, title, slug, likes_count")
        .eq("status", "published")
        .order("likes_count", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("profiles")
        .select("id, username, avatar_url, created_at")
        .not("username", "like", "%@%")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.rpc('get_member_with_most_achievements').maybeSingle(),
      supabase.from("rappers")
        .select("id, name, slug, image_url, total_votes")
        .gt("total_votes", 0)
        .order("total_votes", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("ranking_votes")
        .select("ranking_id, rapper_id, official_rankings(id, title, slug), rappers(id, name, slug, image_url)")
    ]);

    // Process decade breakdown
    const decadeCounts: Record<string, number> = {};
    careerDataResult.data?.forEach((r) => {
      const year = r.career_start_year as number;
      const decade = `${Math.floor(year / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    });
    const decadeBreakdown = Object.entries(decadeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Process ranking votes for most active ranking
    const rankingCounts: Record<string, { ranking: any; count: number }> = {};
    const rapperRankingCounts: Record<string, { rapper: any; count: number }> = {};
    rankingVotesResult.data?.forEach((vote) => {
      const ranking = vote.official_rankings;
      if (ranking && ranking.id) {
        if (!rankingCounts[ranking.id]) {
          rankingCounts[ranking.id] = { ranking, count: 0 };
        }
        rankingCounts[ranking.id].count++;
      }
      const rapper = vote.rappers;
      if (rapper && rapper.id) {
        if (!rapperRankingCounts[rapper.id]) {
          rapperRankingCounts[rapper.id] = { rapper, count: 0 };
        }
        rapperRankingCounts[rapper.id].count++;
      }
    });
    const mostActiveRanking = Object.values(rankingCounts)
      .sort((a, b) => b.count - a.count)[0] as { ranking: RankingData; count: number } | undefined;
    const mostVotedInRankings = Object.values(rapperRankingCounts)
      .sort((a, b) => b.count - a.count)[0] as { rapper: any; count: number } | undefined;

    // Process most achievements profile
    let mostAchievementsProfile: MemberData | null = null;
    if (topAchieverResult.data) {
      mostAchievementsProfile = {
        id: topAchieverResult.data.id,
        username: topAchieverResult.data.username,
        avatar_url: topAchieverResult.data.avatar_url,
        stat_value: topAchieverResult.data.achievement_count,
      };
    }

    return {
      rappers: {
        total: rappersCount.count || 0,
        decadeBreakdown,
      },
      rankings: {
        total: rankingVotesCount.count || 0,
        mostActiveRanking: mostActiveRanking ? {
          ...mostActiveRanking.ranking,
          vote_count: mostActiveRanking.count,
        } : null,
        mostVotedRapper: mostVotedInRankings ? {
          ...mostVotedInRankings.rapper,
          vote_count: mostVotedInRankings.count,
        } : null,
      },
      ratings: {
        total: votesCount.count || 0,
        mostRatedRapper: mostRatedRapperResult.data,
      },
      members: {
        total: membersCount.data || 0,
        newest: newestMemberResult.data,
        mostAchievements: mostAchievementsProfile,
      },
      blog: {
        total: blogCount.count || 0,
        mostLiked: mostLikedPostResult.data,
      },
    };
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ["homepage-stats-redesigned"],
    queryFn: fetchStats,
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
          {Array.from({ length: 5 }).map((_, i) => (
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-primaryLight))] flex items-center justify-center shadow-lg">
              <Music2 className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
              Rappers
            </h3>
          </div>
          <div className="text-5xl sm:text-6xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] mb-2 text-center">
            {stats?.rappers.total || 0}
          </div>
          <p className="text-sm text-[hsl(var(--theme-textMuted))] text-center mb-4 font-medium">By Career Origin Decade</p>
          {stats?.rappers.decadeBreakdown && stats.rappers.decadeBreakdown.length > 0 && (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.rappers.decadeBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.rappers.decadeBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={DECADE_COLORS[entry.name] || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#000',
                      border: '1px solid hsl(var(--theme-primary))',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => [`${value} rappers`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2">
                {stats.rappers.decadeBreakdown.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: DECADE_COLORS[entry.name] || '#6B7280' }}
                    />
                    <span className="text-xs text-[hsl(var(--theme-text))]">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rankings Card */}
        <div className="bg-black border-4 border-[hsl(var(--theme-primary))] rounded-xl p-6 sm:p-8 shadow-2xl shadow-[hsl(var(--theme-primary))]/30 hover:shadow-[hsl(var(--theme-primary))]/50 transition-all duration-300 hover:scale-[1.02] min-h-[300px] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-accent))] to-[hsl(var(--theme-primary))] flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
              Rankings
            </h3>
          </div>

          <div className="text-center mb-6">
            <div className="text-5xl sm:text-6xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
              {(stats?.rankings.total || 0).toLocaleString()}
            </div>
            <div className="text-sm text-[hsl(var(--theme-textMuted))] mt-2 font-medium">
              Ranking Votes
            </div>
          </div>

          <div className="space-y-4 mt-auto">
            {stats?.rankings.mostActiveRanking && (
              <Link to={`/rankings/${stats.rankings.mostActiveRanking.slug}`} className="block group">
                <div className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-4 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Flame className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                    <p className="text-sm font-bold text-[hsl(var(--theme-text))] group-hover:text-[hsl(var(--theme-primary))] transition-colors line-clamp-1">
                      {stats.rankings.mostActiveRanking.title}
                    </p>
                  </div>
                  <p className="text-xs text-[hsl(var(--theme-textMuted))]">
                    {stats.rankings.mostActiveRanking.vote_count.toLocaleString()} votes • Most Active Ranking
                  </p>
                </div>
              </Link>
            )}

            {stats?.rankings.mostVotedRapper && (
              <Link to={`/rapper/${stats.rankings.mostVotedRapper.slug}`} className="block group">
                <div className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-4 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all">
                  <div className="flex items-center gap-3">
                    {stats.rankings.mostVotedRapper.image_url ? (
                      <img
                        src={stats.rankings.mostVotedRapper.image_url}
                        alt={stats.rankings.mostVotedRapper.name}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-[hsl(var(--theme-primary))]/40"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-primary))]/20 to-[hsl(var(--theme-primaryLight))]/20 flex items-center justify-center border-2 border-[hsl(var(--theme-primary))]/40">
                        <Music2 className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-[hsl(var(--theme-text))] group-hover:text-[hsl(var(--theme-primary))] transition-colors">
                        {stats.rankings.mostVotedRapper.name}
                      </p>
                      <p className="text-xs text-[hsl(var(--theme-textMuted))]">
                        {stats.rankings.mostVotedRapper.vote_count.toLocaleString()} votes • Most Voted in Rankings
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Skill Ratings Card */}
        <div className="bg-black border-4 border-[hsl(var(--theme-primary))] rounded-xl p-6 sm:p-8 shadow-2xl shadow-[hsl(var(--theme-primary))]/30 hover:shadow-[hsl(var(--theme-primary))]/50 transition-all duration-300 hover:scale-[1.02] min-h-[300px] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
              Skill Ratings
            </h3>
          </div>

          <div className="text-center mb-6">
            <div className="text-5xl sm:text-6xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
              {(stats?.ratings.total || 0).toLocaleString()}
            </div>
            <div className="text-sm text-[hsl(var(--theme-textMuted))] mt-2 font-medium">
              Individual Ratings
            </div>
          </div>

          {stats?.ratings.mostRatedRapper && (
            <Link to={`/rapper/${stats.ratings.mostRatedRapper.slug}`} className="mt-auto block group">
              <div className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-4 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all">
                <div className="flex items-center gap-3">
                  {stats.ratings.mostRatedRapper.image_url ? (
                    <img
                      src={stats.ratings.mostRatedRapper.image_url}
                      alt={stats.ratings.mostRatedRapper.name}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-[hsl(var(--theme-primary))]/40"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-primary))]/20 to-[hsl(var(--theme-primaryLight))]/20 flex items-center justify-center border-2 border-[hsl(var(--theme-primary))]/40">
                      <Music2 className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--theme-text))] group-hover:text-[hsl(var(--theme-primary))] transition-colors">
                      {stats.ratings.mostRatedRapper.name}
                    </p>
                    <p className="text-xs text-[hsl(var(--theme-textMuted))]">
                      {(stats.ratings.mostRatedRapper.total_votes || 0).toLocaleString()} ratings • Most Rated
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )}
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
                <div className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-3 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all h-full flex flex-col">
                  {getAvatarUrl(stats.members.newest.avatar_url) ? (
                    <img
                      src={getAvatarUrl(stats.members.newest.avatar_url)!}
                      alt={stats.members.newest.username?.includes('@') ? 'New Member' : stats.members.newest.username}
                      className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-[hsl(var(--theme-primary))]/40 mx-auto"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--theme-primary))]/20 to-[hsl(var(--theme-primaryLight))]/20 mb-2 flex items-center justify-center border-2 border-[hsl(var(--theme-primary))]/40 mx-auto">
                      <Users className="w-8 h-8 text-[hsl(var(--theme-primary))]" />
                    </div>
                  )}
                  <p className="text-xs text-[hsl(var(--theme-text))] font-bold truncate text-center group-hover:text-[hsl(var(--theme-primary))] transition-colors">
                    {stats.members.newest.username?.includes('@') ? 'New Member' : stats.members.newest.username}
                  </p>
                  <p className="text-xs text-[hsl(var(--theme-textMuted))] mt-1 text-center">
                    Joined {getTimeSince(stats.members.newest.created_at)}
                  </p>
                </div>
              </Link>
            )}

            {stats?.members.mostAchievements && (
              <Link to={`/user/${stats.members.mostAchievements.username}`} className="group">
                <div className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-3 border border-[hsl(var(--theme-primary))]/20 hover:border-[hsl(var(--theme-primary))]/60 transition-all h-full flex flex-col">
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
        
        {/* Analytics Button - Part of Stats Section */}
        <div className="col-span-1 md:col-span-2 flex justify-center w-full">
          <AnalyticsButton />
        </div>
      </div>
    </div>
  );
};

export default StatsOverviewRedesigned;
