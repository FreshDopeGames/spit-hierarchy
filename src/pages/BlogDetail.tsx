
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CommentBubble from "@/components/CommentBubble";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/hooks/useComments";
import BlogDetailHeader from "@/components/blog/BlogDetailHeader";
import BlogArticleHeader from "@/components/blog/BlogArticleHeader";
import BlogArticleContent from "@/components/blog/BlogArticleContent";
import BlogEngagementActions from "@/components/blog/BlogEngagementActions";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  author_id: string;
  category_id: string;
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

const BlogDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  // Get comment data
  const { totalComments } = useComments({ 
    contentType: "blog", 
    contentId: id || "" 
  });

  // Fetch the blog post
  const { data: blogPost, isLoading, error } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          content,
          excerpt,
          featured_image_url,
          published_at,
          author_id,
          category_id,
          blog_categories(name),
          blog_post_tags(
            blog_tags(
              name,
              slug
            )
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();
      
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id
  });

  // Fetch related posts
  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', blogPost?.category_id],
    queryFn: async () => {
      if (!blogPost?.category_id) return [];
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          excerpt,
          featured_image_url,
          published_at
        `)
        .eq('status', 'published')
        .eq('category_id', blogPost.category_id)
        .neq('id', blogPost.id)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!blogPost?.category_id
  });

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this article: ${blogPost?.title}`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
    }
  };

  const handleCommentsClick = () => {
    // Scroll to comment bubble or trigger it to open
    const commentBubble = document.querySelector('[data-comment-bubble]');
    if (commentBubble) {
      commentBubble.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
        <BlogDetailHeader onShare={handleShare} />
        <main className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-rap-carbon rounded mb-4"></div>
            <div className="h-64 bg-rap-carbon rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-rap-carbon rounded"></div>
              <div className="h-4 bg-rap-carbon rounded"></div>
              <div className="h-4 bg-rap-carbon rounded w-3/4"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
        <BlogDetailHeader onShare={handleShare} />
        <main className="max-w-4xl mx-auto p-6">
          <Card className="bg-carbon-fiber border border-rap-gold/40">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-ceviche text-rap-gold mb-4">Sacred Scroll Not Found</h1>
              <p className="text-rap-platinum mb-6">This scroll may have been lost to the winds of time.</p>
              <Link to="/blog" className="text-rap-gold hover:text-rap-gold-light">
                Return to Sacred Scrolls
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const transformedBlogPost = {
    title: blogPost.title,
    tags: blogPost.blog_post_tags?.map(pt => pt.blog_tags.name) || [],
    author: "Temple Scribe",
    timeAgo: formatDate(blogPost.published_at),
    readTime: "5 min read",
    featured_image_url: blogPost.featured_image_url
  };

  console.log('BlogDetail - Original blog post:', blogPost);
  console.log('BlogDetail - Transformed blog post:', transformedBlogPost);

  const transformedRelatedPosts = relatedPosts?.map(post => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || `${post.title.substring(0, 100)}...`,
    imageUrl: post.featured_image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
    timeAgo: formatDate(post.published_at)
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <BlogDetailHeader onShare={handleShare} />

      <main className="max-w-4xl mx-auto p-6">
        <BlogArticleHeader blogPost={transformedBlogPost} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <BlogArticleContent content={blogPost.content} />
            <BlogEngagementActions 
              likes={0}
              isLiked={false}
              isBookmarked={false}
              commentCount={totalComments}
              onShare={handleShare}
              onCommentsClick={handleCommentsClick}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar 
              relatedPosts={transformedRelatedPosts}
              showSignUp={!user}
            />
          </div>
        </div>
      </main>

      {/* Comment Bubble */}
      <div data-comment-bubble>
        <CommentBubble contentType="blog" contentId={id || ""} />
      </div>
    </div>
  );
};

export default BlogDetail;
