import { ExternalLink } from "lucide-react";
import { TrackVoteButton } from "./TrackVoteButton";
import { TrackArtistCredits } from "./TrackArtistCredits";
import { useTrackArtists } from "@/hooks/useTrackArtists";
import { cn } from "@/lib/utils";

interface AlbumTrack {
  id: string;
  track_number: number;
  title: string;
  duration_ms: number | null;
  vote_count: number;
  user_has_voted: boolean;
}

interface AlbumTrackListProps {
  tracks: AlbumTrack[];
  rapperName: string;
  onVote: (trackId: string) => Promise<any>;
  isVoting: boolean;
  showArtistCredits?: boolean;
}

const formatDuration = (durationMs: number | null) => {
  if (!durationMs) return null;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const generateGeniusUrl = (rapperName: string, trackTitle: string) => {
  const slug = `${rapperName} ${trackTitle}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `https://genius.com/${slug}-lyrics`;
};

export const AlbumTrackList = ({ tracks, rapperName, onVote, isVoting, showArtistCredits = true }: AlbumTrackListProps) => {
  // Fetch artist credits for all tracks
  const trackIds = tracks.map(t => t.id);
  const { data: artistsByTrack } = useTrackArtists(trackIds);

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tracks available for this album.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 rounded-lg overflow-hidden border border-border">
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className={cn(
            "flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50",
            index % 2 === 0 ? "bg-muted/30" : "bg-transparent",
          )}
        >
          <div className="flex-shrink-0 w-4 text-center text-sm text-muted-foreground">{track.track_number}</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-1">
              <span className="font-medium">
                {track.title}
              </span>
              {showArtistCredits && artistsByTrack?.[track.id] && (
                <TrackArtistCredits 
                  artists={artistsByTrack[track.id]} 
                  primaryRapperName={rapperName}
                />
              )}
            </div>
          </div>
          {track.duration_ms && (
            <div className="flex-shrink-0 text-sm text-muted-foreground hidden sm:block">
              {formatDuration(track.duration_ms)}
            </div>
          )}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <TrackVoteButton
              trackId={track.id}
              voteCount={track.vote_count}
              hasVoted={track.user_has_voted}
              onVote={onVote}
              disabled={isVoting}
            />
            <a
              href={generateGeniusUrl(rapperName, track.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-[hsl(var(--theme-primary))] text-black hover:opacity-80 transition-opacity"
            >
              <ExternalLink className="h-3 w-3" />
              Lyrics
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
