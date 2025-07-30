
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/hooks/useComments";
import CommentItem from "./CommentItem";
import ResponsiveInstructions from "./ResponsiveInstructions";

interface CommentBubbleProps {
  contentType: "rapper" | "blog" | "ranking";
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
          <Button
            onClick={() => setIsExpanded(true)}
            className={`bg-rap-gold text-black hover:bg-rap-gold/80 rounded-full h-14 px-4 shadow-lg shadow-rap-gold/30 transition-transform duration-300 font-merienda ${
              shouldAnimate ? 'animate-slow-bounce' : ''
            }`}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">{isLoading ? "..." : totalComments}</span>
          </Button>
        </div>
      )}

      {/* Expanded Comment Modal */}
      {isExpanded && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-black/80 backdrop-blur-sm">
          <Card className="bg-carbon-fiber/90 border-rap-gold/50 border-2 rounded-t-2xl rounded-b-none border-b-0 max-h-[70vh] shadow-lg shadow-rap-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-rap-gold font-mogra">
                Comments on this {getContentTypeLabel()} ({totalComments})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-rap-gold hover:text-rap-gold-light hover:bg-rap-gold/20"
                >
                  <ChevronUp className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-rap-gold hover:text-rap-gold-light hover:bg-rap-gold/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="overflow-y-auto max-h-[50vh]">
              {!user ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-rap-gold/60 mx-auto mb-4" />
                  <h3 className="text-rap-gold font-mogra mb-2">Join the Conversation</h3>
                  <p className="text-rap-platinum mb-4 font-merienda">
                    Sign in to read and share your thoughts about this {getContentTypeLabel()}.
                  </p>
                  <Link to="/auth">
                    <Button className="bg-rap-gold text-black hover:bg-rap-gold/80 font-mogra">
                      Sign In to Comment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Comment Input */}
                  <div className="bg-rap-carbon/50 border border-rap-gold/30 rounded-lg p-4">
                    <ResponsiveInstructions className="text-rap-gold/80 mb-2" />
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={`Share your thoughts about this ${getContentTypeLabel()}...`}
                      className="w-full bg-transparent text-rap-platinum placeholder-rap-smoke border-none resize-none focus:outline-none font-merienda"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button 
                        size="sm" 
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim() || isCreatingComment}
                        className="bg-rap-gold text-black hover:bg-rap-gold/80 font-mogra"
                      >
                        {isCreatingComment ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-0">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <p className="text-rap-platinum font-merienda">Loading comments...</p>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-rap-gold/60 mx-auto mb-4" />
                        <h3 className="text-rap-gold font-mogra mb-2">No Comments Yet</h3>
                        <p className="text-rap-platinum font-merienda">
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
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CommentBubble;
