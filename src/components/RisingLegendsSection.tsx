import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import { TrendingUp, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import RapperCard from "./RapperCard";

type Rapper = Tables<"rappers">;

interface RankingItem {
  position: number;
  reason: string;
  rapper: Rapper | null;
}

const RisingLegendsSection = () => {
  const { data: risingLegends, isLoading } = useQuery({
    queryKey: ["rising-legends-2024"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ranking_items")
        .select(`
          position,
          reason,
          rapper:rappers (*)
        `)
        .eq("ranking_id", (await supabase
          .from("official_rankings")
          .select("id")
          .eq("slug", "rising-legends-2024")
          .single()).data?.id)
        .eq("is_ranked", true) // Only get manually ranked items
        .order("position", { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data as RankingItem[];
    }
  });

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-[color:var(--theme-accent)]" />
            <h2 className="text-3xl font-[var(--theme-font-heading)] text-[color:var(--theme-accent)] mb-0 animate-text-glow tracking-wider">
              Rising Legends of 2024
            </h2>
            <Crown className="w-6 h-6 text-[color:var(--theme-accent)]" />
          </div>
          <p className="text-[color:var(--theme-text)] font-[var(--theme-font-body)] text-lg">
            The next generation ascending to greatness
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <ThemedCard key={i} className="animate-pulse">
              <ThemedCardContent className="p-4">
                <div className="h-32 bg-[var(--theme-backgroundLight)] rounded-lg mb-3"></div>
                <div className="h-3 bg-[var(--theme-backgroundLight)] rounded mb-2"></div>
                <div className="h-2 bg-[var(--theme-backgroundLight)] rounded w-2/3"></div>
              </ThemedCardContent>
            </ThemedCard>
          ))}
        </div>
      </div>
    );
  }

  // Filter out items where rapper is null to prevent errors
  const validRisingLegends = risingLegends?.filter(item => item.rapper !== null) || [];

  if (validRisingLegends.length === 0) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-[color:var(--theme-accent)]" />
            <h2 className="text-3xl font-[var(--theme-font-heading)] text-[color:var(--theme-accent)] mb-0 animate-text-glow tracking-wider text-border">
              Rising Legends of 2025
            </h2>
            <Crown className="w-6 h-6 text-[color:var(--theme-accent)]" />
          </div>
          <p className="text-[color:var(--theme-text)] font-[var(--theme-font-body)] text-lg">
            The next generation ascending to greatness
          </p>
        </div>
        <ThemedCard className="shadow-2xl shadow-[color:var(--theme-accent)]/20">
          <ThemedCardContent className="p-8 text-center">
            <TrendingUp className="w-16 h-16 text-[color:var(--theme-accent)] mx-auto mb-4" />
            <p className="text-[color:var(--theme-textMuted)] font-[var(--theme-font-body)]">The rising stars are yet to be crowned.</p>
          </ThemedCardContent>
        </ThemedCard>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-[color:var(--theme-accent)]" />
          <h2 className="text-3xl font-[var(--theme-font-heading)] text-[color:var(--theme-accent)] mb-0 animate-text-glow tracking-wider">
            Rising Legends of 2024
          </h2>
          <Crown className="w-6 h-6 text-[color:var(--theme-accent)]" />
        </div>
        <p className="text-[color:var(--theme-text)] font-[var(--theme-font-body)] text-lg">
          The next generation ascending to greatness
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {validRisingLegends.map(item => (
          <RapperCard 
            key={item.rapper!.id} 
            rapper={item.rapper!} 
            position={item.position} 
            compact={true} 
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/rankings/official/rising-legends-2024">
          <ThemedButton variant="accent" size="lg" className="shadow-xl shadow-[color:var(--theme-accent)]/40">
            View Complete Rising Legends List
          </ThemedButton>
        </Link>
      </div>
    </div>
  );
};

export default RisingLegendsSection;
