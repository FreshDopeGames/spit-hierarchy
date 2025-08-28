
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import { Mic, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import RapperCard from "./RapperCard";

type Rapper = Tables<"rappers">;

interface RankingItem {
  position: number;
  reason: string;
  rapper: Rapper | null;
}

const LyricalMastersSection = () => {
  const { data: lyricalMasters, isLoading } = useQuery({
    queryKey: ["lyrical-masters"],
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
          .eq("slug", "lyrical-masters")
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
            <Mic className="w-6 h-6 text-[color:var(--theme-secondary)]" />
            <h2 className="text-3xl font-[var(--theme-font-heading)] text-[color:var(--theme-secondary)] mb-0 animate-text-glow tracking-wider">
              Lyrical Masters
            </h2>
            <Crown className="w-6 h-6 text-[color:var(--theme-secondary)]" />
          </div>
          <p className="text-[color:var(--theme-text)] font-[var(--theme-font-body)] text-lg">
            The supreme wordsmiths of hip-hop
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
  const validLyricalMasters = lyricalMasters?.filter(item => item.rapper !== null) || [];

  if (validLyricalMasters.length === 0) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mic className="w-6 h-6 text-[color:var(--theme-secondary)]" />
            <h2 className="text-3xl font-[var(--theme-font-heading)] text-[color:var(--theme-secondary)] mb-0 animate-text-glow tracking-wider text-border">
              Lyrical Masters
            </h2>
            <Crown className="w-6 h-6 text-[color:var(--theme-secondary)]" />
          </div>
          <p className="text-[color:var(--theme-text)] font-[var(--theme-font-body)] text-lg">
            The supreme wordsmiths of hip-hop
          </p>
        </div>
        <ThemedCard className="shadow-2xl shadow-[color:var(--theme-secondary)]/20">
          <ThemedCardContent className="p-8 text-center">
            <Mic className="w-16 h-16 text-[color:var(--theme-secondary)] mx-auto mb-4" />
            <p className="text-[color:var(--theme-textMuted)] font-[var(--theme-font-body)]">The lyrical legends await their crowning.</p>
          </ThemedCardContent>
        </ThemedCard>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Mic className="w-6 h-6 text-[color:var(--theme-secondary)]" />
          <h2 className="text-3xl font-[var(--theme-font-heading)] text-[color:var(--theme-secondary)] mb-0 animate-text-glow tracking-wider">
            Lyrical Masters
          </h2>
          <Crown className="w-6 h-6 text-[color:var(--theme-secondary)]" />
        </div>
        <p className="text-[color:var(--theme-text)] font-[var(--theme-font-body)] text-lg">
          The supreme wordsmiths of hip-hop
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {validLyricalMasters.map(item => (
          <RapperCard 
            key={item.rapper!.id} 
            rapper={item.rapper!} 
            position={item.position} 
            compact={true} 
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/rankings/official/lyrical-masters">
          <ThemedButton variant="secondary" size="lg" className="shadow-xl shadow-[color:var(--theme-secondary)]/40">
            View Complete Lyrical Masters List
          </ThemedButton>
        </Link>
      </div>
    </div>
  );
};

export default LyricalMastersSection;
