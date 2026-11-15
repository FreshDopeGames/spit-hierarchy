import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RapperBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string;
  isAlbumReview: boolean;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** True when the markdown/HTML content links to this rapper's page (or one of their album pages). */
export const contentMentionsRapper = (content: string | null | undefined, slug: string) => {
  if (!content || !slug) return false;
  const re = new RegExp(`/rapper/${escapeRegex(slug)}(?=[)/#?"'\\s\\]]|$)`, "i");
  return re.test(content);
};

const MAX_POSTS = 6;

export const useRapperBlogPosts = (rapperId: string | undefined, rapperSlug: string | undefined) => {
  return useQuery({
    queryKey: ["rapper-blog-posts", rapperId, rapperSlug],
    queryFn: async (): Promise<RapperBlogPost[]> => {
      if (!rapperId || !rapperSlug) return [];
      const nowIso = new Date().toISOString();

      // 1) Posts that link to this rapper's page
      const { data: linked, error: linkedError } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image_url, published_at, content")
        .eq("status", "published")
        .lte("published_at", nowIso)
        .ilike("content", `%/rapper/${rapperSlug}%`)
        .order("published_at", { ascending: false })
        .limit(50);
      if (linkedError) throw linkedError;

      // 2) Official album reviews of this rapper's albums
      const reviewPostIds = new Set<string>();
      const { data: links } = await supabase
        .from("rapper_albums")
        .select("album_id")
        .eq("rapper_id", rapperId);
      const albumIds = (links ?? []).map((l) => l.album_id).filter(Boolean);
      if (albumIds.length > 0) {
        const { data: reviews } = await supabase
          .from("album_reviews")
          .select("blog_post_id")
          .in("album_id", albumIds);
        (reviews ?? []).forEach((r) => r.blog_post_id && reviewPostIds.add(r.blog_post_id));
      }

      const byId = new Map<string, RapperBlogPost>();
      for (const p of linked ?? []) {
        if (!contentMentionsRapper(p.content, rapperSlug)) continue;
        byId.set(p.id, {
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          featured_image_url: p.featured_image_url,
          published_at: p.published_at,
          isAlbumReview: reviewPostIds.has(p.id),
        });
      }

      const missingReviewIds = [...reviewPostIds].filter((id) => !byId.has(id));
      if (missingReviewIds.length > 0) {
        const { data: reviewPosts, error } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, featured_image_url, published_at")
          .eq("status", "published")
          .lte("published_at", nowIso)
          .in("id", missingReviewIds);
        if (error) throw error;
        for (const p of reviewPosts ?? []) {
          byId.set(p.id, { ...p, isAlbumReview: true });
        }
      }

      return [...byId.values()]
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, MAX_POSTS);
    },
    enabled: !!rapperId && !!rapperSlug,
    staleTime: 15 * 60 * 1000,
  });
};
