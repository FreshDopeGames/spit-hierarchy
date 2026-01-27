import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ThemedButton } from "@/components/ui/themed-button";
import { Music } from "lucide-react";
import RapperAvatar from "@/components/RapperAvatar";

interface AlbumHeaderProps {
  rapperId: string;
  albumTitle: string;
  rapperName: string;
  rapperSlug: string;
  coverArtUrl: string | null;
  releaseDate: string | null;
  releaseType: string;
  trackCount: number | null;
  externalLinks?: {
    spotify?: string;
    appleMusic?: string;
  };
}

export const AlbumHeader = ({
  rapperId,
  albumTitle,
  rapperName,
  rapperSlug,
  coverArtUrl,
  releaseDate,
  releaseType,
  trackCount,
  externalLinks,
}: AlbumHeaderProps) => {
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Cover Art - Centered and Large */}
      <div className="flex-shrink-0">
        {coverArtUrl ? (
          <img
            src={coverArtUrl}
            alt={`${albumTitle} cover art`}
            className="w-80 h-80 md:w-96 md:h-96 rounded-lg shadow-2xl object-cover mx-auto"
          />
        ) : (
          <div className="w-80 h-80 md:w-96 md:h-96 rounded-lg shadow-2xl bg-muted flex items-center justify-center mx-auto">
            <span className="text-muted-foreground">No cover art</span>
          </div>
        )}
      </div>

      {/* Album Title */}
      <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--theme-font-heading)" }}>
        {albumTitle}
      </h1>

      {/* Artist Row: Avatar + Name (left) and Streaming Buttons (right) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mx-auto">
        {/* Left: Avatar + Name */}
        <div className="flex items-center gap-3">
          <RapperAvatar
            rapper={{
              id: rapperId,
              name: rapperName,
              slug: rapperSlug
            }}
            size="sm"
            variant="square"
          />
          <Link
            to={`/rapper/${rapperSlug}`}
            className="text-lg md:text-xl text-muted-foreground hover:text-[hsl(var(--theme-primary))] transition-colors font-semibold"
          >
            {rapperName}
          </Link>
        </div>

        {/* Right: Streaming Buttons */}
        {(externalLinks?.spotify || externalLinks?.appleMusic) && (
          <div className="flex items-center gap-2">
            {externalLinks?.spotify && (
              <ThemedButton
                variant="default"
                size="sm"
                className="!bg-[hsl(var(--theme-primary))] !text-black hover:!bg-[hsl(var(--theme-primaryLight))] !border-0"
                asChild
              >
                <a href={externalLinks.spotify} target="_blank" rel="noopener noreferrer">
                  <Music className="w-4 h-4 mr-2" />
                  Spotify
                </a>
              </ThemedButton>
            )}
            {externalLinks?.appleMusic && (
              <ThemedButton
                variant="default"
                size="sm"
                className="!bg-[hsl(var(--theme-primary))] !text-black hover:!bg-[hsl(var(--theme-primaryLight))] !border-0"
                asChild
              >
                <a href={externalLinks.appleMusic} target="_blank" rel="noopener noreferrer">
                  <Music className="w-4 h-4 mr-2" />
                  Apple Music
                </a>
              </ThemedButton>
            )}
          </div>
        )}
      </div>

      {/* Metadata Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Badge variant="secondary" className="capitalize">
          {releaseType}
        </Badge>
        {releaseYear && <span className="text-sm text-muted-foreground">{releaseYear}</span>}
        {trackCount && (
          <span className="text-sm text-muted-foreground">
            {trackCount} {trackCount === 1 ? "track" : "tracks"}
          </span>
        )}
      </div>
    </div>
  );
};
