import { TrackVoteButton } from "./TrackVoteButton";
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

export const AlbumTrackList = ({ tracks, rapperName, onVote, isVoting }: AlbumTrackListProps) => {
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
            <a
              href={generateGeniusUrl(rapperName, track.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-[var(--theme-primary)] transition-colors hover:underline"
            >
              {track.title}
            </a>
          </div>
          {track.duration_ms && (
            <div className="flex-shrink-0 text-sm text-muted-foreground hidden sm:block">
              {formatDuration(track.duration_ms)}
            </div>
          )}
          <div className="flex-shrink-0">
            <TrackVoteButton
              trackId={track.id}
              voteCount={track.vote_count}
              hasVoted={track.user_has_voted}
              onVote={onVote}
              disabled={isVoting}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
