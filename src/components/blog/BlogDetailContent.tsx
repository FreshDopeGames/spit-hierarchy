
import BlogArticleHeader from "@/components/blog/BlogArticleHeader";
import BlogArticleContent from "@/components/blog/BlogArticleContent";
import BlogEngagementActions from "@/components/blog/BlogEngagementActions";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { Tables } from "@/integrations/supabase/types";

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

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  timeAgo: string;
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
  onCommentsClick
}: BlogDetailContentProps) => {
  return (
    <main className="max-w-4xl mx-auto p-6 pt-24">
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
            onShare={onShare}
            onCommentsClick={onCommentsClick}
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
  );
};

export default BlogDetailContent;
