import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import { Heart, Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface BlogEngagementActionsProps {
  likes: number;
  isLiked: boolean;
  commentCount?: number;
  onLike: () => void;
  onShare: (platform: string) => void;
  onCommentsClick?: () => void;
  isLikeLoading?: boolean;
}

const BlogEngagementActions = ({
  likes,
  isLiked,
  commentCount = 0,
  onLike,
  onShare,
  onCommentsClick,
  isLikeLoading = false,
}: BlogEngagementActionsProps) => {
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("The article link has been copied to your clipboard.");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Unable to copy link. Please try again.");
    }
  };

  const handleCommentsClick = () => {
    // First try to find and click the comment bubble to open it
    const commentBubble = document.querySelector("[data-comment-bubble] button");
    if (commentBubble && commentBubble instanceof HTMLButtonElement) {
      commentBubble.click();
    } else if (onCommentsClick) {
      // Fallback to the provided handler
      onCommentsClick();
    }
  };

  return (
    <ThemedCard variant="dark" className="mb-8">
      <ThemedCardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <ThemedButton
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={onLike}
              disabled={isLikeLoading}
              className={`min-w-0 flex-shrink-0 ${
                isLiked ? "bg-[var(--theme-error)] hover:bg-[var(--theme-error)]/80" : ""
              }`}
            >
              <Heart className={`w-4 h-4 mr-1 sm:mr-2 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs sm:text-sm">{likes}</span>
            </ThemedButton>

            <ThemedButton variant="outline" size="sm" onClick={handleCommentsClick} className="min-w-0 flex-shrink-0">
              <MessageCircle className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">{commentCount}</span>
              <span className="hidden sm:inline ml-1">{commentCount === 1 ? "Comment" : "Comments"}</span>
            </ThemedButton>
          </div>

          <ThemedButton
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="min-w-0 flex-shrink-0 self-start sm:self-auto"
          >
            <Share2 className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Share</span>
          </ThemedButton>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogEngagementActions;
