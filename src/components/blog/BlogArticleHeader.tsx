import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User } from "lucide-react";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { UsernameLink } from "@/components/profile/UsernameLink";

interface BlogPost {
  title: string;
  tags: string[];
  author: string;
  authorId: string;
  authorUsername: string;
  timeAgo: string;
  readTime: string;
  featured_image_url?: string;
  video_url?: string;
}

interface BlogArticleHeaderProps {
  blogPost: BlogPost;
}

const BlogArticleHeader = ({ blogPost }: BlogArticleHeaderProps) => {
  console.log('BlogArticleHeader - Featured image URL:', blogPost.featured_image_url);

  // Parse featured image data
  const getFeaturedImageData = () => {
    if (!blogPost.featured_image_url) return null;
    
    try {
      return JSON.parse(blogPost.featured_image_url);
    } catch {
      // Fallback for single URL format
      return blogPost.featured_image_url;
    }
  };

  const featuredImageData = getFeaturedImageData();

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 mb-4">
        {blogPost.tags.map(tag => (
          <Badge key={tag} variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30">
            {tag}
          </Badge>
        ))}
      </div>
      
      <h1 className="text-4xl text-rap-gold mb-6 leading-tight font-ceviche font-normal md:text-6xl">
        {blogPost.title}
      </h1>
      
      <div className="flex flex-wrap items-center gap-6 text-rap-smoke mb-6">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <UsernameLink 
            userId={blogPost.authorId}
            username={blogPost.author}
            className="font-merienda"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="font-merienda">{blogPost.timeAgo}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-merienda">{blogPost.readTime}</span>
        </div>
      </div>

      {/* Featured Video or Image - show full aspect ratio with optimized sizing */}
      {(blogPost.video_url || featuredImageData) && (
        <div className="relative rounded-xl overflow-hidden mb-8">
          <VideoPlayer
            videoUrl={blogPost.video_url}
            fallbackImageUrl={featuredImageData}
            alt={blogPost.title}
            className="w-full h-auto rounded-xl"
          />
        </div>
      )}
    </div>
  );
};

export default BlogArticleHeader;
