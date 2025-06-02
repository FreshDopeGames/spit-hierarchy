
import { useParams } from "react-router-dom";
import CommentBubble from "@/components/CommentBubble";
import { useAuth } from "@/hooks/useAuth";
import BlogDetailHeader from "@/components/blog/BlogDetailHeader";
import BlogArticleHeader from "@/components/blog/BlogArticleHeader";
import BlogArticleContent from "@/components/blog/BlogArticleContent";
import BlogEngagementActions from "@/components/blog/BlogEngagementActions";
import BlogSidebar from "@/components/blog/BlogSidebar";

// Mock blog data - this would come from your database in a real app
const mockBlogPost = {
  id: "1",
  title: "The Evolution of Hip-Hop: From Bronx Streets to Global Phenomenon",
  content: `
    <p class="text-lg text-[var(--theme-textMuted)] leading-relaxed mb-6">Hip-hop culture emerged in the 1970s from the South Bronx, New York City, as a creative response to social and economic challenges facing urban communities. What began as block parties and community gatherings has evolved into one of the most influential cultural movements in modern history.</p>

    <h2 class="text-2xl font-bold text-[var(--theme-textLight)] mb-4 mt-8 font-[var(--theme-font-heading)]">The Four Pillars</h2>
    <p class="text-[var(--theme-text)] leading-relaxed mb-6 font-[var(--theme-font-body)]">Hip-hop culture is built on four foundational elements, often called the "four pillars": DJing, MCing (rapping), breakdancing (B-boying), and graffiti art. Each element contributed to the rich tapestry of expression that defines hip-hop culture today.</p>

    <h3 class="text-xl font-semibold text-[var(--theme-primary)] mb-3 mt-6 font-[var(--theme-font-heading)]">DJing: The Foundation</h3>
    <p class="text-[var(--theme-text)] leading-relaxed mb-4 font-[var(--theme-font-body)]">DJ Kool Herc is widely credited as the father of hip-hop, pioneering the technique of isolating and extending the "break" - the instrumental section of funk and soul records where dancers would showcase their moves.</p>

    <h3 class="text-xl font-semibold text-[var(--theme-primary)] mb-3 mt-6 font-[var(--theme-font-heading)]">MCing: The Voice</h3>
    <p class="text-[var(--theme-text)] leading-relaxed mb-4 font-[var(--theme-font-body)]">What started as DJs hyping up the crowd evolved into the complex lyrical artform we know today. MCs began telling stories, sharing experiences, and commenting on social issues through rhythmic spoken word.</p>

    <h2 class="text-2xl font-bold text-[var(--theme-textLight)] mb-4 mt-8 font-[var(--theme-font-heading)]">Global Impact</h2>
    <p class="text-[var(--theme-text)] leading-relaxed mb-6 font-[var(--theme-font-body)]">Today, hip-hop is the most popular music genre worldwide, influencing fashion, language, and social movements across continents. From the streets of the Bronx to the global stage, hip-hop continues to evolve while maintaining its core values of authenticity and creative expression.</p>

    <blockquote class="border-l-4 border-[var(--theme-primary)] pl-6 py-4 my-8 bg-[var(--theme-backgroundDark)]/30 rounded-r-lg">
      <p class="text-lg italic text-[var(--theme-primary)] font-[var(--theme-font-body)]">"Hip-hop is not just music; it's a way of life, a culture, a movement that speaks truth to power and gives voice to the voiceless."</p>
      <footer class="text-[var(--theme-textMuted)] mt-2 font-[var(--theme-font-body)]">— Afrika Bambaataa</footer>
    </blockquote>

    <p class="text-[var(--theme-text)] leading-relaxed mb-6 font-[var(--theme-font-body)]">As we look to the future, hip-hop continues to break barriers and create new pathways for artistic expression, remaining true to its roots while embracing innovation and change.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-[var(--theme-backgroundDark)] via-[var(--theme-background)] to-[var(--theme-backgroundDark)]">
      <BlogDetailHeader onShare={handleShare} />

      <main className="max-w-4xl mx-auto p-6">
        <BlogArticleHeader blogPost={blogPost} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <BlogArticleContent content={blogPost.content} />
            <BlogEngagementActions 
              likes={blogPost.likes}
              isLiked={blogPost.isLiked}
              isBookmarked={blogPost.isBookmarked}
              onShare={handleShare}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar 
              relatedPosts={relatedPosts}
              showSignUp={!user}
            />
          </div>
        </div>
      </main>

      {/* Comment Bubble */}
      <CommentBubble contentType="blog" contentId={id || ""} />
    </div>
  );
};

export default BlogDetail;
