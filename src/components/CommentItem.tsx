
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Reply, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import SmallAvatar from "./avatar/SmallAvatar";
import { useSecurityContext } from "@/hooks/useSecurityContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
  comment_likes: Array<{
    id: string;
    user_id: string;
  }>;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string, text: string) => void;
  onLike: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  isLiking: boolean;
  isDeletingComment?: boolean;
  depth?: number;
}

const CommentItem = ({ 
  comment, 
  onReply, 
  onLike, 
  onDelete, 
  currentUserId, 
  isLiking, 
  isDeletingComment = false,
  depth = 0 
}: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { isAdmin } = useSecurityContext();
  const isMobile = useIsMobile();

  const isLiked = comment.comment_likes.some(like => like.user_id === currentUserId);
  const likeCount = comment.comment_likes.length;

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(comment.id);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l border-rap-gold/30 pl-4' : ''}`}>
      <div className="bg-rap-carbon/30 border border-rap-gold/20 rounded-lg p-4 mb-4">
        <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex items-start gap-3'}`}>
          <div className="flex items-start gap-3">
            <SmallAvatar 
              avatarUrl={comment.profiles?.avatar_url || null} 
              username={comment.profiles?.username || "Anonymous User"}
              size="sm"
            />
            <div className="flex items-center gap-2">
              <span className="text-rap-gold font-mogra">{comment.profiles?.username || "Anonymous User"}</span>
              <span className="text-rap-smoke text-sm font-merienda">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
          </div>
          <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
            <p className={`text-rap-platinum font-merienda mb-3 whitespace-pre-wrap ${isMobile ? 'text-sm' : ''}`}>
              {comment.comment_text}
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(comment.id)}
                disabled={isLiking}
                className={`text-rap-gold hover:text-rap-gold-light hover:bg-rap-gold/20 h-auto p-1 font-merienda ${
                  isLiked ? 'text-rap-gold-light' : ''
                }`}
              >
                <Mic className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount} {likeCount === 1 ? 'Bar' : 'Bars'}
              </Button>
              
              {currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-rap-gold hover:text-rap-gold-light hover:bg-rap-gold/20 h-auto p-1 font-merienda"
                >
                  <Reply className="w-4 h-4 mr-1" />
                  Reply
                </Button>
              )}

              {isAdmin && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isDeletingComment}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/20 h-auto p-1 font-merienda"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-rap-carbon border-rap-gold/50">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-rap-gold font-mogra">
                        Delete Comment
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-rap-platinum font-merienda">
                        Are you sure you want to delete this comment? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-rap-smoke text-rap-carbon hover:bg-rap-smoke/80">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm && (
              <div className="mt-3 bg-rap-carbon/50 border border-rap-gold/30 rounded-lg p-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.profiles?.username || "user"}...`}
                  className="w-full bg-transparent text-rap-platinum placeholder-rap-smoke border-none resize-none focus:outline-none font-merienda"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(false)}
                    className="text-rap-smoke hover:text-rap-platinum font-merienda"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={!replyText.trim()}
                    className="bg-rap-gold text-black hover:bg-rap-gold/80 font-mogra"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
              currentUserId={currentUserId}
              isLiking={isLiking}
              isDeletingComment={isDeletingComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
