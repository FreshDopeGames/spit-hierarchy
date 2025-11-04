
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HeaderNavigation from "@/components/HeaderNavigation";
import BlogPageHeader from "@/components/blog/BlogPageHeader";
import BlogFilters from "@/components/blog/BlogFilters";
import BlogPostGrid from "@/components/blog/BlogPostGrid";
import BlogLoadingState from "@/components/blog/BlogLoadingState";
import BlogEmptyState from "@/components/blog/BlogEmptyState";
import BlogLoadMoreButton from "@/components/blog/BlogLoadMoreButton";
import BackToTopButton from "@/components/BackToTopButton";
import Footer from "@/components/Footer";
import { usePageVisitTracking } from "@/hooks/usePageVisitTracking";
import SEOHead from "@/components/seo/SEOHead";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  author_id: string;
  slug: string;
  blog_categories?: {
    name: string;
  };
  blog_post_tags?: Array<{
    blog_tags: {
      name: string;
      slug: string;
    };
  }>;
}

const POSTS_PER_PAGE = 6;

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedTag = searchParams.get('tag') || '';

  // Track page visit for achievements
  usePageVisitTracking('blog_visits');

  // Fetch blog categories
  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('id, name, slug')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch blog tags
  const { data: tags } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('id, name, slug')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Infinite query for blog posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['blog-posts', selectedCategory, selectedTag],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          excerpt,
          featured_image_url,
          published_at,
          author_id,
          slug,
          blog_categories(name),
          blog_post_tags(
            blog_tags(
              name,
              slug
            )
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1);

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by tag if specified
      if (selectedTag) {
        return data.filter(post => 
          post.blog_post_tags?.some(pt => pt.blog_tags.slug === selectedTag)
        ) as BlogPost[];
      }
      return data as BlogPost[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === POSTS_PER_PAGE ? allPages.length : undefined;
    },
    initialPageParam: 0
  });

  const posts = data?.pages.flat() || [];

  const handleCategoryChange = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    newParams.delete('tag'); // Clear tag when changing category
    setSearchParams(newParams);
  };

  const handleTagChange = (tagSlug: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (tagSlug === 'all') {
      newParams.delete('tag');
    } else {
      newParams.set('tag', tagSlug);
    }
    newParams.delete('category'); // Clear category when filtering by tag
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex flex-col">
        <HeaderNavigation isScrolled={false} />
        <main className="flex-1 max-w-6xl mx-auto p-6 pt-24">
          <BlogPageHeader title="SLICK TALK" />
          <div className="text-center py-12">
            <p className="text-rap-platinum">Error loading blog posts. Please try again later.</p>
          </div>
        </main>
        <BackToTopButton hasCommentBubble={false} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex flex-col">
      <SEOHead
        title="Slick Talk Blog - Hip-Hop News, Rankings & Culture | Spit Hierarchy"
        description="Explore the latest in hip-hop culture, rapper spotlights, album reviews, and industry insights. Stay updated with Slick Talk, Spit Hierarchy's official blog."
        keywords={['hip hop blog', 'rap news', 'music reviews', 'rapper interviews', 'album reviews', 'hip hop culture']}
        canonicalUrl="/blog"
      />
      <HeaderNavigation isScrolled={false} />
      
      <main className="flex-1 max-w-6xl mx-auto p-6 pt-24">
        <BlogPageHeader title="SLICK TALK" />

        <BlogFilters
          categories={categories}
          tags={tags}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          onCategoryChange={handleCategoryChange}
          onTagChange={handleTagChange}
          onClearFilters={clearFilters}
        />

        {/* Loading State */}
        {isLoading && <BlogLoadingState />}

        {/* Blog Posts Grid */}
        {!isLoading && posts.length > 0 && (
          <>
            <BlogPostGrid posts={posts} onTagClick={handleTagChange} />
            <BlogLoadMoreButton
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          </>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <BlogEmptyState
            hasFilters={selectedCategory !== 'all' || !!selectedTag}
            onClearFilters={clearFilters}
          />
        )}
      </main>

      {/* Back to Top Button - positioned for pages without CommentBubble */}
      <BackToTopButton hasCommentBubble={false} />
      <Footer />
    </div>
  );
};

export default Blog;
