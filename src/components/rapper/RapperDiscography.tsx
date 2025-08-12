import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Calendar, Disc3, Music, Trophy, ExternalLink, PlayCircle } from "lucide-react";
import { useRapperDiscography, useRefreshDiscography } from "@/hooks/useRapperDiscography";
import { format } from "date-fns";
import { getSmartAlbumPlaceholder, generateExternalAlbumLinks } from "@/utils/albumPlaceholderUtils";
interface RapperDiscographyProps {
  rapperId: string;
  rapperName?: string;
}
const RapperDiscography = ({
  rapperId,
  rapperName = "Unknown Artist"
}: RapperDiscographyProps) => {
  const {
    data,
    isLoading,
    error
  } = useRapperDiscography(rapperId, true); // Auto-fetch enabled
  const refreshMutation = useRefreshDiscography();
  const [activeTab, setActiveTab] = useState("albums");
  const handleRefresh = () => {
    refreshMutation.mutate(rapperId);
  };
  if (isLoading) {
    return <Card className="bg-black border-rap-gold/20">
        <CardHeader>
          <div className="h-6 bg-rap-carbon-light rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-16 h-16 bg-rap-carbon-light rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-rap-carbon-light rounded w-3/4"></div>
                  <div className="h-3 bg-rap-carbon-light rounded w-1/2"></div>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>;
  }
  if (error) {
    const isNotFound = error?.message?.includes('404') || error?.message?.includes('not found');
    const isRateLimit = error?.message?.includes('Rate limit') || error?.message?.includes('429');
    return <Card className="bg-black border-rap-burgundy/30">
        <CardContent className="p-6 text-center">
          <div className="text-rap-burgundy mb-4">
            {isNotFound ? "No discography data found on MusicBrainz" : isRateLimit ? "Rate limit reached" : "Failed to load discography data"}
          </div>
          <p className="text-sm text-rap-smoke mb-4">
            {isNotFound ? "This artist may not be in the MusicBrainz database yet." : isRateLimit ? "Too many requests. Please try again in a few minutes." : "There was an error connecting to the music database."}
          </p>
          <Button onClick={handleRefresh} variant="outline" className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/10" disabled={refreshMutation.isPending}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            {isNotFound ? 'Search Again' : 'Retry'}
          </Button>
        </CardContent>
      </Card>;
  }
  if (!data) return null;
  const albums = data?.discography?.filter(item => item.album?.release_type === 'album').sort((a, b) => {
    const dateA = a.album?.release_date ? new Date(a.album.release_date).getTime() : 0;
    const dateB = b.album?.release_date ? new Date(b.album.release_date).getTime() : 0;
    return dateA - dateB; // Chronological order (earliest first)
  }) || [];
  const mixtapes = data?.discography?.filter(item => item.album?.release_type === 'mixtape').sort((a, b) => {
    const dateA = a.album?.release_date ? new Date(a.album.release_date).getTime() : 0;
    const dateB = b.album?.release_date ? new Date(b.album.release_date).getTime() : 0;
    return dateA - dateB; // Chronological order (earliest first)
  }) || [];
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
    const seconds = Math.floor(ms % 60000 / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  return <Card className="bg-black border-rap-gold/20 shadow-lg shadow-rap-gold/10 min-h-[600px] sm:min-h-[500px]">
      <CardHeader className="pb-6 sm:pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-mogra text-rap-platinum">Discography</h3>
            <p className="text-sm text-rap-smoke mt-1">
              {isLoading ? 'Fetching from MusicBrainz...' : 'commercial and underground projects'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 bg-muted/80 rounded-lg p-4 gap-1 sm:gap-2 min-h-[150px] sm:min-h-[70px] items-center px-[8px] py-[8px]">
            <TabsTrigger value="albums" className="py-4 px-4 sm:py-3 sm:px-4 text-sm font-medium transition-all duration-200 rounded-md w-full flex items-center justify-center">
              <Disc3 className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Albums ({albums.length})</span>
            </TabsTrigger>
            <TabsTrigger value="mixtapes" className="py-4 px-4 sm:py-3 sm:px-4 text-sm font-medium transition-all duration-200 rounded-md w-full flex items-center justify-center">
              <Music className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Mixtapes ({mixtapes.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="albums" className="mt-6 sm:mt-4">
            <div className="space-y-4 sm:space-y-3">
                {albums.length === 0 ? <div className="text-center py-12 sm:py-8 px-4 sm:px-0 text-rap-smoke font-kaushan">
                  No albums found in discography
                </div> : albums.map(item => {
                  const releaseYear = item.album?.release_date ? new Date(item.album.release_date).getFullYear() : undefined;
                  const placeholder = getSmartAlbumPlaceholder({
                    releaseYear,
                    releaseType: 'album',
                    title: item.album?.title
                  });
                  const externalLinks = generateExternalAlbumLinks(item.album?.title || '', rapperName);
                  
                  return <div key={item.id} className="flex gap-3 sm:gap-4 p-4 sm:p-3 bg-rap-carbon/20 rounded-lg hover:bg-rap-carbon/30 transition-colors">
                    <div 
                      className="w-12 h-12 rounded flex items-center justify-center relative overflow-hidden"
                      style={{ 
                        backgroundColor: placeholder.style.bgColor,
                        background: `linear-gradient(135deg, ${placeholder.style.bgColor}, ${placeholder.style.primary})`
                      }}
                    >
                      <Disc3 
                        className="w-6 h-6" 
                        style={{ color: placeholder.style.textColor }}
                      />
                      <div 
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `radial-gradient(circle at 30% 70%, ${placeholder.style.textColor} 1px, transparent 1px)`,
                          backgroundSize: '8px 8px'
                        }}
                      />
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
                        {item.album?.track_count && <span>{item.album.track_count} tracks</span>}
                        {item.album?.label && <span className="text-rap-gold">{item.album.label.name}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => window.open(externalLinks.spotify, '_blank')}
                        >
                          <PlayCircle className="w-3 h-3 mr-1" />
                          Spotify
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => window.open(externalLinks.appleMusic, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Apple Music
                        </Button>
                      </div>
                    </div>
                    {item.role !== 'primary' && <Badge variant="outline" className="text-xs border-rap-burgundy/50 text-rap-burgundy">
                        {item.role}
                      </Badge>}
                  </div>
                })}
            </div>
          </TabsContent>

          <TabsContent value="mixtapes" className="mt-6 sm:mt-4">
            <div className="space-y-4 sm:space-y-3">
                {mixtapes.length === 0 ? <div className="text-center py-12 sm:py-8 px-4 sm:px-0 text-rap-smoke font-kaushan">
                  No mixtapes found in discography
                </div> : mixtapes.map(item => {
                  const releaseYear = item.album?.release_date ? new Date(item.album.release_date).getFullYear() : undefined;
                  const placeholder = getSmartAlbumPlaceholder({
                    releaseYear,
                    releaseType: 'mixtape',
                    title: item.album?.title
                  });
                  const externalLinks = generateExternalAlbumLinks(item.album?.title || '', rapperName);
                  
                  return <div key={item.id} className="flex gap-3 sm:gap-4 p-4 sm:p-3 bg-rap-carbon/20 rounded-lg hover:bg-rap-carbon/30 transition-colors">
                    <div 
                      className="w-12 h-12 rounded flex items-center justify-center relative overflow-hidden"
                      style={{ 
                        backgroundColor: placeholder.style.bgColor,
                        background: `linear-gradient(135deg, ${placeholder.style.bgColor}, ${placeholder.style.primary})`
                      }}
                    >
                      <Music 
                        className="w-6 h-6" 
                        style={{ color: placeholder.style.textColor }}
                      />
                      <div 
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `linear-gradient(45deg, ${placeholder.style.textColor} 25%, transparent 25%, transparent 75%, ${placeholder.style.textColor} 75%)`,
                          backgroundSize: '6px 6px'
                        }}
                      />
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
                        {item.album?.track_count && <span>{item.album.track_count} tracks</span>}
                        {item.album?.label && <span className="text-rap-gold">{item.album.label.name}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => window.open(externalLinks.spotify, '_blank')}
                        >
                          <PlayCircle className="w-3 h-3 mr-1" />
                          Spotify
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => window.open(externalLinks.appleMusic, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Apple Music
                        </Button>
                      </div>
                    </div>
                    {item.role !== 'primary' && <Badge variant="outline" className="text-xs border-rap-burgundy/50 text-rap-burgundy">
                        {item.role}
                      </Badge>}
                  </div>
                })}
            </div>
          </TabsContent>

        </Tabs>
        
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-rap-carbon/20 mt-6">
          {data?.cached && <Badge variant="secondary" className="text-xs">
              Cached
            </Badge>}
          {isLoading && <Badge variant="outline" className="text-xs border-rap-gold/50 text-rap-gold">
              Loading...
            </Badge>}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshMutation.isPending || isLoading} className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon hover:border-rap-gold transition-all duration-200 gap-2">
            <RefreshCw className={`w-4 h-4 transition-transform duration-200 ${refreshMutation.isPending || isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {refreshMutation.isPending || isLoading ? 'Refreshing...' : 'Refresh'}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>;
};
export default RapperDiscography;