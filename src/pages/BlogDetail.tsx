
import { useParams } from "react-router-dom";
import CommentBubble from "@/components/CommentBubble";
import BackToTopButton from "@/components/BackToTopButton";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/hooks/useComments";
import InternalPageHeader from "@/components/InternalPageHeader";
import BlogDetailLoading from "@/components/blog/BlogDetailLoading";
import BlogDetailError from "@/components/blog/BlogDetailError";
import BlogDetailContent from "@/components/blog/BlogDetailContent";
import { useBlogPostBySlug } from "@/hooks/useBlogPostBySlug";
import { useRelatedPosts } from "@/hooks/useRelatedPosts";
import { transformBlogPost, transformRelatedPosts } from "@/utils/blogPostTransformers";

const BlogDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();

  // Fetch the blog post by slug
  const { data: blogPost, isLoading, error } = useBlogPostBySlug(slug);

  // Get comment data - use blog post ID when available
  const { totalComments } = useComments({ 
    contentType: "blog", 
    contentId: blogPost?.id || "" 
  });

  // Fetch related posts
  const { data: relatedPosts } = useRelatedPosts(blogPost?.category_id, blogPost?.id);

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
    return <BlogDetailLoading />;
  }

  if (error || !blogPost) {
    return <BlogDetailError />;
  }

  const transformedBlogPost = transformBlogPost(blogPost);
  const transformedRelatedPosts = transformRelatedPosts(relatedPosts || []);

  console.log('BlogDetail - Original blog post:', blogPost);
  console.log('BlogDetail - Transformed blog post:', transformedBlogPost);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <InternalPageHeader 
        backLink="/blog" 
        backText="Back to Blog" 
      />

      <BlogDetailContent
        blogPost={blogPost}
        transformedBlogPost={transformedBlogPost}
        transformedRelatedPosts={transformedRelatedPosts}
        totalComments={totalComments}
        user={user}
        onShare={handleShare}
        onCommentsClick={handleCommentsClick}
      />

      {/* Back to Top Button - positioned for pages with CommentBubble */}
      <BackToTopButton hasCommentBubble={true} />

      {/* Comment Bubble */}
      <div data-comment-bubble>
        <CommentBubble contentType="blog" contentId={blogPost?.id || ""} />
      </div>
    </div>
  );
};

export default BlogDetail;
