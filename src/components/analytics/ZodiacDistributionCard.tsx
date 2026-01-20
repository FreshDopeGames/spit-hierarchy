import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Star, Shuffle } from "lucide-react";
import { getZodiacName, getAllZodiacSigns } from "@/utils/zodiacUtils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface RapperWithZodiac {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  average_rating: number | null;
  zodiacSign: string;
}

interface ZodiacCount {
  name: string;
  symbol: string;
  count: number;
  color: string;
}

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const ZodiacDistributionCard = () => {
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  const { data: rappers, isLoading } = useQuery({
    queryKey: ["rappers-zodiac-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rappers")
        .select("id, name, slug, image_url, average_rating, birth_month, birth_day")
        .not("birth_month", "is", null)
        .not("birth_day", "is", null);

      if (error) throw error;

      // Map rappers to their zodiac signs
      return data
        .map((rapper) => ({
          id: rapper.id,
          name: rapper.name,
          slug: rapper.slug,
          image_url: rapper.image_url,
          average_rating: rapper.average_rating,
          zodiacSign: getZodiacName(rapper.birth_month, rapper.birth_day),
        }))
        .filter((r) => r.zodiacSign); // Only include rappers with valid zodiac signs
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Calculate zodiac counts for the chart
  const zodiacCounts = useMemo(() => {
    if (!rappers) return [];

    const allSigns = getAllZodiacSigns();
    const counts = new Map<string, number>();

    // Initialize all signs with 0
    allSigns.forEach((sign) => counts.set(sign.name, 0));

    // Count rappers per sign
    rappers.forEach((rapper) => {
      const current = counts.get(rapper.zodiacSign) || 0;
      counts.set(rapper.zodiacSign, current + 1);
    });

    // Convert to array with colors
    return allSigns.map((sign) => ({
      name: sign.name,
      symbol: sign.symbol,
      count: counts.get(sign.name) || 0,
      color: sign.color.replace("bg-", ""),
    }));
  }, [rappers]);

  // Get rappers grouped by sign
  const rappersBySign = useMemo(() => {
    if (!rappers) return new Map<string, RapperWithZodiac[]>();

    const grouped = new Map<string, RapperWithZodiac[]>();
    rappers.forEach((rapper) => {
      const current = grouped.get(rapper.zodiacSign) || [];
      grouped.set(rapper.zodiacSign, [...current, rapper]);
    });
    return grouped;
  }, [rappers]);

  // Get 5 random rappers from the selected sign (or all signs)
  const randomRappers = useMemo(() => {
    if (!rappers || rappers.length === 0) return [];

    let pool: RapperWithZodiac[];
    if (selectedSign) {
      pool = rappersBySign.get(selectedSign) || [];
    } else {
      pool = rappers;
    }

    return shuffleArray(pool).slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rappers, rappersBySign, selectedSign, shuffleKey]);

  const handleBarClick = (data: ZodiacCount) => {
    setSelectedSign(selectedSign === data.name ? null : data.name);
  };

  const handleShuffle = () => {
    setShuffleKey((prev) => prev + 1);
  };

  // Get color for bar based on zodiac sign
  const getBarColor = (signName: string): string => {
    const colorMap: Record<string, string> = {
      Aries: "#ef4444",
      Taurus: "#22c55e",
      Gemini: "#eab308",
      Cancer: "#3b82f6",
      Leo: "#f97316",
      Virgo: "#10b981",
      Libra: "#ec4899",
      Scorpio: "#a855f7",
      Sagittarius: "#6366f1",
      Capricorn: "#6b7280",
      Aquarius: "#06b6d4",
      Pisces: "#14b8a6",
    };
    return colorMap[signName] || "#FFD700";
  };

  if (isLoading) {
    return (
      <Card className="bg-black border-4 border-rap-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
            <Star className="w-5 h-5" />
            Zodiac Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-rap-smoke/20 rounded"></div>
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square bg-rap-smoke/20 rounded-lg"></div>
                  <div className="h-3 bg-rap-smoke/20 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedSignData = selectedSign
    ? getAllZodiacSigns().find((s) => s.name === selectedSign)
    : null;

  return (
    <Card className="bg-black border-4 border-rap-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
          <Star className="w-5 h-5" />
          Zodiac Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={zodiacCounts}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <XAxis type="number" stroke="#888888" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickFormatter={(value) => {
                  const sign = zodiacCounts.find((s) => s.name === value);
                  return sign ? `${sign.symbol} ${value}` : value;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "2px solid #FFD700",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#FFD700", fontWeight: "bold" }}
                itemStyle={{ color: "#E5E5E5" }}
                formatter={(value: number) => [`${value} rappers`, "Count"]}
                labelFormatter={(label) => {
                  const sign = zodiacCounts.find((s) => s.name === label);
                  return sign ? `${sign.symbol} ${label}` : label;
                }}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data) => handleBarClick(data as unknown as ZodiacCount)}
              >
                {zodiacCounts.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={getBarColor(entry.name)}
                    opacity={selectedSign && selectedSign !== entry.name ? 0.3 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Random Rappers Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h4 className="text-rap-platinum font-kaushan text-lg">
                {selectedSign ? (
                  <>
                    <span className="text-rap-gold">{selectedSignData?.symbol}</span>{" "}
                    {selectedSign} Rappers
                  </>
                ) : (
                  "Random Rappers from All Signs"
                )}
              </h4>
              {selectedSign && (
                <button
                  onClick={() => setSelectedSign(null)}
                  className="text-xs text-rap-smoke hover:text-rap-gold transition-colors"
                >
                  (clear)
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedSign && (
                <Link
                  to={`/all-rappers?zodiac=${selectedSign}`}
                  className="text-xs bg-[hsl(var(--theme-primary))] text-black px-3 py-1.5 rounded font-medium hover:bg-[hsl(var(--theme-primary))]/80 transition-colors"
                >
                  All {selectedSign}s →
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShuffle}
                className="text-rap-gold hover:text-rap-gold/80 hover:bg-rap-gold/10"
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Shuffle
              </Button>
            </div>
          </div>

          {randomRappers.length > 0 ? (
            <div className="grid grid-cols-5 gap-3">
              {randomRappers.map((rapper) => (
                <Link
                  key={rapper.id}
                  to={`/rappers/${rapper.slug}`}
                  className="group text-center"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-rap-smoke/20 mb-2">
                    {rapper.image_url ? (
                      <img
                        src={rapper.image_url}
                        alt={rapper.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-rap-smoke text-2xl font-mogra">
                        {rapper.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-rap-platinum font-kaushan text-xs truncate block group-hover:text-rap-gold transition-colors">
                    {rapper.name}
                  </span>
                  {rapper.average_rating && (
                    <span className="text-rap-smoke text-xs">
                      ★ {rapper.average_rating.toFixed(1)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-rap-smoke font-kaushan py-4">
              No rappers with birth dates available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ZodiacDistributionCard;
