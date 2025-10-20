
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, ChevronUp } from "lucide-react";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/hooks/useComments";
import CommentItem from "./CommentItem";
import ResponsiveInstructions from "./ResponsiveInstructions";

interface CommentBubbleProps {
  contentType: "rapper" | "blog" | "ranking" | "vs_match" | "album";
  contentId: string;
}

const CommentBubble = ({ contentType, contentId }: CommentBubbleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const { user } = useAuth();

  const {
    comments,
    isLoading,
    totalComments,
    newComment,
    setNewComment,
    createComment,
    isCreatingComment,
    toggleLike,
    isTogglingLike,
    deleteComment,
    isDeletingComment
  } = useComments({ contentType, contentId });

  // Animation effect - hop every 20 seconds when collapsed
  useEffect(() => {
    if (isExpanded) return;

    const interval = setInterval(() => {
      setShouldAnimate(true);
      setTimeout(() => setShouldAnimate(false), 2000); // Animation duration - increased to match slower animation
    }, 20000); // Every 20 seconds - doubled from 10 seconds

    return () => clearInterval(interval);
  }, [isExpanded]);

  const getContentTypeLabel = () => {
    switch (contentType) {
      case "rapper": return "rapper";
      case "blog": return "article";
      case "ranking": return "ranking";
      case "vs_match": return "VS match";
      case "album": return "album";
      default: return "content";
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      createComment({ text: newComment });
    }
  };

  const handleReply = (parentId: string, text: string) => {
    createComment({ text, parentId });
  };

  return (
    <>
      {/* Collapsed Comment Bubble - reduced horizontal padding */}
      {!isExpanded && (
        <div className="fixed bottom-6 right-6 z-50">
          <ThemedButton
            onClick={() => setIsExpanded(true)}
            className={`rounded-full h-14 px-4 shadow-lg shadow-[hsl(var(--theme-primary))]/30 transition-transform duration-300 ${
              shouldAnimate ? 'animate-slow-bounce' : ''
            }`}
            variant="default"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">{isLoading ? "..." : totalComments}</span>
          </ThemedButton>
        </div>
      )}

      {/* Expanded Comment Modal */}
      {isExpanded && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-black">
          <ThemedCard className="bg-black border-[var(--theme-border)]/30 rounded-t-2xl rounded-b-none border-b-0 max-h-[70vh] shadow-lg shadow-[hsl(var(--theme-primary))]/20">
            <ThemedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <ThemedCardTitle>
                Comments on this {getContentTypeLabel()} ({totalComments})
              </ThemedCardTitle>
              <div className="flex items-center gap-2">
                <ThemedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  <ChevronUp className="w-5 h-5" />
                </ThemedButton>
                <ThemedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="w-5 h-5" />
                </ThemedButton>
              </div>
            </ThemedCardHeader>
            
            <ThemedCardContent className="overflow-y-auto max-h-[50vh]">
              {!user ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-[var(--theme-primary)]/60 mx-auto mb-4" />
                  <h3 className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-2">Join the Conversation</h3>
                  <p className="text-[var(--theme-text)] mb-4 font-[var(--theme-font-body)]">
                    Sign in to read and share your thoughts about this {getContentTypeLabel()}.
                  </p>
                  <Link to="/auth">
                    <ThemedButton variant="default">
                      Sign In to Comment
                    </ThemedButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Comment Input */}
                  <div className="bg-[var(--theme-background)]/50 border border-[var(--theme-border)]/30 rounded-lg p-4">
                    <ResponsiveInstructions className="text-[var(--theme-primary)]/80 mb-2" />
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={`Share your thoughts about this ${getContentTypeLabel()}...`}
                      className="w-full bg-transparent text-[var(--theme-text)] placeholder-[var(--theme-textMuted)] border-none resize-none focus:outline-none font-[var(--theme-font-body)]"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <ThemedButton 
                        size="sm" 
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim() || isCreatingComment}
                        variant="default"
                      >
                        {isCreatingComment ? "Posting..." : "Post Comment"}
                      </ThemedButton>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-0">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Loading comments...</p>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-[var(--theme-primary)]/60 mx-auto mb-4" />
                        <h3 className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-2">No Comments Yet</h3>
                        <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">
                          Be the first to share your thoughts about this {getContentTypeLabel()}!
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          onReply={handleReply}
                          onLike={toggleLike}
                          onDelete={deleteComment}
                          currentUserId={user?.id}
                          isLiking={isTogglingLike}
                          isDeletingComment={isDeletingComment}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </ThemedCardContent>
          </ThemedCard>
        </div>
      )}
    </>
  );
};

export default CommentBubble;
