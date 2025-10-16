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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/rappers" className="hover:text-foreground transition-colors">
          Rappers
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          to={`/rapper/${rapperSlug}`}
          className="hover:text-foreground transition-colors"
        >
          {rapperName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{albumTitle}</span>
      </nav>

      {/* Album Info */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Cover Art */}
        <div className="flex-shrink-0">
          {coverArtUrl ? (
            <img
              src={coverArtUrl}
              alt={`${albumTitle} cover art`}
              className="w-64 h-64 md:w-80 md:h-80 rounded-lg shadow-lg object-cover"
            />
          ) : (
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-lg shadow-lg bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No cover art</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "var(--theme-font-heading)" }}>
              {albumTitle}
            </h1>
            <Link
              to={`/rapper/${rapperSlug}`}
              className="text-xl text-muted-foreground hover:text-foreground transition-colors"
            >
              {rapperName}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="capitalize">
              {releaseType}
            </Badge>
            {releaseYear && (
              <span className="text-sm text-muted-foreground">{releaseYear}</span>
            )}
            {trackCount && (
              <span className="text-sm text-muted-foreground">
                {trackCount} {trackCount === 1 ? "track" : "tracks"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
