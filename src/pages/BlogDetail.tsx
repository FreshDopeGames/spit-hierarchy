
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User, ArrowLeft, Share2, Heart, Bookmark, Twitter, Facebook, Link as LinkIcon } from "lucide-react";
import CommentBubble from "@/components/CommentBubble";
import { useAuth } from "@/hooks/useAuth";

// Mock blog data - this would come from your database in a real app
const mockBlogPost = {
  id: "1",
  title: "The Evolution of Hip-Hop: From Bronx Streets to Global Phenomenon",
  content: `
    <p class="text-lg text-gray-300 leading-relaxed mb-6">Hip-hop culture emerged in the 1970s from the South Bronx, New York City, as a creative response to social and economic challenges facing urban communities. What began as block parties and community gatherings has evolved into one of the most influential cultural movements in modern history.</p>

    <h2 class="text-2xl font-bold text-white mb-4 mt-8">The Four Pillars</h2>
    <p class="text-gray-300 leading-relaxed mb-6">Hip-hop culture is built on four foundational elements, often called the "four pillars": DJing, MCing (rapping), breakdancing (B-boying), and graffiti art. Each element contributed to the rich tapestry of expression that defines hip-hop culture today.</p>

    <h3 class="text-xl font-semibold text-purple-400 mb-3 mt-6">DJing: The Foundation</h3>
    <p class="text-gray-300 leading-relaxed mb-4">DJ Kool Herc is widely credited as the father of hip-hop, pioneering the technique of isolating and extending the "break" - the instrumental section of funk and soul records where dancers would showcase their moves.</p>

    <h3 class="text-xl font-semibold text-purple-400 mb-3 mt-6">MCing: The Voice</h3>
    <p class="text-gray-300 leading-relaxed mb-4">What started as DJs hyping up the crowd evolved into the complex lyrical artform we know today. MCs began telling stories, sharing experiences, and commenting on social issues through rhythmic spoken word.</p>

    <h2 class="text-2xl font-bold text-white mb-4 mt-8">Global Impact</h2>
    <p class="text-gray-300 leading-relaxed mb-6">Today, hip-hop is the most popular music genre worldwide, influencing fashion, language, and social movements across continents. From the streets of the Bronx to the global stage, hip-hop continues to evolve while maintaining its core values of authenticity and creative expression.</p>

    <blockquote class="border-l-4 border-purple-500 pl-6 py-4 my-8 bg-black/30 rounded-r-lg">
      <p class="text-lg italic text-purple-300">"Hip-hop is not just music; it's a way of life, a culture, a movement that speaks truth to power and gives voice to the voiceless."</p>
      <footer class="text-gray-400 mt-2">— Afrika Bambaataa</footer>
    </blockquote>

    <p class="text-gray-300 leading-relaxed mb-6">As we look to the future, hip-hop continues to break barriers and create new pathways for artistic expression, remaining true to its roots while embracing innovation and change.</p>
  `,
  excerpt: "Explore the incredible journey of hip-hop culture from its humble beginnings in the 1970s Bronx to becoming one of the most influential music genres worldwide.",
  imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop",
  author: "Marcus Johnson",
  publishedAt: "2024-01-15",
  timeAgo: "2 days ago",
  readTime: "8 min read",
  tags: ["Hip-Hop History", "Culture", "Music", "Bronx"],
  likes: 124,
  isLiked: false,
  isBookmarked: false
};

const relatedPosts = [
  {
    id: "2",
    title: "Breaking Down the Greatest Rap Battles in Hip-Hop History",
    excerpt: "From legendary studio tracks to unforgettable live performances...",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=250&fit=crop",
    timeAgo: "5 days ago"
  },
  {
    id: "3",
    title: "The Rise of Female Rappers: Changing the Game Forever",
    excerpt: "Celebrating the powerful voices and groundbreaking contributions...",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=250&fit=crop",
    timeAgo: "1 week ago"
  }
];

const BlogDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  // In a real app, you'd fetch the blog post based on the ID
  const blogPost = mockBlogPost;

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this article: ${blogPost.title}`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/40 border-b border-purple-500/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="text-purple-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare('twitter')}
              className="text-gray-400 hover:text-white"
            >
              <Twitter className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare('facebook')}
              className="text-gray-400 hover:text-white"
            >
              <Facebook className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare('copy')}
              className="text-gray-400 hover:text-white"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {blogPost.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-purple-600/20 text-purple-300">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {blogPost.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{blogPost.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{blogPost.timeAgo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{blogPost.readTime}</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative rounded-xl overflow-hidden mb-8">
            <img 
              src={blogPost.imageUrl} 
              alt={blogPost.title}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-black/40 border-purple-500/20 mb-8">
              <CardContent className="p-8">
                <div 
                  className="prose prose-invert prose-purple max-w-none"
                  dangerouslySetInnerHTML={{ __html: blogPost.content }}
                />
              </CardContent>
            </Card>

            {/* Engagement Actions */}
            <Card className="bg-black/40 border-purple-500/20 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant={blogPost.isLiked ? "default" : "outline"}
                      size="sm"
                      className={blogPost.isLiked 
                        ? "bg-red-600 hover:bg-red-700" 
                        : "border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      }
                    >
                      <Heart className={`w-4 h-4 mr-2 ${blogPost.isLiked ? 'fill-current' : ''}`} />
                      {blogPost.likes}
                    </Button>
                    
                    <Button
                      variant={blogPost.isBookmarked ? "default" : "outline"}
                      size="sm"
                      className={blogPost.isBookmarked 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      }
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${blogPost.isBookmarked ? 'fill-current' : ''}`} />
                      Save
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('copy')}
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 border-purple-500/20 sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedPosts.map((post) => (
                    <Link key={post.id} to={`/blog/${post.id}`}>
                      <div className="group cursor-pointer">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-full h-24 object-cover rounded-lg mb-2 group-hover:opacity-80 transition-opacity"
                        />
                        <h4 className="text-white font-medium text-sm leading-tight mb-1 group-hover:text-purple-300 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-gray-400 text-xs">{post.timeAgo}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {!user && (
                  <div className="mt-6 pt-6 border-t border-purple-500/20">
                    <h4 className="text-white font-medium mb-2">Join the Community</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Sign up to save articles, leave comments, and connect with other hip-hop fans.
                    </p>
                    <Link to="/auth">
                      <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                        Sign Up Free
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Comment Bubble */}
      <CommentBubble contentType="blog" contentId={id || ""} />
    </div>
  );
};

export default BlogDetail;
