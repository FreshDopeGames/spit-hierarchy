import { useState } from "react";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Calendar, Disc3, Music, Trophy, ExternalLink, PlayCircle } from "lucide-react";
import { useRapperDiscography, useRefreshDiscography } from "@/hooks/useRapperDiscography";
import { useSecurityContext } from "@/hooks/useSecurityContext";
import { format } from "date-fns";
import { getSmartAlbumPlaceholder, generateExternalAlbumLinks } from "@/utils/albumPlaceholderUtils";
import { AlbumCoverImage } from "@/components/ui/AlbumCoverImage";

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
  const { isAdmin } = useSecurityContext();
  const [activeTab, setActiveTab] = useState("albums");
  const handleRefresh = () => {
    refreshMutation.mutate(rapperId);
  };
  if (isLoading) {
    return <Card className="bg-black border-4 border-[hsl(var(--theme-primary))]">
        <CardHeader>
          <div className="h-6 bg-gray-800 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-16 h-16 bg-gray-800 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>;
  }
  if (error) {
    const isNotFound = error?.message?.includes('404') || error?.message?.includes('not found');
    const isRateLimit = error?.message?.includes('Rate limit') || error?.message?.includes('429');
    return <Card className="bg-black border-4 border-[hsl(var(--theme-primary))]">
        <CardContent className="p-6 text-center">
          <div className="text-[var(--theme-secondary)] mb-4">
            {isNotFound ? "No discography data found on MusicBrainz" : isRateLimit ? "Rate limit reached" : "Failed to load discography data"}
          </div>
          <p className="text-sm text-[var(--theme-textMuted)] mb-4">
            {isNotFound ? "This artist may not be in the MusicBrainz database yet." : isRateLimit ? "Too many requests. Please try again in a few minutes." : "There was an error connecting to the music database."}
          </p>
          <Button onClick={handleRefresh} variant="outline" className="border-[var(--theme-primary)]/50 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10" disabled={refreshMutation.isPending}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin-relaxed' : ''}`} />
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
  return <Card className="bg-black border-4 border-[hsl(var(--theme-primary))] shadow-lg shadow-[var(--theme-primary)]/10 min-h-[600px] sm:min-h-[500px]">
      <CardHeader className="pb-6 sm:pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">Discography</h3>
            <p className="text-sm text-[var(--theme-textMuted)] mt-1">
              {isLoading ? 'Fetching from MusicBrainz...' : 'commercial and underground projects'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 py-[10px]">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 bg-muted/80 rounded-lg p-4 gap-1 sm:gap-2 min-h-[150px] sm:min-h-[70px] items-center px-[8px] py-[8px]">
            <TabsTrigger value="albums" className="py-4 px-4 sm:py-3 sm:px-4 text-sm font-medium transition-all duration-200 rounded-md w-full flex items-center justify-center">
              <Disc3 className="w-4 h-4 mr-2 flex-shrink-0 text-[var(--theme-primary)]" />
              <span className="truncate">Albums ({albums.length})</span>
            </TabsTrigger>
            <TabsTrigger value="mixtapes" className="py-4 px-4 sm:py-3 sm:px-4 text-sm font-medium transition-all duration-200 rounded-md w-full flex items-center justify-center">
              <Music className="w-4 h-4 mr-2 flex-shrink-0 text-[var(--theme-secondary)]" />
              <span className="truncate">Mixtapes ({mixtapes.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="albums" className="mt-6 sm:mt-4">
            <div className="space-y-4 sm:space-y-3">
                {albums.length === 0 ? <div className="text-center py-12 sm:py-8 px-4 sm:px-0 text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
                  No albums found in discography
                </div> : albums.map(item => {
              const releaseYear = item.album?.release_date ? new Date(item.album.release_date).getFullYear() : undefined;
              const placeholder = getSmartAlbumPlaceholder({
                releaseYear,
                releaseType: 'album',
                title: item.album?.title
              });
              const searchLinks = generateExternalAlbumLinks(item.album?.title || '', rapperName, 'album');
              const directLinks = (item.album as any)?.external_cover_links || {};
              const externalLinks = {
                spotify: directLinks.spotify || searchLinks.spotify,
                appleMusic: directLinks.apple_music || searchLinks.appleMusic
              };
              return <div key={item.id} className="flex gap-3 sm:gap-4 p-4 sm:p-3 bg-[hsl(var(--theme-backgroundLight))]/50 rounded-lg hover:bg-[hsl(var(--theme-backgroundLight))] transition-colors">
                <AlbumCoverImage
                  coverUrl={item.album?.cover_art_url}
                  title={item.album?.title || 'Album'}
                  releaseType="album"
                  placeholderColors={placeholder.style}
                />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[hsl(var(--theme-text))] font-[var(--theme-font-body)] truncate">
                        {item.album?.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.album?.release_date)}
                        </div>
                        {item.album?.track_count && <span>{item.album.track_count} tracks</span>}
                        {item.album?.label && <span className="text-[hsl(var(--theme-primary))]">{item.album.label.name}</span>}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[hsl(var(--theme-text))] hover:text-[hsl(var(--theme-text))] justify-start" onClick={() => window.open(externalLinks.spotify, '_blank')}>
                          <PlayCircle className="w-3 h-3 mr-1" />
                          Spotify
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[hsl(var(--theme-text))] hover:text-[hsl(var(--theme-text))] justify-start" onClick={() => window.open(externalLinks.appleMusic, '_blank')}>
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Apple Music
                        </Button>
                      </div>
                    </div>
                    {item.role !== 'primary' && <Badge variant="outline" className="text-xs border-[hsl(var(--theme-secondary))]/50 text-[hsl(var(--theme-secondary))]">
                        {item.role}
                      </Badge>}
                  </div>;
            })}
            </div>
          </TabsContent>

          <TabsContent value="mixtapes" className="mt-6 sm:mt-4">
            <div className="space-y-4 sm:space-y-3">
                {mixtapes.length === 0 ? <div className="text-center py-12 sm:py-8 px-4 sm:px-0 text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]">
                  No mixtapes found in discography
                </div> : mixtapes.map(item => {
              const releaseYear = item.album?.release_date ? new Date(item.album.release_date).getFullYear() : undefined;
              const placeholder = getSmartAlbumPlaceholder({
                releaseYear,
                releaseType: 'mixtape',
                title: item.album?.title
              });
              const searchLinks = generateExternalAlbumLinks(item.album?.title || '', rapperName, 'mixtape');
              const directLinks = (item.album as any)?.external_cover_links || {};
              // For mixtapes, only show links if we have direct links from MusicBrainz
              const hasDirectSpotify = directLinks.spotify;
              const hasDirectApple = directLinks.apple_music;
              return <div key={item.id} className="flex gap-3 sm:gap-4 p-4 sm:p-3 bg-[hsl(var(--theme-backgroundLight))]/50 rounded-lg hover:bg-[hsl(var(--theme-backgroundLight))] transition-colors">
                    <AlbumCoverImage
                      coverUrl={item.album?.cover_art_url}
                      title={item.album?.title || 'Mixtape'}
                      releaseType="mixtape"
                      placeholderColors={placeholder.style}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[hsl(var(--theme-text))] font-[var(--theme-font-body)] truncate">
                        {item.album?.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.album?.release_date)}
                        </div>
                        {item.album?.track_count && <span>{item.album.track_count} tracks</span>}
                        {item.album?.label && <span className="text-[hsl(var(--theme-primary))]">{item.album.label.name}</span>}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                         {hasDirectSpotify && <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[hsl(var(--theme-text))] hover:text-[hsl(var(--theme-text))] justify-start" onClick={() => window.open(directLinks.spotify, '_blank')}>
                            <PlayCircle className="w-3 h-3 mr-1" />
                            Spotify
                          </Button>}
                        {hasDirectApple && <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[hsl(var(--theme-text))] hover:text-[hsl(var(--theme-text))] justify-start" onClick={() => window.open(directLinks.apple_music, '_blank')}>
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Apple Music
                          </Button>}
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[hsl(var(--theme-text))] hover:text-[hsl(var(--theme-text))] justify-start" onClick={() => window.open(searchLinks.genius, '_blank')}>
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Genius
                        </Button>
                      </div>
                    </div>
                    {item.role !== 'primary' && <Badge variant="outline" className="text-xs border-[hsl(var(--theme-secondary))]/50 text-[hsl(var(--theme-secondary))]">
                        {item.role}
                      </Badge>}
                  </div>;
            })}
            </div>
          </TabsContent>

        </Tabs>
        
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-[hsl(var(--theme-border))]/20 mt-6 my-[25px] py-[23px]">
          {isAdmin && data?.cached && !data?.rate_limited && <Badge variant="secondary" className="text-xs">
              Cached
            </Badge>}
          {isAdmin && data?.rate_limited && <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-500">
              Cached (rate limited)
            </Badge>}
          {isLoading && <Badge variant="outline" className="text-xs border-[hsl(var(--theme-primary))]/50 text-[hsl(var(--theme-primary))]">
              Loading...
            </Badge>}
          {isAdmin && <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshMutation.isPending || isLoading} className="border-[hsl(var(--theme-primary))]/50 text-black hover:bg-[hsl(var(--theme-primary))] hover:text-black hover:border-[hsl(var(--theme-primary))] transition-all duration-200 gap-2">
             <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending || isLoading ? 'animate-spin-relaxed' : 'transition-transform duration-200'}`} />
            <span className="text-sm font-medium">
              {refreshMutation.isPending || isLoading ? 'Refreshing...' : 'Refresh'}
            </span>
          </Button>}
        </div>
      </CardContent>
    </Card>;
};
export default RapperDiscography;