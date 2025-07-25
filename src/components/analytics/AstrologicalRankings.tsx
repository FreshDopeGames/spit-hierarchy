
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getZodiacName, getZodiacSymbol, getAllZodiacSigns } from "@/utils/zodiacUtils";

interface RapperWithZodiac {
  id: string;
  name: string;
  average_rating: number;
  total_votes: number;
  birth_month: number | null;
  birth_day: number | null;
  zodiac_sign: string;
  image_url: string | null;
}

const AstrologicalRankings = () => {
  const [selectedZodiac, setSelectedZodiac] = useState<string>('all');
  const zodiacSigns = getAllZodiacSigns();

  const { data: rappersData, isLoading } = useQuery({
    queryKey: ["astrological-rankings"],
    queryFn: async () => {
      const { data: rappers, error } = await supabase
        .from("rappers")
        .select("id, name, average_rating, total_votes, birth_month, birth_day, image_url")
        .order("average_rating", { ascending: false });
      
      if (error) throw error;

      // Add zodiac sign to each rapper
      const rappersWithZodiac: RapperWithZodiac[] = rappers.map(rapper => ({
        ...rapper,
        zodiac_sign: getZodiacName(rapper.birth_month, rapper.birth_day) || 'Unknown'
      }));
      
      return rappersWithZodiac;
    }
  });

  const groupedByZodiac = rappersData?.reduce((acc, rapper) => {
    const sign = rapper.zodiac_sign;
    if (!acc[sign]) acc[sign] = [];
    acc[sign].push(rapper);
    return acc;
  }, {} as Record<string, RapperWithZodiac[]>);

  const zodiacStats = zodiacSigns.map(sign => {
    const rappers = groupedByZodiac?.[sign.name] || [];
    const averageRating = rappers.length > 0 
      ? rappers.reduce((sum, r) => sum + (r.average_rating || 0), 0) / rappers.length 
      : 0;
    const totalVotes = rappers.reduce((sum, r) => sum + (r.total_votes || 0), 0);
    
    return {
      ...sign,
      count: rappers.length,
      averageRating,
      totalVotes,
      topRapper: rappers[0] // Already sorted by rating
    };
  }).sort((a, b) => b.averageRating - a.averageRating);

  if (isLoading) {
    return (
      <Card className="bg-carbon-fiber/90 border-rap-gold/30 animate-pulse shadow-lg shadow-rap-gold/20">
        <CardContent className="p-6">
          <div className="h-96 bg-rap-carbon-light rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const filteredRappers = selectedZodiac === 'all' 
    ? rappersData?.filter(r => r.zodiac_sign !== 'Unknown') || [] 
    : groupedByZodiac?.[selectedZodiac] || [];

  return (
    <div className="space-y-6 border-2 border-rap-gold rounded-lg">
      <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20">
        <CardHeader>
          <CardTitle className="text-rap-gold font-merienda flex items-center gap-2 text-2xl font-extrabold">
            <Star className="w-5 h-5" />
            Astrological Rankings
          </CardTitle>
          <p className="text-rap-smoke font-merienda text-base">
            Discover how the stars align with hip-hop talent across zodiac signs
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedZodiac} onValueChange={setSelectedZodiac} className="w-full">
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-1 bg-carbon-fiber border border-rap-gold/40 h-auto p-2">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-xs font-merienda font-extrabold text-rap-platinum"
              >
                All Signs
              </TabsTrigger>
              {zodiacSigns.slice(0, 6).map(sign => (
                <TabsTrigger 
                  key={sign.name} 
                  value={sign.name} 
                  className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-xs flex items-center gap-1 font-merienda font-extrabold text-rap-platinum"
                >
                  <span className="bg-rap-gold text-black px-1.5 py-0.5 rounded text-xs font-bold">
                    {sign.symbol}
                  </span>
                  <span className="hidden sm:inline">{sign.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-6 gap-2">
              {zodiacSigns.slice(6).map(sign => (
                <button 
                  key={sign.name} 
                  onClick={() => setSelectedZodiac(sign.name)} 
                  className={`p-2 rounded-lg border text-xs flex items-center gap-1 justify-center transition-colors font-merienda font-extrabold ${
                    selectedZodiac === sign.name 
                      ? 'bg-rap-gold text-rap-carbon border-rap-gold' 
                      : 'bg-carbon-fiber text-rap-smoke border-rap-gold/20 hover:bg-rap-carbon/50'
                  }`}
                >
                  <span className="bg-rap-gold text-black px-1.5 py-0.5 rounded text-xs font-bold">
                    {sign.symbol}
                  </span>
                  <span>{sign.name}</span>
                </button>
              ))}
            </div>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zodiacStats.map((stat, index) => (
                  <Card key={stat.name} className="bg-carbon-fiber/60 border-rap-gold/20 shadow-lg shadow-rap-gold/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-rap-gold text-black px-2 py-1 rounded-lg text-xl font-bold">
                            {stat.symbol}
                          </span>
                          <div>
                            <h3 className="text-rap-gold font-bold font-merienda">{stat.name}</h3>
                            <p className="text-xs text-rap-smoke font-merienda">{stat.dates}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30">
                          #{index + 1}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-rap-platinum font-merienda">
                          <span>Rappers:</span>
                          <span>{stat.count}</span>
                        </div>
                        <div className="flex justify-between text-rap-platinum font-merienda">
                          <span>Avg Rating:</span>
                          <span>{stat.averageRating.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-rap-platinum font-merienda">
                          <span>Total Votes:</span>
                          <span>{stat.totalVotes}</span>
                        </div>
                        {stat.topRapper && (
                          <div className="pt-2 border-t border-rap-gold/20">
                            <p className="text-xs text-rap-smoke font-merienda">Top Rapper:</p>
                            <p className="text-rap-gold font-medium font-merienda">{stat.topRapper.name}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {zodiacSigns.map(sign => (
              <TabsContent key={sign.name} value={sign.name} className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-rap-gold text-black px-3 py-2 rounded-xl text-4xl font-bold">
                      {sign.symbol}
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-rap-gold font-mogra animate-text-glow">
                        {sign.name}
                      </h2>
                      <p className="text-rap-smoke font-merienda">{sign.dates} • {sign.element} Sign</p>
                    </div>
                  </div>

                  {groupedByZodiac?.[sign.name]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedByZodiac[sign.name].map((rapper, index) => (
                        <Card key={rapper.id} className="bg-carbon-fiber/60 border-rap-gold/20 shadow-lg shadow-rap-gold/10">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-rap-gold font-bold font-merienda">{rapper.name}</h3>
                              <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30">
                                #{index + 1}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-rap-gold" />
                                <span className="text-rap-platinum font-merienda">
                                  {Number(rapper.average_rating || 0).toFixed(1)} rating
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-rap-forest" />
                                <span className="text-rap-platinum font-merienda">
                                  {rapper.total_votes || 0} votes
                                </span>
                              </div>
                              {rapper.birth_month && rapper.birth_day && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-rap-burgundy" />
                                  <span className="text-rap-platinum font-merienda">
                                    {rapper.birth_month}/{rapper.birth_day}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-rap-smoke font-merienda">No rappers found for {sign.name}</p>
                      <p className="text-sm text-rap-smoke mt-2 font-merienda">
                        Birth dates may not be available for all artists
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AstrologicalRankings;
