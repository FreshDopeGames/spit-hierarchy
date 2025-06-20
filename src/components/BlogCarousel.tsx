import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
const BlogCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {
    data: featuredPosts = [],
    isLoading
  } = useQuery({
    queryKey: ["featured-blog-posts"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("blog_posts").select(`
          id,
          title,
          excerpt,
          featured_image_url,
          published_at,
          blog_categories(name)
        `).eq("status", "published").eq("featured", true).order("published_at", {
        ascending: false
      }).limit(5);
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
    // 10 minutes - blog posts don't change frequently
    refetchOnWindowFocus: false
  });
  const goToPrevious = () => {
    setCurrentIndex(prevIndex => prevIndex === 0 ? featuredPosts.length - 1 : prevIndex - 1);
  };
  const goToNext = () => {
    setCurrentIndex(prevIndex => prevIndex === featuredPosts.length - 1 ? 0 : prevIndex + 1);
  };
  const getImageData = (post: any) => {
    if (!post.featured_image_url) {
      return "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop";
    }
    try {
      return JSON.parse(post.featured_image_url);
    } catch {
      return post.featured_image_url;
    }
  };
  if (isLoading || featuredPosts.length === 0) return null;
  return <section className="mb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-rap-platinum font-merienda text-center">FEATURED SLICK TALK</h2>
        <Link to="/blog">
          <Button variant="secondary" size="sm" className="bg-rap-gold/10 text-rap-gold hover:bg-rap-gold/20 border-rap-gold/30">
            More Articles
          </Button>
        </Link>
      </div>
      
      {/* Dynamic width carousel container */}
      <div className="flex justify-center">
        <div className="relative max-w-4xl w-full overflow-hidden rounded-xl bg-carbon-fiber border border-rap-gold/30 shadow-lg shadow-rap-gold/20">
          <div className="flex transition-transform duration-500 ease-in-out" style={{
          transform: `translateX(-${currentIndex * 100}%)`
        }}>
            {featuredPosts.map(post => <div key={post.id} className="w-full flex-shrink-0">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <ResponsiveImage src={getImageData(post)} alt={post.title} className="w-full h-full" context="carousel" objectFit="cover" sizes="(max-width: 768px) 100vw, 100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                    {post.blog_categories?.name && <Badge className="mb-2 bg-rap-forest/20 text-rap-forest border-rap-forest/30">
                        {post.blog_categories.name}
                      </Badge>}
                    <h3 className="text-2xl font-bold font-ceviche mb-2">{post.title}</h3>
                    <div className="flex items-center text-sm mb-3">
                      <Calendar className="w-4 h-4 mr-2 text-rap-smoke" />
                      <span className="text-rap-smoke">
                        {format(new Date(post.published_at), "MMMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-rap-silver line-clamp-2">{post.excerpt}</p>
                    <Link to={`/blog/${post.id}`}>
                      <Button variant="link" className="mt-4 text-rap-gold hover:text-rap-gold-light p-0">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>)}
          </div>
          
          <div className="absolute top-1/2 w-full flex justify-between items-center transform -translate-y-1/2 px-4">
            <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/50 text-white" onClick={goToPrevious}>
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/50 text-white" onClick={goToNext}>
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next</span>
            </Button>
          </div>

          <div className="absolute bottom-2 left-0 w-full flex justify-center gap-2">
            {featuredPosts.map((_, index) => <button key={index} className={`h-2 w-2 rounded-full transition-colors duration-300 ${currentIndex === index ? "bg-rap-gold" : "bg-gray-500 opacity-50 hover:opacity-75"}`} onClick={() => setCurrentIndex(index)} />)}
          </div>
        </div>
      </div>
    </section>;
};
export default BlogCarousel;