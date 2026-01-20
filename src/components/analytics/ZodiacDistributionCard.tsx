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
  birth_month: number;
  birth_day: number;
}

interface ZodiacCount {
  name: string;
  symbol: string;
  count: number;
  element: string;
}

// Element color palette - consistent colors for each element
const ELEMENT_COLORS: Record<string, { primary: string; secondary: string }> = {
  Fire: { primary: '#ef4444', secondary: '#f97316' },   // Red/Orange - Aries, Leo, Sagittarius
  Water: { primary: '#3b82f6', secondary: '#8b5cf6' },  // Blue/Purple - Cancer, Scorpio, Pisces
  Air: { primary: '#facc15', secondary: '#22d3ee' },    // Yellow/Cyan - Gemini, Libra, Aquarius
  Earth: { primary: '#22c55e', secondary: '#78716c' }   // Green/Stone - Taurus, Virgo, Capricorn
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Format birth date as short month + day (e.g., "Sep 16")
const formatShortBirthdate = (month: number, day: number): string => {
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${shortMonths[month - 1]} ${day}`;
};

// Get element for a zodiac sign
const getSignElement = (signName: string): string => {
  const sign = getAllZodiacSigns().find(s => s.name === signName);
  return sign?.element || 'Fire';
};

// Get bar color based on element
const getBarColorByElement = (signName: string): string => {
  const element = getSignElement(signName);
  return ELEMENT_COLORS[element]?.primary || '#FFD700';
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
          birth_month: rapper.birth_month!,
          birth_day: rapper.birth_day!,
        }))
        .filter((r) => r.zodiacSign) as RapperWithZodiac[];
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

    // Convert to array with element info
    return allSigns.map((sign) => ({
      name: sign.name,
      symbol: sign.symbol,
      count: counts.get(sign.name) || 0,
      element: sign.element,
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

  // Get 5 random rappers per sign
  const randomRappersPerSign = useMemo(() => {
    if (!rappers) return new Map<string, RapperWithZodiac[]>();
    
    const result = new Map<string, RapperWithZodiac[]>();
    const allSigns = getAllZodiacSigns();
    
    allSigns.forEach(sign => {
      const signRappers = rappersBySign.get(sign.name) || [];
      result.set(sign.name, shuffleArray(signRappers).slice(0, 5));
    });
    
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rappers, rappersBySign, shuffleKey]);

  const handleBarClick = (data: ZodiacCount) => {
    setSelectedSign(selectedSign === data.name ? null : data.name);
  };

  const handleShuffle = () => {
    setShuffleKey((prev) => prev + 1);
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
          <div className="animate-pulse space-y-6">
            <div className="h-[500px] bg-rap-smoke/20 rounded" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-rap-smoke/20 rounded w-1/4" />
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="aspect-square bg-rap-smoke/20 rounded-lg" />
                      <div className="h-3 bg-rap-smoke/20 rounded w-3/4 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const allSigns = getAllZodiacSigns();

  return (
    <Card className="bg-black border-4 border-rap-gold/30">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
          <Star className="w-5 h-5" />
          Zodiac Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Element Legend */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs">
          {Object.entries(ELEMENT_COLORS).map(([element, colors]) => (
            <div key={element} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors.primary }}
              />
              <span className="text-rap-platinum">{element}</span>
            </div>
          ))}
        </div>

        {/* Bar Chart - Taller for all 12 signs */}
        <div className="h-[400px] sm:h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={zodiacCounts}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
            >
              <XAxis type="number" stroke="#888888" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#888888"
                fontSize={11}
                width={55}
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
                formatter={(value: number, _name, props) => {
                  const element = (props.payload as ZodiacCount).element;
                  return [`${value} rappers`, `${element} Sign`];
                }}
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
                    fill={getBarColorByElement(entry.name)}
                    opacity={selectedSign && selectedSign !== entry.name ? 0.3 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* All Signs with 5 Rappers Each */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-rap-gold/20 pb-2">
            <h4 className="text-rap-platinum font-kaushan text-lg">
              Rappers by Zodiac Sign
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShuffle}
              className="text-rap-gold hover:text-rap-gold/80 hover:bg-rap-gold/10"
            >
              <Shuffle className="w-4 h-4 mr-1" />
              Shuffle All
            </Button>
          </div>
          
          {allSigns.map(sign => {
            const signRappers = randomRappersPerSign.get(sign.name) || [];
            const count = zodiacCounts.find(z => z.name === sign.name)?.count || 0;
            const elementColor = ELEMENT_COLORS[sign.element]?.primary;
            const isSelected = selectedSign === sign.name;
            
            return (
              <div 
                key={sign.name} 
                className={`space-y-2 sm:space-y-3 p-2 sm:p-3 rounded-lg transition-all ${
                  isSelected ? 'bg-rap-gold/10 ring-1 ring-rap-gold/30' : 'hover:bg-rap-smoke/5'
                }`}
              >
                {/* Row Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedSign(isSelected ? null : sign.name)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <span 
                        className="text-xl" 
                        style={{ color: elementColor }}
                      >
                        {sign.symbol}
                      </span>
                      <span className="text-rap-platinum font-kaushan text-base sm:text-lg">
                        {sign.name}
                      </span>
                    </button>
                    <span 
                      className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${elementColor}20`, color: elementColor }}
                    >
                      {sign.element}
                    </span>
                    <span className="text-rap-smoke text-xs sm:text-sm">
                      ({count} rappers)
                    </span>
                  </div>
                  <Link
                    to={`/all-rappers?zodiac=${sign.name}`}
                    className="text-xs text-rap-gold hover:text-rap-gold/80 hover:underline"
                  >
                    View All →
                  </Link>
                </div>
                
                {/* Rapper Grid - Responsive */}
                {signRappers.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                    {signRappers.map(rapper => (
                      <Link
                        key={rapper.id}
                        to={`/rappers/${rapper.slug}`}
                        className="group text-center"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-rap-smoke/20 mb-1.5">
                          {rapper.image_url ? (
                            <img
                              src={rapper.image_url}
                              alt={rapper.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-rap-smoke text-xl font-mogra">
                              {rapper.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-rap-platinum font-kaushan text-xs truncate block group-hover:text-rap-gold transition-colors">
                          {rapper.name}
                        </span>
                        <span className="text-rap-smoke text-[10px]">
                          {formatShortBirthdate(rapper.birth_month, rapper.birth_day)}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-rap-smoke text-xs py-2">
                    No rappers with known birth dates
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ZodiacDistributionCard;
