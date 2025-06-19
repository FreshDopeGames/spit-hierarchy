
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import { Heart, Bookmark, Share2, MessageCircle } from "lucide-react";

interface BlogEngagementActionsProps {
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  commentCount?: number;
  onShare: (platform: string) => void;
  onCommentsClick?: () => void;
}

const BlogEngagementActions = ({ 
  likes, 
  isLiked, 
  isBookmarked, 
  commentCount = 0,
  onShare,
  onCommentsClick
}: BlogEngagementActionsProps) => {
  return (
    <ThemedCard className="mb-8">
      <ThemedCardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ThemedButton
              variant={isLiked ? "default" : "outline"}
              size="sm"
              className={isLiked 
                ? "bg-[var(--theme-error)] hover:bg-[var(--theme-error)]/80" 
                : ""
              }
            >
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {likes}
            </ThemedButton>
            
            <ThemedButton
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              className={isBookmarked 
                ? "bg-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/80" 
                : ""
              }
            >
              <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
              Save
            </ThemedButton>

            <ThemedButton
              variant="outline"
              size="sm"
              onClick={onCommentsClick}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
            </ThemedButton>
          </div>

          <ThemedButton
            variant="outline"
            size="sm"
            onClick={() => onShare('copy')}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </ThemedButton>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogEngagementActions;
