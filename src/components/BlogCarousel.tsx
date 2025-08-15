import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import useEmblaCarousel from 'embla-carousel-react';
const BlogCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
    containScroll: 'trimSnaps'
  });
  const {
    data: featuredPosts = [],
    isLoading
  } = useQuery({
    queryKey: ["latest-blog-posts"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("blog_posts").select(`
          id,
          slug,
          title,
          excerpt,
          featured_image_url,
          published_at,
          blog_categories(name)
        `).eq("status", "published").order("published_at", {
        ascending: false
      }).limit(5);
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
    // 10 minutes - blog posts don't change frequently
    refetchOnWindowFocus: false
  });
  const goToPrevious = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    } else {
      setCurrentIndex(prevIndex => prevIndex === 0 ? featuredPosts.length - 1 : prevIndex - 1);
    }
  }, [emblaApi, featuredPosts.length]);
  const goToNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
    } else {
      setCurrentIndex(prevIndex => prevIndex === featuredPosts.length - 1 ? 0 : prevIndex + 1);
    }
  }, [emblaApi, featuredPosts.length]);
  const scrollTo = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    } else {
      setCurrentIndex(index);
    }
  }, [emblaApi]);

  // Listen for slide changes
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Set up event listeners
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);
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
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-rap-platinum font-mogra">
          Featured Slick Talk
        </h2>
      </div>
      
      {/* Embla carousel container */}
      <div className="flex justify-center">
        <div className="relative max-w-4xl w-full overflow-hidden rounded-xl bg-carbon-fiber border border-rap-gold/30 shadow-lg shadow-rap-gold/20">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {featuredPosts.map(post => <div key={post.id} className="flex-[0_0_100%] min-w-0">
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] overflow-hidden cursor-pointer">
                      <ResponsiveImage src={getImageData(post)} alt={post.title} className="w-full h-full" context="carousel" objectFit="cover" sizes="(max-width: 768px) 100vw, 100vw" />
                      <div className="absolute bottom-0 left-0 right-0 h-[70%] sm:h-[80%] bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                      
                      <div className="absolute bottom-6 sm:bottom-0 left-0 p-4 sm:p-6 md:p-8 lg:p-10 text-white w-full">
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ceviche mb-2 sm:mb-3 md:mb-4 leading-tight drop-shadow-[2px_2px_8px_rgba(0,0,0,0.8)]">
                          {post.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm sm:text-base mb-3 sm:mb-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-rap-smoke" />
                            <span className="text-rap-smoke">
                              {format(new Date(post.published_at), "MMMM d, yyyy")}
                            </span>
                          </div>
                          {post.blog_categories?.name && <Badge className="bg-rap-forest/20 text-rap-forest border-rap-forest/30 text-xs sm:text-sm">
                              {post.blog_categories.name}
                            </Badge>}
                        </div>
                        <p className="text-rap-silver text-sm sm:text-base md:text-lg line-clamp-1 sm:line-clamp-2 md:line-clamp-3 mb-4 sm:mb-5 md:mb-6">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>)}
            </div>
          </div>
          
          <div className="absolute top-1/2 w-full flex justify-between items-center transform -translate-y-1/2 px-3 sm:px-4 drop-shadow z-10">
            <Button variant="ghost" size="icon" onClick={goToPrevious} className="rounded-full bg-black/60 hover:bg-black/100 hover:backdrop-blur-sm text-white hover:text-white h-10 w-10 sm:h-12 sm:w-12">
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-black/30 hover:bg-black/60 hover:backdrop-blur-sm text-white hover:text-white h-10 w-10 sm:h-12 sm:w-12" onClick={goToNext}>
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
              <span className="sr-only">Next</span>
            </Button>
          </div>

          <div className="absolute bottom-5 sm:bottom-6 md:bottom-8 left-0 w-full flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-10 z-10">
            <div></div> {/* Spacer */}
            <div className="flex gap-2 sm:gap-3">
              {featuredPosts.map((_, index) => <button key={index} className={`h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 rounded-full transition-all duration-300 ${currentIndex === index ? "bg-rap-gold scale-110" : "bg-gray-400 opacity-60 hover:opacity-80"}`} onClick={() => scrollTo(index)} />)}
            </div>
            <Link to={`/blog/${featuredPosts[currentIndex]?.slug}`}>
              <Button variant="link" className="text-rap-gold hover:text-rap-gold-light p-0 text-xs sm:text-sm h-auto">
                Read More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* More Articles Button - moved below carousel */}
      <div className="text-center mt-6">
        <Link to="/blog" onClick={() => window.scrollTo(0, 0)}>
          <Button variant="secondary" size="sm" className="bg-rap-gold/10 text-rap-gold hover:bg-rap-gold/20 border-rap-gold/30">
            More Slick Talk
          </Button>
        </Link>
      </div>
    </section>;
};
export default BlogCarousel;