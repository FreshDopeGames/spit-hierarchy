import { useState, useCallback, useEffect, useRef } from "react";
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
  const [isProgressActive, setIsProgressActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const autoRotateIntervalRef = useRef<NodeJS.Timeout>();
  const progressKeyRef = useRef(0);
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

  const autoRotateToNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
    } else {
      setCurrentIndex(prevIndex => prevIndex === featuredPosts.length - 1 ? 0 : prevIndex + 1);
    }
    // Reset progress bar after auto-rotation
    setTimeout(() => {
      progressKeyRef.current += 1;
      setIsProgressActive(false);
      setTimeout(() => setIsProgressActive(true), 50);
    }, 100);
  }, [emblaApi, featuredPosts.length]);

  const resetAutoRotate = useCallback(() => {
    if (autoRotateIntervalRef.current) {
      clearInterval(autoRotateIntervalRef.current);
    }
    progressKeyRef.current += 1; // Force progress bar restart
    setIsProgressActive(false);
    setTimeout(() => setIsProgressActive(true), 50);
    
    if (!isPaused && featuredPosts.length > 1) {
      autoRotateIntervalRef.current = setInterval(autoRotateToNext, 8000);
    }
  }, [isPaused, featuredPosts.length, autoRotateToNext]);

  const goToPrevious = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    } else {
      setCurrentIndex(prevIndex => prevIndex === 0 ? featuredPosts.length - 1 : prevIndex - 1);
    }
    resetAutoRotate();
  }, [emblaApi, featuredPosts.length, resetAutoRotate]);

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
    resetAutoRotate();
  }, [emblaApi, resetAutoRotate]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-rotation setup
  useEffect(() => {
    resetAutoRotate();
    return () => {
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current);
      }
    };
  }, [resetAutoRotate]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (autoRotateIntervalRef.current) {
      clearInterval(autoRotateIntervalRef.current);
    }
    setIsProgressActive(false);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    resetAutoRotate();
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
      {/* Embla carousel container */}
      <div className="flex justify-center">
        <div 
          className="relative max-w-4xl w-full overflow-hidden rounded-xl bg-[var(--theme-surface)] border-4 border-[color:var(--theme-primary)]/30 shadow-lg shadow-[color:var(--theme-primary)]/20"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {featuredPosts.map(post => <div key={post.id} className="flex-[0_0_100%] min-w-0">
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-[3/2] sm:aspect-[16/9] md:aspect-[16/10] overflow-hidden cursor-pointer">
                      <ResponsiveImage src={getImageData(post)} alt={post.title} className="w-full h-full" context="carousel" objectFit="cover" sizes="(max-width: 768px) 100vw, 100vw" />
                      <div className="absolute bottom-0 left-0 right-0 h-[75%] sm:h-[80%] md:h-[70%] bg-gradient-to-t from-[var(--theme-background)]/95 via-[var(--theme-background)]/50 to-transparent" />
                      
                       <div className="absolute bottom-6 sm:bottom-0 left-0 p-4 sm:p-6 md:p-8 lg:p-10 text-white w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-[var(--theme-font-heading)] mb-2 sm:mb-3 md:mb-4 leading-tight drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]">
                          {post.title}
                        </h3>
                        <div className="flex items-center text-sm sm:text-base mb-3 sm:mb-4 gap-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[color:var(--theme-textMuted)] drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]" />
                            <span className="text-[color:var(--theme-textMuted)] drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]">
                              {format(new Date(post.published_at), "MMMM d, yyyy")}
                            </span>
                          </div>
                          {post.blog_categories?.name && <Badge className="bg-[color:var(--theme-accent)]/20 text-[color:var(--theme-accent)] border-[color:var(--theme-accent)]/30 text-xs sm:text-sm drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]">
                              {post.blog_categories.name}
                            </Badge>}
                        </div>
                        <p className="text-[color:var(--theme-textMuted)] text-sm sm:text-base md:text-lg line-clamp-1 sm:line-clamp-2 md:line-clamp-3 mb-4 sm:mb-5 md:mb-6 drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]">
                          {post.excerpt}
                        </p>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/30">
                        <div 
                          key={progressKeyRef.current}
                          className={`h-full bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] transition-all ${
                            isProgressActive && !isPaused ? 'animate-[progress_8000ms_linear_forwards]' : 'w-0'
                          }`}
                        />
                      </div>
                    </div>
                  </Link>
                </div>)}
            </div>
          </div>
          
          <div className="absolute top-1/2 w-full flex justify-between items-center transform -translate-y-1/2 px-3 sm:px-4 drop-shadow z-10">
            <Button variant="ghost" size="icon" className="rounded-full bg-black/60 hover:bg-black hover:backdrop-blur-sm text-white hover:text-white h-10 w-10 sm:h-24 sm:w-24" onClick={goToPrevious}>
              <ChevronLeft className="h-5 w-5 sm:h-8 sm:w-8 relative z-10" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-black/60 hover:bg-black hover:backdrop-blur-sm text-white hover:text-white h-10 w-10 sm:h-24 sm:w-24" onClick={goToNext}>
              <ChevronRight className="h-5 w-5 sm:h-8 sm:w-8 relative z-10" />
              <span className="sr-only">Next</span>
            </Button>
          </div>

          <div className="absolute bottom-5 sm:bottom-6 md:bottom-8 left-0 w-full flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-10 z-10">
            <div></div> {/* Spacer */}
            <div className="flex gap-2 sm:gap-3">
              {featuredPosts.map((_, index) => <button key={index} className={`h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 rounded-full transition-all duration-300 drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] ${currentIndex === index ? "bg-[hsl(var(--theme-primary))] scale-110" : "bg-white/80 hover:bg-white/90"}`} onClick={() => scrollTo(index)} />)}
            </div>
            <Link to={`/blog/${featuredPosts[currentIndex]?.slug}`}>
              <Button variant="link" className="text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primaryLight)] p-0 text-xs sm:text-sm h-auto">
                Read More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* More Articles Button - moved below carousel */}
      <div className="text-center mt-6">
        <Link to="/blog" onClick={() => window.scrollTo(0, 0)}>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-[hsl(var(--theme-burgundy))] via-[hsl(var(--theme-gold))] to-[hsl(var(--theme-forest))] hover:from-[hsl(var(--theme-burgundy-light))] hover:via-[hsl(var(--theme-gold-light))] hover:to-[hsl(var(--theme-forest-light))] font-mogra text-xl shadow-xl shadow-[hsl(var(--theme-gold))]/40 border border-[hsl(var(--theme-gold))]/30 text-black"
          >
            More Slick Talk
          </Button>
        </Link>
      </div>
    </section>;
};

export default BlogCarousel;
