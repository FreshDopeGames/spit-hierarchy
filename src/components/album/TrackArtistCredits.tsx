import { Link } from "react-router-dom";

interface TrackArtist {
  id: string;
  artist_name: string;
  musicbrainz_artist_id: string | null;
  join_phrase: string | null;
  is_primary: boolean;
  position: number;
  rapper_id: string | null;
  rapper_slug?: string | null;
}

interface TrackArtistCreditsProps {
  artists: TrackArtist[];
  primaryRapperName?: string; // The rapper whose album page we're on
}

export const TrackArtistCredits = ({ artists, primaryRapperName }: TrackArtistCreditsProps) => {
  if (!artists || artists.length === 0) {
    return null;
  }

  // Sort by position to ensure correct order
  const sortedArtists = [...artists].sort((a, b) => a.position - b.position);

  // Check if we have featured artists (non-primary artists)
  const featuredArtists = sortedArtists.filter(a => !a.is_primary);
  
  // If we're on a specific rapper's album page, only show featured artists
  // that are different from the primary rapper
  const artistsToShow = primaryRapperName
    ? featuredArtists.filter(a => 
        a.artist_name.toLowerCase() !== primaryRapperName.toLowerCase()
      )
    : featuredArtists;

  if (artistsToShow.length === 0) {
    return null;
  }

  return (
    <span className="text-muted-foreground text-sm">
      {artistsToShow.map((artist, index) => {
        // Use the join phrase from the previous artist to prefix this one
        // For the first featured artist, use "feat." or the stored join phrase
        const prefix = index === 0 
          ? (sortedArtists.find(a => a.is_primary)?.join_phrase?.trim() || "feat.")
          : (artistsToShow[index - 1]?.join_phrase?.trim() || ",");
        
        return (
          <span key={artist.id}>
            {index === 0 && <span className="mx-1">{prefix}</span>}
            {index > 0 && <span>{prefix} </span>}
            {artist.rapper_id && artist.rapper_slug ? (
              <Link
                to={`/rapper/${artist.rapper_slug}`}
                className="hover:text-[var(--theme-primary)] hover:underline transition-colors"
              >
                {artist.artist_name}
              </Link>
            ) : (
              <span>{artist.artist_name}</span>
            )}
          </span>
        );
      })}
    </span>
  );
};

export default TrackArtistCredits;
