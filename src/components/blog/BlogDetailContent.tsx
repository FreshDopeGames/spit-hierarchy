import BlogArticleHeader from "@/components/blog/BlogArticleHeader";
import BlogArticleContent from "@/components/blog/BlogArticleContent";
import BlogEngagementActions from "@/components/blog/BlogEngagementActions";
import BlogSidebar from "@/components/blog/BlogSidebar";
import BlogPoll from "@/components/polls/BlogPoll";
import ContentAdUnit from "@/components/ads/ContentAdUnit";
import { useBlogPostLikes } from "@/hooks/useBlogPostLikes";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  video_url: string;
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

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  timeAgo: string;
  slug: string;
}

interface BlogDetailContentProps {
  blogPost: BlogPost;
  transformedBlogPost: {
    title: string;
    tags: string[];
    author: string;
    timeAgo: string;
    readTime: string;
    featured_image_url?: string;
    video_url?: string;
  };
  transformedRelatedPosts: RelatedPost[];
  totalComments: number;
  user: any;
  onShare: (platform: string) => void;
  onCommentsClick: () => void;
}

const BlogDetailContent = ({
  blogPost,
  transformedBlogPost,
  transformedRelatedPosts,
  totalComments,
  user,
  onShare,
  onCommentsClick,
}: BlogDetailContentProps) => {
  const { likesCount, isLiked, toggleLike, isLoading } = useBlogPostLikes(blogPost.id);

  return (
    <main className="max-w-4xl mx-auto p-6 pt-24">
      <BlogArticleHeader blogPost={transformedBlogPost} />

      {/* Full-width main content */}
      <div className="space-y-8">
        <BlogArticleContent content={blogPost.content} />

        {/* Strategic ad placement in content */}
        <ContentAdUnit size="medium" />

        <BlogEngagementActions
          likes={likesCount}
          isLiked={isLiked}
          commentCount={totalComments}
          onLike={toggleLike}
          onShare={onShare}
          onCommentsClick={onCommentsClick}
          isLikeLoading={isLoading}
        />

        {/* Polls section */}
        <BlogPoll blogPostId={blogPost.id} />

        {/* Another ad placement */}
        <ContentAdUnit size="large" />

        {/* Sidebar content moved below */}
        <BlogSidebar relatedPosts={transformedRelatedPosts} showSignUp={!user} />
      </div>
    </main>
  );
};

export default BlogDetailContent;
