
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface ZodiacSign {
  name: string;
  symbol: string;
  element: string;
  dates: string;
  color: string;
}

const zodiacSigns: ZodiacSign[] = [
  { name: 'Aries', symbol: '♈', element: 'Fire', dates: 'Mar 21 - Apr 19', color: 'bg-red-500' },
  { name: 'Taurus', symbol: '♉', element: 'Earth', dates: 'Apr 20 - May 20', color: 'bg-green-500' },
  { name: 'Gemini', symbol: '♊', element: 'Air', dates: 'May 21 - Jun 20', color: 'bg-yellow-500' },
  { name: 'Cancer', symbol: '♋', element: 'Water', dates: 'Jun 21 - Jul 22', color: 'bg-blue-500' },
  { name: 'Leo', symbol: '♌', element: 'Fire', dates: 'Jul 23 - Aug 22', color: 'bg-orange-500' },
  { name: 'Virgo', symbol: '♍', element: 'Earth', dates: 'Aug 23 - Sep 22', color: 'bg-emerald-500' },
  { name: 'Libra', symbol: '♎', element: 'Air', dates: 'Sep 23 - Oct 22', color: 'bg-pink-500' },
  { name: 'Scorpio', symbol: '♏', element: 'Water', dates: 'Oct 23 - Nov 21', color: 'bg-purple-500' },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', dates: 'Nov 22 - Dec 21', color: 'bg-indigo-500' },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', dates: 'Dec 22 - Jan 19', color: 'bg-gray-500' },
  { name: 'Aquarius', symbol: '♒', element: 'Air', dates: 'Jan 20 - Feb 18', color: 'bg-cyan-500' },
  { name: 'Pisces', symbol: '♓', element: 'Water', dates: 'Feb 19 - Mar 20', color: 'bg-teal-500' }
];

const getZodiacSign = (month: number | null, day: number | null): string => {
  if (!month || !day) return 'Unknown';
  
  const date = new Date(2000, month - 1, day); // Use 2000 as a reference year
  const monthDay = month * 100 + day;
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  
  return 'Unknown';
};

const AstrologicalRankings = () => {
  const [selectedZodiac, setSelectedZodiac] = useState<string>('all');

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
        zodiac_sign: getZodiacSign(rapper.birth_month, rapper.birth_day)
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
      <Card className="bg-black/40 border-purple-500/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-96 bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const filteredRappers = selectedZodiac === 'all' 
    ? rappersData?.filter(r => r.zodiac_sign !== 'Unknown') || []
    : groupedByZodiac?.[selectedZodiac] || [];

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5" />
            Astrological Rankings
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Discover how the stars align with hip-hop talent across zodiac signs
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedZodiac} onValueChange={setSelectedZodiac} className="w-full">
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-1 bg-black/40 border border-purple-500/20 h-auto p-2">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs"
              >
                All Signs
              </TabsTrigger>
              {zodiacSigns.slice(0, 6).map((sign) => (
                <TabsTrigger 
                  key={sign.name}
                  value={sign.name}
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs flex items-center gap-1"
                >
                  <span>{sign.symbol}</span>
                  <span className="hidden sm:inline">{sign.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-6 gap-2">
              {zodiacSigns.slice(6).map((sign) => (
                <button
                  key={sign.name}
                  onClick={() => setSelectedZodiac(sign.name)}
                  className={`p-2 rounded-lg border text-xs flex items-center gap-1 justify-center transition-colors ${
                    selectedZodiac === sign.name 
                      ? 'bg-purple-600 text-white border-purple-500' 
                      : 'bg-black/20 text-gray-300 border-purple-500/20 hover:bg-purple-500/20'
                  }`}
                >
                  <span>{sign.symbol}</span>
                  <span>{sign.name}</span>
                </button>
              ))}
            </div>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zodiacStats.map((stat, index) => (
                  <Card key={stat.name} className="bg-black/20 border-purple-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{stat.symbol}</span>
                          <div>
                            <h3 className="text-white font-bold">{stat.name}</h3>
                            <p className="text-xs text-gray-400">{stat.dates}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                          #{index + 1}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-300">
                          <span>Rappers:</span>
                          <span>{stat.count}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Avg Rating:</span>
                          <span>{stat.averageRating.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Total Votes:</span>
                          <span>{stat.totalVotes}</span>
                        </div>
                        {stat.topRapper && (
                          <div className="pt-2 border-t border-purple-500/20">
                            <p className="text-xs text-gray-400">Top Rapper:</p>
                            <p className="text-white font-medium">{stat.topRapper.name}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {zodiacSigns.map((sign) => (
              <TabsContent key={sign.name} value={sign.name} className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">{sign.symbol}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{sign.name}</h2>
                      <p className="text-gray-400">{sign.dates} • {sign.element} Sign</p>
                    </div>
                  </div>

                  {groupedByZodiac?.[sign.name]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedByZodiac[sign.name].map((rapper, index) => (
                        <Card key={rapper.id} className="bg-black/20 border-purple-500/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-white font-bold">{rapper.name}</h3>
                              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                                #{index + 1}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-gray-300">
                                  {Number(rapper.average_rating || 0).toFixed(1)} rating
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-300">
                                  {rapper.total_votes || 0} votes
                                </span>
                              </div>
                              {rapper.birth_month && rapper.birth_day && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-purple-500" />
                                  <span className="text-gray-300">
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
                      <p className="text-gray-400">No rappers found for {sign.name}</p>
                      <p className="text-sm text-gray-500 mt-2">
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
