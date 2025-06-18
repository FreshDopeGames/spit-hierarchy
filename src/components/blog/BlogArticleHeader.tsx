
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User } from "lucide-react";

interface BlogPost {
  title: string;
  tags: string[];
  author: string;
  timeAgo: string;
  readTime: string;
  imageUrl?: string;
  featured_image_url?: string;
}

interface BlogArticleHeaderProps {
  blogPost: BlogPost;
}

const BlogArticleHeader = ({ blogPost }: BlogArticleHeaderProps) => {
  // Use featured_image_url from database or fallback to imageUrl
  const featuredImage = blogPost.featured_image_url || blogPost.imageUrl;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 mb-4">
        {blogPost.tags.map(tag => (
          <Badge key={tag} variant="secondary" className="bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-[var(--theme-primary)]/30">
            {tag}
          </Badge>
        ))}
      </div>
      
      <h1 className="text-4xl text-[var(--theme-textLight)] mb-6 leading-tight font-[[var(--theme-font-heading)]] font-ceviche font-normal text-rap-gold md:text-6xl">
        {blogPost.title}
      </h1>
      
      <div className="flex flex-wrap items-center gap-6 text-[var(--theme-textMuted)] mb-6">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="font-[var(--theme-font-body)]">{blogPost.author}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="font-[var(--theme-font-body)]">{blogPost.timeAgo}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-[var(--theme-font-body)]">{blogPost.readTime}</span>
        </div>
      </div>

      {/* Featured Image - only show if image exists */}
      {featuredImage && (
        <div className="relative rounded-xl overflow-hidden mb-8">
          <img 
            src={featuredImage} 
            alt={blogPost.title} 
            className="w-full h-64 md:h-96 object-cover" 
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-backgroundDark)]/30 to-transparent" />
        </div>
      )}
    </div>
  );
};

export default BlogArticleHeader;
