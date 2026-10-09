import { Headphones, Users, Music2 } from "lucide-react";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { useAlbumListenStats } from "@/hooks/useAlbumListenStats";

interface AlbumListenStatsProps {
  albumId: string;
  albumTitle: string;
}

const formatCount = (n: number) => n.toLocaleString("en-US");

const AlbumListenStats = ({ albumId, albumTitle }: AlbumListenStatsProps) => {
  const { data: stats, isLoading } = useAlbumListenStats(albumId);

  if (isLoading) return null;

  const hasPlays = !!stats && stats.total_listen_count > 0;

  return (
    <Card className="bg-black border-4 border-[hsl(var(--theme-primary))]">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <Headphones className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
          <h2 className="text-2xl font-bold text-[var(--theme-text)] font-[var(--theme-fontPrimary)]">
            Listening Stats
          </h2>
        </div>
        <p className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)] mb-5">
          Real-world plays of {albumTitle} tracked by the ListenBrainz community
        </p>

        {!hasPlays ? (
          <p className="text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)]">
            No plays tracked yet for this album.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Music2 className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                <span className="text-xl font-bold text-[var(--theme-text)]">
                  {formatCount(stats.total_listen_count)}
                </span>
                <span className="text-sm text-[var(--theme-textMuted)]">total plays</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                <span className="text-xl font-bold text-[var(--theme-text)]">
                  {formatCount(stats.total_user_count)}
                </span>
                <span className="text-sm text-[var(--theme-textMuted)]">listeners</span>
              </div>
            </div>

            {stats.top_tracks.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--theme-textMuted)] mb-3">
                  Most Played Tracks
                </h3>
                <ol className="space-y-2">
                  {stats.top_tracks.slice(0, 5).map((track, i) => (
                    <li
                      key={`${track.name}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[hsl(var(--theme-primary))]/30 bg-[var(--theme-surface)]/20 px-3 py-2"
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="text-[hsl(var(--theme-primary))] font-bold w-5 shrink-0">
                          {i + 1}
                        </span>
                        <span className="truncate text-[var(--theme-text)] font-[var(--theme-fontSecondary)]">
                          {track.name}
                        </span>
                      </span>
                      <span className="text-sm text-[var(--theme-textMuted)] shrink-0">
                        {formatCount(track.listen_count)} plays
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AlbumListenStats;
