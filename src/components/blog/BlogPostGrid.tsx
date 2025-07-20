
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

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

interface BlogPostGridProps {
  posts: BlogPost[];
  onTagClick: (tagSlug: string) => void;
}

const BlogPostGrid = ({ posts, onTagClick }: BlogPostGridProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const getImageData = (post: BlogPost) => {
    if (!post.featured_image_url) {
      return "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop";
    }
    
    try {
      return JSON.parse(post.featured_image_url);
    } catch {
      return post.featured_image_url;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {posts.map(post => (
        <Card key={post.id} className="bg-carbon-fiber border border-rap-gold/40 overflow-hidden shadow-xl shadow-rap-gold/20 hover:shadow-rap-gold/40 transition-all duration-300 group">
          <Link to={`/blog/${post.slug}`}>
            <div className="overflow-hidden hover:invert transition-all duration-300">
              <ResponsiveImage
                src={getImageData(post)}
                alt={post.title}
                className="w-full h-full"
                context="card"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </Link>
          
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-rap-smoke font-kaushan text-sm mb-3">
              <Calendar className="w-4 h-4" />
              <span className="font-merienda">{formatDate(post.published_at)}</span>
              {post.blog_categories?.name && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="border-rap-forest text-rap-forest font-merienda">
                    {post.blog_categories.name}
                  </Badge>
                </>
              )}
            </div>
            
            <Link to={`/blog/${post.slug}`}>
              <h3 className="font-ceviche text-rap-platinum hover:text-rap-gold transition-colors cursor-pointer mb-3 leading-tight text-4xl">
                {post.title}
              </h3>
            </Link>
            
            <p className="text-rap-silver font-merienda leading-relaxed mb-4">
              {post.excerpt || `${post.title.substring(0, 100)}...`}
            </p>

            {/* Tags */}
            {post.blog_post_tags && post.blog_post_tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {post.blog_post_tags.slice(0, 3).map((pt, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="border-rap-forest/50 text-rap-forest hover:bg-rap-forest/20 cursor-pointer text-xs" 
                    onClick={(e) => {
                      e.preventDefault();
                      onTagClick(pt.blog_tags.slug);
                    }}
                  >
                    <Tag className="w-2 h-2 mr-1" />
                    {pt.blog_tags.name}
                  </Badge>
                ))}
              </div>
            )}
            
            <Link to={`/blog/${post.slug}`}>
              <Button 
                variant="outline" 
                className="bg-rap-carbon-light border-2 border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20 group"
              >
                Read More
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BlogPostGrid;
