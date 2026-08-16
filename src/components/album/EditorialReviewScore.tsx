import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useAlbumReviewByAlbum } from "@/hooks/useAlbumReview";

interface Props {
  albumId: string;
}

const EditorialReviewScore = ({ albumId }: Props) => {
  const { data: review } = useAlbumReviewByAlbum(albumId);

  if (!review) return null;

  const post = review.blog_post;
  const isVisible =
    post &&
    post.status === "published" &&
    (!post.published_at || new Date(post.published_at) <= new Date());

  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2 text-[hsl(var(--theme-text))]">
        <Star className="w-5 h-5 fill-[hsl(var(--theme-primary))] text-[hsl(var(--theme-primary))]" />
        <span className="text-sm text-[hsl(var(--theme-textMuted))]">Spit Hierarchy Review:</span>
        <span className="text-2xl font-bold">{review.overall_score.toFixed(1)}/5</span>
      </div>
      <Link
        to={`/blog/${post!.slug}`}
        className="text-xs text-[hsl(var(--theme-primary))] hover:underline"
      >
        Read the full review
      </Link>
    </div>
  );
};

export default EditorialReviewScore;
