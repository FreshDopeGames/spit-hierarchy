import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AlbumReviewScore {
  category_id: string;
  score: number;
  category_name?: string;
}

export interface AlbumReview {
  id: string;
  blog_post_id: string;
  album_id: string;
  overall_score: number;
  verdict: string | null;
  reviewer_id: string | null;
  created_at: string;
  scores: AlbumReviewScore[];
  album?: {
    id: string;
    title: string;
    slug: string;
    cover_art_url: string | null;
    cached_cover_url: string | null;
    release_date: string | null;
    release_type: string;
    rapper_name?: string;
    rapper_slug?: string;
  };
  blog_post?: {
    id: string;
    slug: string;
    title: string;
    status: string;
    published_at: string | null;
  };
}

const REVIEW_SELECT = `
  id, blog_post_id, album_id, overall_score, verdict, reviewer_id, created_at,
  album_review_scores ( category_id, score, album_voting_categories ( name, display_order ) ),
  albums ( id, title, slug, cover_art_url, cached_cover_url, release_date, release_type,
           rapper_albums ( rappers ( name, slug ) ) ),
  blog_posts ( id, slug, title, status, published_at )
`;

const mapReview = (row: any): AlbumReview | null => {
  if (!row) return null;
  const album = row.albums;
  const rapper = album?.rapper_albums?.[0]?.rappers;
  return {
    id: row.id,
    blog_post_id: row.blog_post_id,
    album_id: row.album_id,
    overall_score: Number(row.overall_score),
    verdict: row.verdict,
    reviewer_id: row.reviewer_id,
    created_at: row.created_at,
    scores: (row.album_review_scores || [])
      .map((s: any) => ({
        category_id: s.category_id,
        score: s.score,
        category_name: s.album_voting_categories?.name,
        display_order: s.album_voting_categories?.display_order ?? 0,
      }))
      .sort((a: any, b: any) => a.display_order - b.display_order),
    album: album
      ? {
          id: album.id,
          title: album.title,
          slug: album.slug,
          cover_art_url: album.cover_art_url,
          cached_cover_url: album.cached_cover_url,
          release_date: album.release_date,
          release_type: album.release_type,
          rapper_name: rapper?.name,
          rapper_slug: rapper?.slug,
        }
      : undefined,
    blog_post: row.blog_posts || undefined,
  };
};

export const useAlbumReviewByPost = (blogPostId: string | undefined) => {
  return useQuery({
    queryKey: ["album-review", "post", blogPostId],
    queryFn: async () => {
      if (!blogPostId) return null;
      const { data, error } = await supabase
        .from("album_reviews")
        .select(REVIEW_SELECT)
        .eq("blog_post_id", blogPostId)
        .maybeSingle();
      if (error) throw error;
      return mapReview(data);
    },
    enabled: !!blogPostId,
    staleTime: 1000 * 60,
  });
};

export const useAlbumReviewByAlbum = (albumId: string | undefined) => {
  return useQuery({
    queryKey: ["album-review", "album", albumId],
    queryFn: async () => {
      if (!albumId) return null;
      const { data, error } = await supabase
        .from("album_reviews")
        .select(REVIEW_SELECT)
        .eq("album_id", albumId)
        .maybeSingle();
      if (error) throw error;
      return mapReview(data);
    },
    enabled: !!albumId,
    staleTime: 1000 * 60,
  });
};

export interface SaveAlbumReviewArgs {
  blogPostId: string;
  albumId: string;
  overallScore: number;
  verdict: string;
  reviewerId?: string | null;
  scores: Array<{ categoryId: string; score: number }>;
}

export const useSaveAlbumReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: SaveAlbumReviewArgs) => {
      const { data: review, error } = await supabase
        .from("album_reviews")
        .upsert(
          {
            blog_post_id: args.blogPostId,
            album_id: args.albumId,
            overall_score: args.overallScore,
            verdict: args.verdict || null,
            reviewer_id: args.reviewerId || null,
          },
          { onConflict: "blog_post_id" },
        )
        .select("id");

      if (error) throw error;
      if (!review || review.length === 0) {
        throw new Error("Review did not save — you may not have permission");
      }

      const reviewId = review[0].id;

      if (args.scores.length > 0) {
        const { data: scoreRows, error: scoreError } = await supabase
          .from("album_review_scores")
          .upsert(
            args.scores.map((s) => ({
              review_id: reviewId,
              category_id: s.categoryId,
              score: s.score,
            })),
            { onConflict: "review_id,category_id" },
          )
          .select("id");

        if (scoreError) throw scoreError;
        if (!scoreRows || scoreRows.length === 0) {
          throw new Error("Review metrics did not save");
        }
      }

      return { id: reviewId, albumId: args.albumId, blogPostId: args.blogPostId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["album-review", "post", result.blogPostId] });
      queryClient.invalidateQueries({ queryKey: ["album-review", "album", result.albumId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save album review");
    },
  });
};

export const useDeleteAlbumReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogPostId: string) => {
      const { data, error } = await supabase
        .from("album_reviews")
        .delete()
        .eq("blog_post_id", blogPostId)
        .select("id");
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, blogPostId) => {
      queryClient.invalidateQueries({ queryKey: ["album-review", "post", blogPostId] });
      queryClient.invalidateQueries({ queryKey: ["album-review"] });
    },
  });
};
