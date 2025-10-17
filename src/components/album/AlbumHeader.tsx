import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { getSmartAlbumPlaceholder } from "@/utils/albumPlaceholderUtils";

interface AlbumHeaderProps {
  albumTitle: string;
  rapperName: string;
  rapperSlug: string;
  coverArtUrl: string | null;
  releaseDate: string | null;
  releaseType: string;
  trackCount: number | null;
}

export const AlbumHeader = ({
  albumTitle,
  rapperName,
  rapperSlug,
  coverArtUrl,
  releaseDate,
  releaseType,
  trackCount,
}: AlbumHeaderProps) => {
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <div className="flex flex-col items-center text-center space-y-2">
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

      {/* Details - Centered */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "var(--theme-font-heading)" }}>
          {albumTitle}
        </h1>
        <Link
          to={`/rapper/${rapperSlug}`}
          className="text-xl md:text-2xl text-muted-foreground hover:text-[hsl(var(--theme-primary))] transition-colors"
        >
          {rapperName}
        </Link>
      </div>

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
