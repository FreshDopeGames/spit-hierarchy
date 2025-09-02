import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Users, Vote, MessageCircle, TrendingUp, Music, UserPlus, Crown, Trophy } from "lucide-react";

const StatsOverview = () => {
  const {
    data: stats,
    isLoading
  } = useQuery({
    queryKey: ["site-stats"],
    queryFn: async () => {
      // Get total members (registered users) using secure function
      const {
        data: totalMembers
      } = await supabase.rpc("get_total_member_count");

      // Get total votes
      const {
        count: totalVotes
      } = await supabase.from("votes").select("*", {
        count: "exact",
        head: true
      });

      // Get total comments
      const {
        count: totalComments
      } = await supabase.from("comments").select("*", {
        count: "exact",
        head: true
      });

      // Get total rappers
      const {
        count: totalRappers
      } = await supabase.from("rappers").select("*", {
        count: "exact",
        head: true
      });

      // Get top rated rapper
      const {
        data: topRapper
      } = await supabase.from("rappers").select("name, average_rating").gt("total_votes", 0).order("average_rating", {
        ascending: false
      }).limit(1).single();

      // Get newest member using admin search function
      const {
        data: adminProfiles
      } = await supabase.rpc('search_profiles_admin', {
        search_term: ''
      });
      const newestMember = adminProfiles?.[0];

      // Get top commenter
      const {
        data: topCommenter
      } = await supabase.from("member_stats").select("id, total_comments").gt("total_comments", 0).order("total_comments", {
        ascending: false
      }).limit(1).single();
      let topCommenterName = "N/A";
      if (topCommenter) {
        const {
          data: commenterProfile
        } = await supabase.rpc('get_public_profile_minimal', {
          profile_user_id: topCommenter.id
        });
        topCommenterName = commenterProfile?.[0]?.username || "N/A";
      }

      // Get top voter
      const {
        data: topVoter
      } = await supabase.from("member_stats").select("id, total_votes").gt("total_votes", 0).order("total_votes", {
        ascending: false
      }).limit(1).single();
      let topVoterName = "N/A";
      if (topVoter) {
        const {
          data: voterProfile
        } = await supabase.rpc('get_public_profile_minimal', {
          profile_user_id: topVoter.id
        });
        topVoterName = voterProfile?.[0]?.username || "N/A";
      }
      return {
        totalMembers: totalMembers || 0,
        totalVotes: totalVotes || 0,
        totalComments: totalComments || 0,
        totalRappers: totalRappers || 0,
        topRapper: topRapper?.name || "N/A",
        newestMember: newestMember?.username || "N/A",
        topCommenter: topCommenterName,
        topVoter: topVoterName
      };
    }
  });
  if (isLoading) {
    return <div className="mb-8 sm:mb-12">
        <div className="text-center mb-6 sm:mb-8 px-4">
          <h2 className="font-ceviche text-primary mb-2 tracking-wider text-4xl sm:text-6xl break-words">
            Site Statistics
          </h2>
          <p className="text-[color:var(--theme-text)] font-[var(--theme-font-body)] text-base sm:text-lg">
            Numbers from the community
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({
          length: 8
        }).map((_, i) => <ThemedCard key={i} className="animate-pulse">
              <ThemedCardContent className="p-3 sm:p-4">
                <div className="h-12 sm:h-16 bg-[var(--theme-backgroundLight)] rounded"></div>
              </ThemedCardContent>
            </ThemedCard>)}
        </div>
      </div>;
  }
  const statCards = [{
    icon: Music,
    label: "Rappers",
    value: stats?.totalRappers || 0,
    color: "from-[var(--theme-primary)] to-[var(--theme-primaryLight)]"
  }, {
    icon: Users,
    label: "Members",
    value: stats?.totalMembers || 0,
    color: "from-[var(--theme-primary)] to-[var(--theme-primaryLight)]"
  }, {
    icon: Vote,
    label: "Total Votes",
    value: stats?.totalVotes || 0,
    color: "from-[var(--theme-primary)] to-[var(--theme-primaryLight)]"
  }, {
    icon: Trophy,
    label: "Top Voter",
    value: stats?.topVoter || "N/A",
    color: "from-[var(--theme-primary)] to-[var(--theme-primaryLight)]"
  }, {
    icon: TrendingUp,
    label: "Top Rated",
    value: stats?.topRapper || "N/A",
    color: "from-[var(--theme-primary)] to-[var(--theme-primaryLight)]"
  }, {
    icon: MessageCircle,
    label: "Comments",
    value: stats?.totalComments || 0,
    color: "from-[var(--theme-primary)] to-[var(--theme-primaryLight)]"
  }, {
    icon: Crown,
    label: "Top Commenter",
    value: stats?.topCommenter || "N/A",
    color: "from-[var(--theme-primary)] to-[var(--theme-primaryLight)]"
  }, {
    icon: UserPlus,
    label: "Newest Member",
    value: stats?.newestMember || "N/A",
    color: "from-[var(--theme-primary)] to-[var(--theme-primaryLight)]"
  }];
  return <div className="mb-8 sm:mb-12">
      <div className="text-center mb-6 sm:mb-8 px-4">
        <h2 className="font-ceviche text-primary mb-2 tracking-wider text-4xl sm:text-6xl break-words">
          Site Statistics
        </h2>
        <p className="text-[color:var(--theme-text)] font-[var(--theme-font-body)] text-base sm:text-lg">
          Numbers from the community
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => <ThemedCard key={index} className="hover:border-[color:var(--theme-primary)]/70 transition-all duration-300 hover:transform hover:scale-105 shadow-lg shadow-[color:var(--theme-primary)]/20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--theme-primary)]"></div>
            <ThemedCardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 bg-gradient-to-br from-primary to-primary/80">
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--theme-textInverted))]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-[var(--theme-font-body)] tracking-wide text-[color:var(--theme-text)] truncate">{stat.label}</p>
                  <p className="text-sm sm:text-base font-[var(--theme-font-body)] font-extrabold text-[color:var(--theme-primaryLight)] break-words">{stat.value}</p>
                </div>
              </div>
            </ThemedCardContent>
          </ThemedCard>)}
      </div>
    </div>;
};
export default StatsOverview;
