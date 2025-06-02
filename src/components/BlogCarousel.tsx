import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  timeAgo: string;
}
const mockBlogPosts: BlogPost[] = [{
  id: "1",
  title: "The Evolution of Hip-Hop: From Bronx Streets to Global Phenomenon",
  excerpt: "Explore the incredible journey of hip-hop culture from its humble beginnings in the 1970s Bronx to becoming one of the most influential music genres worldwide.",
  imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
  publishedAt: "2024-01-15",
  timeAgo: "2 days ago"
}, {
  id: "2",
  title: "Breaking Down the Greatest Rap Battles in Hip-Hop History",
  excerpt: "From legendary studio tracks to unforgettable live performances, we dive deep into the most iconic rap battles that shaped the culture and defined careers.",
  imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=400&fit=crop",
  publishedAt: "2024-01-12",
  timeAgo: "5 days ago"
}, {
  id: "3",
  title: "The Rise of Female Rappers: Changing the Game Forever",
  excerpt: "Celebrating the powerful voices and groundbreaking contributions of female artists who have revolutionized hip-hop and continue to push boundaries.",
  imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=400&fit=crop",
  publishedAt: "2024-01-10",
  timeAgo: "1 week ago"
}];
const BlogCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const rotationTime = 8000; // 8 seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentIndex(current => (current + 1) % mockBlogPosts.length);
          return 0;
        }
        return prev + 100 / (rotationTime / 100);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);
  const currentPost = mockBlogPosts[currentIndex];
  return <div className="mb-12">
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
                <img src={currentPost.imageUrl} alt={currentPost.title} className="w-full h-64 md:h-80 object-cover hover:opacity-90 transition-opacity cursor-pointer" />
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
                  <span>{currentPost.timeAgo}</span>
                </div>
                
                <Link to={`/blog/${currentPost.id}`}>
                  <h2 className="text-2xl text-rap-platinum leading-tight hover:text-rap-gold transition-colors cursor-pointer font-ceviche font-normal md:text-4xl">
                    {currentPost.title}
                  </h2>
                </Link>
                
                <p className="text-rap-silver text-lg leading-relaxed font-kaushan">
                  {currentPost.excerpt}
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
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest transition-all duration-100" style={{
            width: `${progress}%`
          }} />
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 py-4 bg-carbon-fiber">
            {mockBlogPosts.map((_, index) => <button key={index} onClick={() => {
            setCurrentIndex(index);
            setProgress(0);
          }} className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-rap-gold shadow-lg shadow-rap-gold/50' : 'bg-rap-smoke hover:bg-rap-silver'}`} />)}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default BlogCarousel;