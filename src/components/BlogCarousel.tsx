
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  blog_categories?: {
    name: string;
  };
}

const BlogCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const rotationTime = 8000; // 8 seconds

  // Fetch published blog posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['featured-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          excerpt,
          featured_image_url,
          published_at,
          blog_categories(name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as BlogPost[];
    }
  });

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentIndex(current => (current + 1) % posts.length);
          return 0;
        }
        return prev + 100 / (rotationTime / 100);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [posts]);

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-ceviche text-rap-gold mb-2 animate-text-glow tracking-wider">
            Sacred Scrolls of Knowledge
          </h2>
          <p className="text-rap-platinum font-kaushan text-lg">
            Chronicles from the Temple of Hip-Hop
          </p>
        </div>
        <Card className="bg-carbon-fiber border border-rap-gold/40 overflow-hidden shadow-2xl shadow-rap-gold/20">
          <CardContent className="p-8 text-center">
            <div className="text-rap-platinum">Loading sacred scrolls...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-ceviche text-rap-gold mb-2 animate-text-glow tracking-wider">
            Sacred Scrolls of Knowledge
          </h2>
          <p className="text-rap-platinum font-kaushan text-lg">
            Chronicles from the Temple of Hip-Hop
          </p>
        </div>
        <Card className="bg-carbon-fiber border border-rap-gold/40 overflow-hidden shadow-2xl shadow-rap-gold/20">
          <CardContent className="p-8 text-center">
            <div className="text-rap-platinum mb-4">No published scrolls yet. Check back soon for wisdom from the temple!</div>
          </CardContent>
        </Card>
        <div className="text-center mt-8">
          <Link to="/blog">
            <Button className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra shadow-lg shadow-rap-gold/30">
              <ArrowRight className="w-4 h-4 mr-2" />
              Explore All Sacred Scrolls
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPost = posts[currentIndex];
  const timeAgo = currentPost.published_at ? format(new Date(currentPost.published_at), 'MMMM d, yyyy') : 'Unknown date';

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-ceviche text-rap-gold mb-2 animate-text-glow tracking-wider">
          Sacred Scrolls of Knowledge
        </h2>
        <p className="text-rap-platinum font-kaushan text-lg">
          Chronicles from the Temple of Hip-Hop
        </p>
      </div>
      
      <Card className="bg-carbon-fiber border border-rap-gold/40 overflow-hidden shadow-2xl shadow-rap-gold/20 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest"></div>
        
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Featured Image */}
            <div className="md:w-1/2 relative">
              <Link to={`/blog/${currentPost.id}`}>
                <img 
                  src={currentPost.featured_image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop"} 
                  alt={currentPost.title} 
                  className="w-full h-64 md:h-80 object-cover hover:opacity-90 transition-opacity cursor-pointer" 
                />
              </Link>
              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-rap-burgundy to-rap-forest text-rap-platinum px-3 py-1 rounded-full text-sm font-mogra shadow-lg shadow-rap-burgundy/30">
                  Featured Scroll
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-rap-carbon/50 to-rap-carbon-light/50">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rap-smoke font-kaushan text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{timeAgo}</span>
                  {currentPost.blog_categories?.name && (
                    <>
                      <span>•</span>
                      <span>{currentPost.blog_categories.name}</span>
                    </>
                  )}
                </div>
                
                <Link to={`/blog/${currentPost.id}`}>
                  <h2 className="text-2xl text-rap-platinum leading-tight hover:text-rap-gold transition-colors cursor-pointer font-ceviche font-normal md:text-4xl">
                    {currentPost.title}
                  </h2>
                </Link>
                
                <p className="text-rap-silver text-lg leading-relaxed font-kaushan">
                  {currentPost.excerpt || currentPost.title}
                </p>
              </div>

              <div className="mt-6">
                <Link to={`/blog/${currentPost.id}`}>
                  <Button className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light group font-mogra shadow-lg shadow-rap-gold/30">
                    Read Full Hieroglyphs
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-1 bg-rap-carbon">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest transition-all duration-100" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 py-4 bg-carbon-fiber">
            {posts.map((_, index) => (
              <button 
                key={index} 
                onClick={() => {
                  setCurrentIndex(index);
                  setProgress(0);
                }} 
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-rap-gold shadow-lg shadow-rap-gold/50' 
                    : 'bg-rap-smoke hover:bg-rap-silver'
                }`} 
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View All Button - Now positioned below the carousel */}
      <div className="text-center mt-8">
        <Link to="/blog">
          <Button className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra shadow-lg shadow-rap-gold/30">
            <ArrowRight className="w-4 h-4 mr-2" />
            View All Sacred Scrolls
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BlogCarousel;
