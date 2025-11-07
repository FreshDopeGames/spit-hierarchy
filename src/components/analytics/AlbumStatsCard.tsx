import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Disc3 } from "lucide-react";
import { useAlbumStats } from "@/hooks/useAlbumStats";
import RapperAvatar from "@/components/RapperAvatar";
const AlbumStatsCard = () => {
  const {
    data: albumStats,
    isLoading
  } = useAlbumStats();
  if (isLoading) {
    return <Card className="bg-black border-4 border-rap-gold/30">
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
      </Card>;
  }
  return <Card className="bg-black border-4 border-rap-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
          <Disc3 className="w-5 h-5" />
          Albums & Mixtapes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Counts - Prominent Display */}
          <div className="bg-gradient-to-r from-rap-gold/10 to-rap-burgundy/10 rounded-lg p-4 border border-rap-gold/20">
            <div className="text-xs text-rap-smoke/70 font-kaushan mb-2 text-center uppercase tracking-wider">
              Total in Database
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-rap-platinum font-mogra">
                  {albumStats?.totalAlbums?.toLocaleString() || "0"}
                </div>
                <div className="text-rap-smoke font-kaushan text-xs">Albums</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-rap-burgundy font-mogra">
                  {albumStats?.totalMixtapes?.toLocaleString() || "0"}
                </div>
                <div className="text-rap-smoke font-kaushan text-xs">Mixtapes</div>
              </div>
            </div>
          </div>

          {/* Averages Per Rapper */}
          <div>
            <div className="text-xs text-rap-smoke/70 font-kaushan mb-2 text-center uppercase tracking-wider">
              Averages per Rapper
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-rap-platinum/80 font-mogra">
                  {albumStats?.averageAlbums ? albumStats.averageAlbums.toFixed(1) : "0"}
                </div>
                <div className="text-rap-smoke/70 font-kaushan text-xs">
                  albums ({albumStats?.albumCount || 0} rappers)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-rap-burgundy/80 font-mogra">
                  {albumStats?.averageMixtapes ? albumStats.averageMixtapes.toFixed(1) : "0"}
                </div>
                <div className="text-rap-smoke/70 font-kaushan text-xs">
                  mixtapes ({albumStats?.mixtapeCount || 0} rappers)
                </div>
              </div>
            </div>
          </div>

          {/* Top Artists */}
          {(albumStats?.topAlbumArtist || albumStats?.topMixtapeArtist) && <>
              <div className="border-t border-rap-gold/20 pt-3">
                <div className="text-xs text-rap-smoke/70 font-kaushan mb-2 text-center uppercase tracking-wider">
                  Top Artists
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Top Album Artist */}
                {albumStats?.topAlbumArtist && <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <RapperAvatar 
                        rapper={{
                          id: albumStats.topAlbumArtist.id,
                          name: albumStats.topAlbumArtist.name,
                          slug: albumStats.topAlbumArtist.slug
                        }}
                        size="md"
                        variant="square"
                      />
                    </div>
                    <div className="text-sm font-bold text-rap-platinum font-mogra truncate px-1">
                      {albumStats.topAlbumArtist.name}
                    </div>
                    <div className="text-xs text-rap-smoke font-kaushan">
                      {albumStats.topAlbumArtist.count} albums
                    </div>
                  </div>}
                
                {/* Top Mixtape Artist */}
                {albumStats?.topMixtapeArtist && <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <RapperAvatar 
                        rapper={{
                          id: albumStats.topMixtapeArtist.id,
                          name: albumStats.topMixtapeArtist.name,
                          slug: albumStats.topMixtapeArtist.slug
                        }}
                        size="md"
                        variant="square"
                      />
                    </div>
                    <div className="text-sm font-bold text-rap-burgundy font-mogra truncate px-1">
                      {albumStats.topMixtapeArtist.name}
                    </div>
                    <div className="text-xs text-rap-smoke font-kaushan">
                      {albumStats.topMixtapeArtist.count} mixtapes
                    </div>
                  </div>}
              </div>
            </>}
        </div>
      </CardContent>
    </Card>;
};
export default AlbumStatsCard;