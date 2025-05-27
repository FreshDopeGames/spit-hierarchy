
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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

const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Evolution of Hip-Hop: From Bronx Streets to Global Phenomenon",
    excerpt: "Explore the incredible journey of hip-hop culture from its humble beginnings in the 1970s Bronx to becoming one of the most influential music genres worldwide.",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
    publishedAt: "2024-01-15",
    timeAgo: "2 days ago"
  },
  {
    id: "2", 
    title: "Breaking Down the Greatest Rap Battles in Hip-Hop History",
    excerpt: "From legendary studio tracks to unforgettable live performances, we dive deep into the most iconic rap battles that shaped the culture and defined careers.",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=400&fit=crop",
    publishedAt: "2024-01-12",
    timeAgo: "5 days ago"
  },
  {
    id: "3",
    title: "The Rise of Female Rappers: Changing the Game Forever",
    excerpt: "Celebrating the powerful voices and groundbreaking contributions of female artists who have revolutionized hip-hop and continue to push boundaries.",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=400&fit=crop",
    publishedAt: "2024-01-10",
    timeAgo: "1 week ago"
  }
];

const BlogCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const rotationTime = 8000; // 8 seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((current) => (current + 1) % mockBlogPosts.length);
          return 0;
        }
        return prev + (100 / (rotationTime / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const currentPost = mockBlogPosts[currentIndex];

  return (
    <div className="mb-12">
      <Card className="bg-black/40 border-purple-500/20 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Featured Image */}
            <div className="md:w-1/2 relative">
              <Link to={`/blog/${currentPost.id}`}>
                <img 
                  src={currentPost.imageUrl} 
                  alt={currentPost.title}
                  className="w-full h-64 md:h-80 object-cover hover:opacity-90 transition-opacity cursor-pointer"
                />
              </Link>
              <div className="absolute top-4 left-4">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{currentPost.timeAgo}</span>
                </div>
                
                <Link to={`/blog/${currentPost.id}`}>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight hover:text-purple-300 transition-colors cursor-pointer">
                    {currentPost.title}
                  </h2>
                </Link>
                
                <p className="text-gray-300 text-lg leading-relaxed">
                  {currentPost.excerpt}
                </p>
              </div>

              <div className="mt-6">
                <Link to={`/blog/${currentPost.id}`}>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 group">
                    Read Full Article
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-1 bg-gray-700">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 py-4 bg-black/20">
            {mockBlogPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setProgress(0);
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-purple-500' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogCarousel;
