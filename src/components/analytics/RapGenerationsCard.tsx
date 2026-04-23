import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Music2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const DECADE_COLORS: Record<string, string> = {
  '1970s': '#FF6B35',
  '1980s': '#E91E63',
  '1990s': '#9C27B0',
  '2000s': '#2196F3',
  '2010s': '#00BCD4',
  '2020s': '#4CAF50',
};

const RapGenerationsCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["rap-generations-stats"],
    queryFn: async () => {
      const [rappersCount, careerData] = await Promise.all([
        supabase.from("rappers").select("*", { count: "exact", head: true }),
        supabase.from("rappers")
          .select("career_start_year")
          .not("career_start_year", "is", null),
      ]);

      const decadeCounts: Record<string, number> = {};
      careerData.data?.forEach((r) => {
        const year = r.career_start_year as number;
        const decade = `${Math.floor(year / 10) * 10}s`;
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      });
      const decadeBreakdown = Object.entries(decadeCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return {
        total: rappersCount.count || 0,
        decadeBreakdown,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="min-h-[300px] bg-black border-4 border-[hsl(var(--theme-primary))] rounded-xl animate-pulse" />
    );
  }

  return (
    <div className="bg-black border-4 border-[hsl(var(--theme-primary))] rounded-xl p-6 sm:p-8 shadow-2xl shadow-[hsl(var(--theme-primary))]/30 hover:shadow-[hsl(var(--theme-primary))]/50 transition-all duration-300 min-h-[300px] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-primaryLight))] flex items-center justify-center shadow-lg">
          <Music2 className="w-6 h-6 text-black" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
          Rap Generations
        </h3>
      </div>
      <div className="text-5xl sm:text-6xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] mb-2 text-center">
        {data?.total || 0}
      </div>
      <p className="text-sm text-[hsl(var(--theme-textMuted))] text-center mb-4 font-medium">Rappers By Career Start</p>
      {data?.decadeBreakdown && data.decadeBreakdown.length > 0 && (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart style={{ pointerEvents: 'none' }}>
              <Pie
                data={data.decadeBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                stroke="none"
                isAnimationActive={true}
                activeShape={() => null}
              >
                {data.decadeBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={DECADE_COLORS[entry.name] || '#6B7280'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2">
            {data.decadeBreakdown.map((entry) => (
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
  );
};

export default RapGenerationsCard;
