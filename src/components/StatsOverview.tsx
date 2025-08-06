
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Vote, MessageCircle, TrendingUp, Music, UserPlus, Crown, Trophy } from "lucide-react";

const StatsOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["site-stats"],
    queryFn: async () => {
      // Get total members (registered users)
      const { count: totalMembers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get total votes
      const { count: totalVotes } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true });

      // Get total comments
      const { count: totalComments } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true });

      // Get total rappers
      const { count: totalRappers } = await supabase
        .from("rappers")
        .select("*", { count: "exact", head: true });

      // Get top rated rapper
      const { data: topRapper } = await supabase
        .from("rappers")
        .select("name, average_rating")
        .gt("total_votes", 0)
        .order("average_rating", { ascending: false })
        .limit(1)
        .single();

      // Get newest member
      const { data: newestMember } = await supabase
        .from("profiles")
        .select("username")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Get top commenter
      const { data: topCommenter } = await supabase
        .from("member_stats")
        .select("id, total_comments")
        .gt("total_comments", 0)
        .order("total_comments", { ascending: false })
        .limit(1)
        .single();

      let topCommenterName = "N/A";
      if (topCommenter) {
        const { data: commenterProfile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", topCommenter.id)
          .single();
        topCommenterName = commenterProfile?.username || "N/A";
      }

      // Get top voter
      const { data: topVoter } = await supabase
        .from("member_stats")
        .select("id, total_votes")
        .gt("total_votes", 0)
        .order("total_votes", { ascending: false })
        .limit(1)
        .single();

      let topVoterName = "N/A";
      if (topVoter) {
        const { data: voterProfile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", topVoter.id)
          .single();
        topVoterName = voterProfile?.username || "N/A";
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
    return (
      <div className="mb-8 sm:mb-12">
        <div className="text-center mb-6 sm:mb-8 px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-ceviche text-rap-gold mb-2 tracking-wider break-words">
            Site Statistics
          </h2>
          <p className="text-rap-platinum font-merienda text-base sm:text-lg">
            Numbers from the community
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-carbon-fiber border-rap-gold/20 animate-pulse">
              <CardContent className="p-3 sm:p-4">
                <div className="h-12 sm:h-16 bg-rap-carbon-light rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Music,
      label: "Rappers",
      value: stats?.totalRappers || 0,
      color: "from-rap-gold to-rap-gold-light"
    },
    {
      icon: Users,
      label: "Members",
      value: stats?.totalMembers || 0,
      color: "from-rap-gold to-rap-gold-light"
    },
    {
      icon: Vote,
      label: "Total Votes",
      value: stats?.totalVotes || 0,
      color: "from-rap-gold to-rap-gold-light"
    },
    {
      icon: Trophy,
      label: "Top Voter",
      value: stats?.topVoter || "N/A",
      color: "from-rap-gold to-rap-gold-light"
    },
    {
      icon: TrendingUp,
      label: "Top Rated",
      value: stats?.topRapper || "N/A",
      color: "from-rap-gold to-rap-gold-light"
    },
    {
      icon: MessageCircle,
      label: "Comments",
      value: stats?.totalComments || 0,
      color: "from-rap-gold to-rap-gold-light"
    },
    {
      icon: Crown,
      label: "Top Commenter",
      value: stats?.topCommenter || "N/A",
      color: "from-rap-gold to-rap-gold-light"
    },
    {
      icon: UserPlus,
      label: "Newest Member",
      value: stats?.newestMember || "N/A",
      color: "from-rap-gold to-rap-gold-light"
    }
  ];

  return (
    <div className="mb-8 sm:mb-12">
      <div className="text-center mb-6 sm:mb-8 px-4">
        <h2 className="font-ceviche text-rap-gold mb-2 tracking-wider text-2xl sm:text-3xl lg:text-5xl break-words">
          Site Statistics
        </h2>
        <p className="text-rap-platinum font-merienda text-base sm:text-lg">
          Numbers from the community
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-carbon-fiber border border-rap-gold/40 hover:border-rap-gold/70 transition-all duration-300 hover:transform hover:scale-105 shadow-lg shadow-rap-gold/20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-rap-gold"></div>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-rap-carbon" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-merienda tracking-wide text-rap-platinum truncate">{stat.label}</p>
                  <p className="text-sm sm:text-base font-merienda font-extrabold text-rap-gold-light break-words">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatsOverview;
