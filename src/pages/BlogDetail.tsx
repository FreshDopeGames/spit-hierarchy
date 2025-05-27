
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, Tag, Share2, Heart, BookmarkPlus } from "lucide-react";
import CommentBubble from "@/components/CommentBubble";

// Mock blog post data - in a real app this would come from Supabase
const mockBlogPosts = {
  "1": {
    id: "1",
    title: "The Evolution of Hip-Hop: From Bronx Streets to Global Phenomenon",
    content: `
      <p>Hip-hop culture emerged in the 1970s in the South Bronx, New York City, as a creative response to economic hardship and social challenges. What began as block parties and community gatherings has evolved into one of the most influential cultural movements of our time.</p>

      <h2>The Four Pillars</h2>
      <p>Hip-hop culture is built on four fundamental elements:</p>
      <ul>
        <li><strong>MCing (Rapping):</strong> The vocal delivery of rhythmic and rhyming speech</li>
        <li><strong>DJing:</strong> The art of mixing and manipulating recorded music</li>
        <li><strong>Breaking (B-boying/B-girling):</strong> The athletic dance style</li>
        <li><strong>Graffiti Art:</strong> Visual artistic expression through spray paint and markers</li>
      </ul>

      <h2>Global Impact</h2>
      <p>From its humble beginnings in New York's boroughs, hip-hop has transcended geographical boundaries to become a global phenomenon. Artists from every continent have embraced and adapted the culture, creating unique regional sounds while maintaining the core elements that define hip-hop.</p>

      <p>Today, hip-hop is not just music—it's fashion, language, politics, and lifestyle. It has given voice to the voiceless and continues to be a powerful platform for social commentary and change.</p>

      <h2>The Future</h2>
      <p>As we move forward, hip-hop continues to evolve with technology and changing social landscapes. From streaming platforms to social media, new tools are enabling artists to reach audiences in ways the pioneers could never have imagined.</p>
    `,
    excerpt: "Explore the incredible journey of hip-hop culture from its humble beginnings in the 1970s Bronx to becoming one of the most influential music genres worldwide.",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop",
    author: "Marcus Johnson",
    publishedAt: "2024-01-15T10:00:00Z",
    readTime: "8 min read",
    tags: ["Hip-Hop History", "Culture", "Music Evolution"],
    likes: 243,
    isLiked: false
  },
  "2": {
    id: "2",
    title: "Breaking Down the Greatest Rap Battles in Hip-Hop History",
    content: `
      <p>Rap battles have been the cornerstone of hip-hop culture since its inception. These verbal duels showcase lyrical prowess, quick wit, and the ability to think on one's feet under pressure.</p>

      <h2>The Art of Battle Rap</h2>
      <p>Battle rap is more than just trading insults—it's a sophisticated art form that requires:</p>
      <ul>
        <li>Complex wordplay and metaphors</li>
        <li>Rhythmic delivery and flow</li>
        <li>Cultural references and knowledge</li>
        <li>Stage presence and confidence</li>
      </ul>

      <h2>Legendary Battles</h2>
      <p>Some battles have transcended their moment to become part of hip-hop folklore. These confrontations didn't just entertain—they shaped careers and influenced the direction of the genre.</p>

      <p>From legendary studio tracks to unforgettable live performances, these battles demonstrate the power of words and the competitive spirit that drives hip-hop culture forward.</p>
    `,
    excerpt: "From legendary studio tracks to unforgettable live performances, we dive deep into the most iconic rap battles that shaped the culture and defined careers.",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=600&fit=crop",
    author: "Sarah Williams",
    publishedAt: "2024-01-12T14:30:00Z",
    readTime: "6 min read",
    tags: ["Battle Rap", "Hip-Hop Culture", "Music History"],
    likes: 189,
    isLiked: false
  },
  "3": {
    id: "3",
    title: "The Rise of Female Rappers: Changing the Game Forever",
    content: `
      <p>Female rappers have been an integral part of hip-hop since its early days, yet their contributions have often been overlooked or minimized. Today, we celebrate the powerful voices that have revolutionized the genre.</p>

      <h2>Breaking Barriers</h2>
      <p>From the pioneers who first picked up the mic to today's chart-topping stars, female rappers have consistently pushed boundaries and challenged expectations. They've brought unique perspectives, diverse flows, and innovative approaches to the art form.</p>

      <h2>Impact and Influence</h2>
      <p>Female rappers haven't just participated in hip-hop—they've transformed it. Their influence extends beyond music into fashion, social activism, and cultural commentary.</p>

      <p>As we look to the future, it's clear that female voices in hip-hop will continue to shape the genre's evolution and inspire new generations of artists.</p>
    `,
    excerpt: "Celebrating the powerful voices and groundbreaking contributions of female artists who have revolutionized hip-hop and continue to push boundaries.",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=600&fit=crop",
    author: "Keisha Thompson",
    publishedAt: "2024-01-10T16:45:00Z",
    readTime: "7 min read",
    tags: ["Female Rappers", "Women in Music", "Hip-Hop Evolution"],
    likes: 312,
    isLiked: false
  }
};

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const blogPost = id ? mockBlogPosts[id as keyof typeof mockBlogPosts] : null;

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto p-6">
          <Link to="/">
            <Button variant="outline" className="mb-6 border-purple-500/30 text-purple-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Article Not Found</h2>
              <p className="text-gray-400">The article you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <Link to="/">
          <Button variant="outline" className="mb-6 border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Article Header */}
        <Card className="bg-black/40 border-purple-500/20 mb-8">
          <CardContent className="p-0">
            {/* Hero Image */}
            <div className="relative">
              <img 
                src={blogPost.imageUrl} 
                alt={blogPost.title}
                className="w-full h-64 md:h-80 object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg" />
            </div>

            {/* Article Info */}
            <div className="p-8">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {blogPost.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-300">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {blogPost.title}
              </h1>

              {/* Author and Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{blogPost.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(blogPost.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{blogPost.readTime}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`border-purple-500/30 ${
                    isLiked ? 'bg-purple-600/20 text-purple-300' : 'text-purple-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {blogPost.likes + (isLiked ? 1 : 0)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`border-purple-500/30 ${
                    isBookmarked ? 'bg-purple-600/20 text-purple-300' : 'text-purple-300'
                  }`}
                >
                  <BookmarkPlus className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Article Content */}
        <Card className="bg-black/40 border-purple-500/20 mb-8">
          <CardContent className="p-8">
            <div 
              className="prose prose-invert prose-purple max-w-none text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
              style={{
                fontSize: '1.1rem',
                lineHeight: '1.8'
              }}
            />
          </CardContent>
        </Card>

        {/* Related Articles Section */}
        <Card className="bg-black/40 border-purple-500/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.values(mockBlogPosts)
                .filter(post => post.id !== blogPost.id)
                .slice(0, 2)
                .map((post) => (
                  <Link key={post.id} to={`/blog/${post.id}`}>
                    <Card className="bg-gray-800/50 border-gray-700/50 hover:border-purple-500/30 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                        <h3 className="text-white font-semibold mb-2 line-clamp-2">{post.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                          <span>{post.author}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comment Bubble - Pinned to bottom */}
      <CommentBubble contentType="blog" contentId={blogPost.id} />
    </div>
  );
};

export default BlogDetail;
