import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Vote } from "lucide-react";
import { Link } from "react-router-dom";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  timeAgo: string;
  slug: string;
}
interface BlogSidebarProps {
  relatedPosts: RelatedPost[];
  showSignUp?: boolean;
}
const BlogSidebar = ({
  relatedPosts,
  showSignUp = false
}: BlogSidebarProps) => {
  return <div className="space-y-6">
      {/* Related Posts */}
      {relatedPosts.length > 0 && <Card className="bg-black border-4 border-[var(--theme-primary)]/30 shadow-lg shadow-[var(--theme-primary)]/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-[var(--theme-primary)] font-[var(--theme-fontPrimary)] font-normal text-center text-5xl">
              More Writtens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {relatedPosts.map(post => <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
                <div className="flex lg:flex-col gap-4 lg:gap-3 p-3 rounded-lg hover:bg-[var(--theme-backgroundLight)]/30 transition-colors">
                  <div className="flex-shrink-0 lg:w-full">
                    <ResponsiveImage src={post.imageUrl} alt={post.title} className="w-20 h-16 lg:w-full lg:h-32 object-cover rounded-md group-hover:opacity-80 transition-opacity" context="thumbnail" />
                  </div>
                  <div className="flex-1 lg:w-full min-w-0 space-y-2">
                    <h4 className="font-[var(--theme-fontSecondary)] text-sm text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors line-clamp-3 leading-snug">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-[var(--theme-textMuted)]">
                      <Clock className="w-3 h-3" />
                      <span>{post.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </Link>)}
          </CardContent>
        </Card>}

      {/* Newsletter Signup */}
      {showSignUp && <Card className="bg-black border-4 border-[var(--theme-primary)]/30 shadow-lg shadow-[var(--theme-primary)]/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-[var(--theme-primary)] font-[var(--theme-fontPrimary)] text-lg">JOIN THE CONVERSATION</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[var(--theme-text)] font-[var(--theme-fontSecondary)] mb-4 text-sm">
              Subscribe to receive the latest sacred scrolls and exclusive insights from the temple.
            </p>
            <Link to="/auth">
              <Button className="w-full bg-gradient-to-r from-[hsl(var(--theme-primary))] via-[hsl(var(--theme-primaryLight))] to-[hsl(var(--theme-primary))] hover:opacity-90 text-black font-bold text-3xl py-4 border-0">
                Join Now
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>}

      {/* All Rankings Voting Module */}
      <Card className="bg-black border-4 border-[var(--theme-primary)]/30 shadow-lg shadow-[var(--theme-primary)]/20">
        <CardContent className="p-6 text-center space-y-4">
          <h3 className="text-[var(--theme-primary)] font-[var(--theme-fontPrimary)] text-5xl">All Rankings</h3>
          <p className="text-[var(--theme-text)] font-[var(--theme-fontSecondary)] text-base pb-2">
            Your Voice Matters
          </p>
          <Link to="/rankings">
            <Button className="w-full bg-gradient-to-r from-[hsl(var(--theme-primary))] via-[hsl(var(--theme-primaryLight))] to-[hsl(var(--theme-primary))] hover:opacity-90 text-black font-bold text-3xl py-4 border-0">
              <Vote className="w-6 h-6 mr-2" />
              Vote
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>;
};
export default BlogSidebar;