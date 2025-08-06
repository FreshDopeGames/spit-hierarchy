import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Calendar, Disc3, Music, Trophy, ExternalLink } from "lucide-react";
import { useRapperDiscography, useRefreshDiscography } from "@/hooks/useRapperDiscography";
import { format } from "date-fns";

interface RapperDiscographyProps {
  rapperId: string;
}

const RapperDiscography = ({ rapperId }: RapperDiscographyProps) => {
  const { data, isLoading, error } = useRapperDiscography(rapperId);
  const refreshMutation = useRefreshDiscography();
  const [activeTab, setActiveTab] = useState("albums");

  const handleRefresh = () => {
    refreshMutation.mutate(rapperId);
  };

  if (isLoading) {
    return (
      <Card className="bg-carbon-fiber border-rap-gold/20">
        <CardHeader>
          <div className="h-6 bg-rap-carbon-light rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-16 h-16 bg-rap-carbon-light rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-rap-carbon-light rounded w-3/4"></div>
                  <div className="h-3 bg-rap-carbon-light rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-carbon-fiber border-rap-burgundy/30">
        <CardContent className="p-6 text-center">
          <div className="text-rap-burgundy mb-4">
            Failed to load discography data
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const albums = data?.discography?.filter(item => 
    item.album?.release_type === 'album'
  ) || [];
  
  const mixtapes = data?.discography?.filter(item => 
    item.album?.release_type === 'mixtape'
  ) || [];

  const singles = data?.topSingles || [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    try {
      return format(new Date(dateString), "MMM yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return null;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-black border-rap-gold/20 shadow-lg shadow-rap-gold/10 min-h-[600px] sm:min-h-[500px]">
      <CardHeader className="pb-6 sm:pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-mogra text-rap-platinum">Discography</h3>
            <p className="text-sm text-rap-smoke mt-1">Complete musical catalog and chart performances</p>
          </div>
          <div className="flex items-center gap-2">
            {data?.cached && (
              <Badge variant="secondary" className="text-xs">
                Cached
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
              className="text-rap-gold hover:bg-rap-gold/10"
            >
              <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-muted/80 rounded-lg p-2 gap-1 sm:gap-2 min-h-[180px] sm:min-h-[50px] items-center">
            <TabsTrigger 
              value="albums" 
              className="py-4 px-4 sm:py-3 sm:px-4 text-sm font-medium transition-all duration-200 rounded-md w-full flex items-center justify-center"
            >
              <Disc3 className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Albums ({albums.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mixtapes"
              className="py-4 px-4 sm:py-3 sm:px-4 text-sm font-medium transition-all duration-200 rounded-md w-full flex items-center justify-center"
            >
              <Music className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Mixtapes ({mixtapes.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="singles"
              className="py-4 px-4 sm:py-3 sm:px-4 text-sm font-medium transition-all duration-200 rounded-md w-full flex items-center justify-center"
            >
              <Trophy className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Top Singles ({singles.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="albums" className="mt-6 sm:mt-4">
            <div className="space-y-4 sm:space-y-3">
              {albums.length === 0 ? (
                <div className="text-center py-12 sm:py-8 px-4 sm:px-0 text-rap-smoke font-kaushan">
                  No albums found in discography
                </div>
              ) : (
                albums.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 p-4 sm:p-3 bg-rap-carbon/20 rounded-lg hover:bg-rap-carbon/30 transition-colors">
                    <div className="w-12 h-12 bg-rap-carbon-light rounded flex items-center justify-center">
                      <Disc3 className="w-6 h-6 text-rap-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-rap-platinum font-kaushan truncate">
                        {item.album?.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-rap-smoke font-kaushan">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.album?.release_date)}
                        </div>
                        {item.album?.track_count && (
                          <span>{item.album.track_count} tracks</span>
                        )}
                        {item.album?.label && (
                          <span className="text-rap-gold">{item.album.label.name}</span>
                        )}
                      </div>
                    </div>
                    {item.role !== 'primary' && (
                      <Badge variant="outline" className="text-xs border-rap-burgundy/50 text-rap-burgundy">
                        {item.role}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="mixtapes" className="mt-6 sm:mt-4">
            <div className="space-y-4 sm:space-y-3">
              {mixtapes.length === 0 ? (
                <div className="text-center py-12 sm:py-8 px-4 sm:px-0 text-rap-smoke font-kaushan">
                  No mixtapes found in discography
                </div>
              ) : (
                mixtapes.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 p-4 sm:p-3 bg-rap-carbon/20 rounded-lg hover:bg-rap-carbon/30 transition-colors">
                    <div className="w-12 h-12 bg-rap-carbon-light rounded flex items-center justify-center">
                      <Music className="w-6 h-6 text-rap-burgundy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-rap-platinum font-kaushan truncate">
                        {item.album?.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-rap-smoke font-kaushan">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.album?.release_date)}
                        </div>
                        {item.album?.track_count && (
                          <span>{item.album.track_count} tracks</span>
                        )}
                        {item.album?.label && (
                          <span className="text-rap-gold">{item.album.label.name}</span>
                        )}
                      </div>
                    </div>
                    {item.role !== 'primary' && (
                      <Badge variant="outline" className="text-xs border-rap-burgundy/50 text-rap-burgundy">
                        {item.role}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="singles" className="mt-6 sm:mt-4">
            <div className="space-y-4 sm:space-y-3">
              {singles.length === 0 ? (
                <div className="text-center py-12 sm:py-8 px-4 sm:px-0 text-rap-smoke font-kaushan">
                  No singles found in discography
                </div>
              ) : (
                singles.map((item, index) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 p-4 sm:p-3 bg-rap-carbon/20 rounded-lg hover:bg-rap-carbon/30 transition-colors">
                    <div className="w-12 h-12 bg-rap-carbon-light rounded flex items-center justify-center">
                      <div className="text-rap-silver font-bold">#{index + 1}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-rap-platinum font-kaushan truncate">
                        {item.single?.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-rap-smoke font-kaushan">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.single?.release_date)}
                        </div>
                        {item.single?.duration_ms && (
                          <span>{formatDuration(item.single.duration_ms)}</span>
                        )}
                        {item.single?.peak_chart_position && (
                          <div className="flex items-center gap-1 text-rap-gold">
                            <Trophy className="w-3 h-3" />
                            #{item.single.peak_chart_position} {item.single.chart_country}
                          </div>
                        )}
                      </div>
                    </div>
                    {item.role !== 'primary' && (
                      <Badge variant="outline" className="text-xs border-rap-burgundy/50 text-rap-burgundy">
                        {item.role}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RapperDiscography;