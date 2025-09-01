import React, { useState } from "react";
import { MessageSquare, ArrowUp, Clock } from "lucide-react";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedTextarea } from "@/components/ui/themed-textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CommentItem from "@/components/CommentItem";
import { useVSMatchComments } from "@/hooks/useVSMatchComments";
import { Link } from "react-router-dom";

interface VSMatchCommentsSectionProps {
  vsMatchId: string;
  title: string;
}

const VSMatchCommentsSection = ({ vsMatchId, title }: VSMatchCommentsSectionProps) => {
  const [sortBy, setSortBy] = useState<'top' | 'latest'>('top');
  const {
    comments,
    isLoading,
    totalComments,
    newComment,
    setNewComment,
    createComment,
    isCreatingComment,
    deleteComment,
    isDeletingComment,
    toggleLike,
    isTogglingLike,
    user,
    hasMore,
    loadMore,
    isLoadingMore
  } = useVSMatchComments({ vsMatchId, sortBy });

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      createComment({ text: newComment });
    }
  };

  const handleReply = (parentId: string, text: string) => {
    createComment({ text, parentId });
  };

  const characterCount = newComment.length;
  const maxCharacters = 1000;
  const isNearLimit = characterCount > maxCharacters * 0.8;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className="w-full max-w-4xl mx-auto mt-16">
      {/* Comments Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] mb-4 font-mogra text-center">
          Battle Discussion
        </h2>
        <p className="text-[var(--theme-textLight)] text-center mb-6">
          Join the conversation about {title}
        </p>
      </div>

      {/* Comments Section */}
      <div className="bg-gradient-to-br from-[hsl(220_13%_26%)] to-[hsl(220_14%_46%)] border-4 border-[var(--theme-primary)] rounded-lg shadow-2xl shadow-[var(--theme-primary)]/20 p-6">
        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[var(--theme-primary)] font-mogra text-xl">
              Discussion ({totalComments})
            </h3>
          </div>
          
          <Select value={sortBy} onValueChange={(value: 'top' | 'latest') => setSortBy(value)}>
            <SelectTrigger className="w-40 bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]/50 text-[var(--theme-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--theme-background)] border-[var(--theme-primary)]/50">
              <SelectItem value="top" className="text-[var(--theme-primary)] focus:bg-[var(--theme-primary)]/20">
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-4 h-4" />
                  Top Voted
                </div>
              </SelectItem>
              <SelectItem value="latest" className="text-[var(--theme-primary)] focus:bg-[var(--theme-primary)]/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Latest
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Comment Input - Only for authenticated users */}
        {user ? (
          <div className="bg-[var(--theme-background)]/50 border border-[var(--theme-primary)]/30 rounded-lg p-4 mb-6">
            <ThemedTextarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this battle... Who do you think won? 🔥"
              className="w-full bg-transparent text-[var(--theme-text)] placeholder-[var(--theme-primary)]/60 border-none resize-none focus:outline-none font-[var(--theme-fontBody)] min-h-24"
              maxLength={maxCharacters}
            />
            
            <div className="flex justify-between items-center mt-3">
              <ThemedButton
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || isCreatingComment || isOverLimit}
                className="bg-[var(--theme-primary)] text-[var(--theme-background)] hover:bg-[var(--theme-primaryLight)] font-mogra disabled:opacity-50"
              >
                {isCreatingComment ? "Posting..." : "Post Comment"}
              </ThemedButton>
              
              <span className={`text-sm font-mono ${
                isOverLimit ? 'text-red-400' : 
                isNearLimit ? 'text-[var(--theme-primary)]' : 
                'text-[var(--theme-primary)]/60'
              }`}>
                {characterCount}/{maxCharacters}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border border-[var(--theme-primary)]/30 rounded-lg mb-6">
            <MessageSquare className="w-12 h-12 text-[var(--theme-primary)]/60 mx-auto mb-4" />
            <h3 className="text-[var(--theme-primary)] font-mogra mb-2">Join the Battle Discussion</h3>
            <p className="text-[var(--theme-primary)]/80 mb-4 font-merienda">
              Sign in to share your thoughts on this matchup.
            </p>
            <Link to="/auth">
              <ThemedButton className="bg-[var(--theme-primary)] text-[var(--theme-background)] hover:bg-[var(--theme-primaryLight)] font-mogra">
                Sign In to Comment
              </ThemedButton>
            </Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-0">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-[var(--theme-primary)] font-merienda">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-[var(--theme-primary)]/60 mx-auto mb-6" />
              <h3 className="text-[var(--theme-primary)] font-mogra text-xl mb-3">No Comments Yet</h3>
              <p className="text-[var(--theme-primary)]/80 font-merienda text-lg">
                Be the first to share your thoughts on this battle!
              </p>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
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
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-8">
                  <ThemedButton
                    onClick={loadMore}
                    variant="outline"
                    disabled={isLoadingMore}
                    className="border-[var(--theme-primary)]/50 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/20 font-merienda"
                  >
                    {isLoadingMore ? "Loading..." : "Load More Comments"}
                  </ThemedButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VSMatchCommentsSection;