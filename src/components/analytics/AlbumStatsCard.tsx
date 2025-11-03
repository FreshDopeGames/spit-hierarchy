import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Disc3, Trophy, Star } from "lucide-react";
import { useAlbumStats } from "@/hooks/useAlbumStats";

const AlbumStatsCard = () => {
  const { data: albumStats, isLoading } = useAlbumStats();

  if (isLoading) {
    return (
      <Card className="bg-black border-4 border-rap-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
            <Disc3 className="w-5 h-5" />
            Album Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-rap-smoke/20 rounded"></div>
              <div className="h-16 bg-rap-smoke/20 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-4 border-rap-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
          <Disc3 className="w-5 h-5" />
          Albums & Mixtapes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-rap-platinum font-mogra">
                {albumStats?.averageAlbums ? albumStats.averageAlbums.toFixed(1) : "N/A"}
              </div>
              <div className="text-rap-smoke font-kaushan text-xs md:text-sm">
                Avg Albums
              </div>
              <div className="text-rap-smoke/70 font-kaushan text-xs">
                ({albumStats?.albumCount || 0} rappers)
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-rap-burgundy font-mogra">
                {albumStats?.averageMixtapes ? albumStats.averageMixtapes.toFixed(1) : "N/A"}
              </div>
              <div className="text-rap-smoke font-kaushan text-xs md:text-sm">
                Avg Mixtapes
              </div>
              <div className="text-rap-smoke/70 font-kaushan text-xs">
                ({albumStats?.mixtapeCount || 0} rappers)
              </div>
            </div>
          </div>

          {/* Top Artists */}
          {(albumStats?.topAlbumArtist || albumStats?.topMixtapeArtist) && (
            <>
              <div className="border-t border-rap-gold/20 pt-3"></div>
              <div className="grid grid-cols-2 gap-3">
                {/* Top Album Artist */}
                {albumStats?.topAlbumArtist && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-rap-platinum/70 mb-1">
                      <Trophy className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-bold text-rap-platinum font-mogra truncate px-1">
                      {albumStats.topAlbumArtist.name}
                    </div>
                    <div className="text-xs text-rap-smoke font-kaushan">
                      {albumStats.topAlbumArtist.count} albums
                    </div>
                  </div>
                )}
                
                {/* Top Mixtape Artist */}
                {albumStats?.topMixtapeArtist && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-rap-burgundy/70 mb-1">
                      <Star className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-bold text-rap-burgundy font-mogra truncate px-1">
                      {albumStats.topMixtapeArtist.name}
                    </div>
                    <div className="text-xs text-rap-smoke font-kaushan">
                      {albumStats.topMixtapeArtist.count} mixtapes
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlbumStatsCard;