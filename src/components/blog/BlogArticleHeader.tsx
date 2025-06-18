
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User } from "lucide-react";

interface BlogPost {
  title: string;
  tags: string[];
  author: string;
  timeAgo: string;
  readTime: string;
  featured_image_url?: string;
}

interface BlogArticleHeaderProps {
  blogPost: BlogPost;
}

const BlogArticleHeader = ({ blogPost }: BlogArticleHeaderProps) => {
  console.log('BlogArticleHeader - Featured image URL:', blogPost.featured_image_url);

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
          <span className="font-merienda">{blogPost.author}</span>
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

      {/* Featured Image - only show if image exists */}
      {blogPost.featured_image_url && (
        <div className="relative rounded-xl overflow-hidden mb-8">
          <img 
            src={blogPost.featured_image_url} 
            alt={blogPost.title} 
            className="w-full h-64 md:h-96 object-cover" 
            onError={(e) => {
              console.error('Failed to load blog post image:', blogPost.featured_image_url);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Successfully loaded blog post image:', blogPost.featured_image_url);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}
    </div>
  );
};

export default BlogArticleHeader;
