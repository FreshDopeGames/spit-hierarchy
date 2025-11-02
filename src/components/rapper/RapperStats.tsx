import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Tables } from "@/integrations/supabase/types";
import { formatNumber } from "@/utils/numberFormatter";
import { useRapperRatingCount } from "@/hooks/useRapperRatingCount";

type Rapper = Tables<"rappers">;

interface RapperStatsProps {
  rapper: Rapper;
}

const RapperStats = ({ rapper }: RapperStatsProps) => {
  const { data: ratingCount, isLoading } = useRapperRatingCount(rapper.id);
  
  return (
    <Card className="bg-black border-4 border-[hsl(var(--theme-primary))]">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-4 font-[var(--theme-fontPrimary)]">Community Stats</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--theme-primary)] mb-2 font-[var(--theme-fontPrimary)]">
              {isLoading ? "—" : formatNumber(ratingCount || 0)}
            </div>
            <div className="text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)]">Member Ratings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--theme-accent)] mb-2 font-[var(--theme-fontPrimary)]">
              {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
            </div>
            <div className="text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)]">Average Rating</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperStats;
