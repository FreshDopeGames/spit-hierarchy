import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { AlbumReview } from "@/hooks/useAlbumReview";

interface Props {
  review: AlbumReview;
}

const StarRow = ({ score }: { score: number }) => {
  return (
    <div className="flex items-center gap-1" aria-label={`${score} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = score >= i;
        const half = !filled && score >= i - 0.5;
        return (
          <span key={i} className="relative inline-block w-6 h-6">
            <Star className="absolute inset-0 w-6 h-6 text-[hsl(var(--theme-primary))]" />
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : "50%" }}
              >
                <Star className="w-6 h-6 fill-[hsl(var(--theme-primary))] text-[hsl(var(--theme-primary))]" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

const AlbumReviewCard = ({ review }: Props) => {
  const album = review.album;
  if (!album) return null;

  const cover = album.cached_cover_url || album.cover_art_url;
  const albumUrl = album.rapper_slug ? `/rapper/${album.rapper_slug}/${album.slug}` : null;

  return (
    <section className="rounded-lg border-4 border-[hsl(var(--theme-primary))] bg-[hsl(var(--theme-surface))] p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-5">
        {cover ? (
          <img
            src={cover}
            alt={`${album.title} album cover`}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded object-cover mx-auto sm:mx-0"
            loading="lazy"
          />
        ) : (
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded bg-black/40 mx-auto sm:mx-0" />
        )}

        <div className="flex-1 space-y-3 text-center sm:text-left">
          <p className="text-xs uppercase tracking-widest text-[hsl(var(--theme-primary))] font-semibold">
            Official Spit Hierarchy Review
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--theme-text))]" style={{ fontFamily: "var(--theme-font-heading)" }}>
            {albumUrl ? (
              <Link to={albumUrl} className="hover:text-[hsl(var(--theme-primary))] transition-colors">
                {album.title}
              </Link>
            ) : (
              album.title
            )}
          </h2>

          {album.rapper_name && album.rapper_slug && (
            <Link
              to={`/rapper/${album.rapper_slug}`}
              className="inline-block text-[hsl(var(--theme-textMuted))] hover:text-[hsl(var(--theme-primary))] transition-colors"
            >
              {album.rapper_name}
            </Link>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <StarRow score={review.overall_score} />
            <span className="text-3xl font-bold text-[hsl(var(--theme-text))]">
              {review.overall_score.toFixed(1)}
              <span className="text-lg text-[hsl(var(--theme-textMuted))]">/5</span>
            </span>
          </div>

          {review.verdict && (
            <p className="text-[hsl(var(--theme-text))] italic">{review.verdict}</p>
          )}
        </div>
      </div>

      {review.scores.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {review.scores.map((s) => (
            <div key={s.category_id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--theme-textMuted))]">{s.category_name}</span>
                <span className="font-semibold text-[hsl(var(--theme-text))]">{s.score}/10</span>
              </div>
              <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                <div
                  className="h-full bg-[hsl(var(--theme-primary))]"
                  style={{ width: `${(s.score / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AlbumReviewCard;
