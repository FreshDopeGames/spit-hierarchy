
import { Link } from "react-router-dom";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";

interface RelatedPost {
  id: string;
  title: string;
  imageUrl: string;
  timeAgo: string;
}

interface BlogSidebarProps {
  relatedPosts: RelatedPost[];
  showSignUp: boolean;
}

const BlogSidebar = ({ relatedPosts, showSignUp }: BlogSidebarProps) => {
  return (
    <ThemedCard className="sticky top-6">
      <ThemedCardContent className="p-6">
        <h3 className="text-lg font-semibold text-[var(--theme-textLight)] mb-4 font-[var(--theme-font-heading)]">Related Articles</h3>
        <div className="space-y-4">
          {relatedPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`}>
              <div className="group cursor-pointer">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-24 object-cover rounded-lg mb-2 group-hover:opacity-80 transition-opacity"
                />
                <h4 className="text-[var(--theme-textLight)] font-medium text-sm leading-tight mb-1 group-hover:text-[var(--theme-primary)] transition-colors font-[var(--theme-font-body)]">
                  {post.title}
                </h4>
                <p className="text-[var(--theme-textMuted)] text-xs font-[var(--theme-font-body)]">{post.timeAgo}</p>
              </div>
            </Link>
          ))}
        </div>

        {showSignUp && (
          <div className="mt-6 pt-6 border-t border-[var(--theme-border)]">
            <h4 className="text-[var(--theme-textLight)] font-medium mb-2 font-[var(--theme-font-heading)]">Join the Community</h4>
            <p className="text-[var(--theme-textMuted)] text-sm mb-3 font-[var(--theme-font-body)]">
              Sign up to save articles, leave comments, and connect with other hip-hop fans.
            </p>
            <Link to="/auth">
              <ThemedButton size="sm" variant="gradient" className="w-full">
                Sign Up Free
              </ThemedButton>
            </Link>
          </div>
        )}
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogSidebar;
