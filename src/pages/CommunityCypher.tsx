import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PenTool, MessageSquare, ArrowUp, Clock } from "lucide-react";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedTextarea } from "@/components/ui/themed-textarea";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import CommentItem from "@/components/CommentItem";
import ResponsiveInstructions from "@/components/ResponsiveInstructions";
import { useAuth } from "@/hooks/useAuth";
import { useCypherComments } from "@/hooks/useCypherComments";
import { usePageVisitTracking } from "@/hooks/usePageVisitTracking";
import SEOHead from "@/components/seo/SEOHead";
const CommunityCypher = () => {
  usePageVisitTracking('cypher_visits');
  
  const {
    user
  } = useAuth();
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
    hasMore,
    loadMore
  } = useCypherComments({
    sortBy
  });
  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      createComment({
        text: newComment
      });
    }
  };
  const handleReply = (parentId: string, text: string) => {
    createComment({
      text,
      parentId
    });
  };
  const characterCount = newComment.length;
  const maxCharacters = 2000;
  const isNearLimit = characterCount > maxCharacters * 0.8;
  const isOverLimit = characterCount > maxCharacters;
  return <div className="min-h-screen bg-gradient-to-br from-primary via-primary-foreground to-rap-gold-dark ">
      <SEOHead
        title="Community Cypher - Live Hip-Hop Chat & Discussion | Spit Hierarchy"
        description="Join the live community cypher to discuss hip-hop, share opinions, debate rankings, and connect with fellow rap enthusiasts in real-time."
        keywords={['community chat', 'hip hop discussion', 'rap cypher', 'live chat', 'hip hop community']}
        canonicalUrl="/cypher"
      />
      <HeaderNavigation isScrolled={false} />
      
      <div className="max-w-4xl mx-auto pt-20 px-4 pb-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-ceviche text-primary mb-4 tracking-wider drop-shadow-lg ">
            Community Cypher
          </h1>
          <p className="text-lg md:text-xl font-merienda text-white mb-6 max-w-2xl mx-auto">
            Prove you know what a good bar is, and put yourself to the test. Drop a crazy 16 or go bar-for-bar with a friend.
          </p>
          
          {/* Join the Cypher Button - Only for non-authenticated users */}
          {!user && <div className="mb-8">
              <Link to="/auth">
                <ThemedButton className="bg-[var(--theme-background)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-[var(--theme-background)] font-mogra text-lg px-8 py-3 shadow-lg">
                  <PenTool className="w-5 h-5 mr-2" />
                  Join the Cypher
                </ThemedButton>
              </Link>
            </div>}
        </div>

        {/* Comments Section */}
        <ThemedCard className="bg-[var(--theme-backgroundLight)] border-[var(--theme-primary)]/50 border-4 shadow-2xl shadow-[var(--theme-primary)]/20">
          <ThemedCardContent className="p-6 bg-black">
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-yellow-400 font-mogra text-xl">
                  The Cypher
                </h2>
              </div>
              
              <Select value={sortBy} onValueChange={(value: 'top' | 'latest') => setSortBy(value)}>
                <SelectTrigger className="w-40 bg-yellow-400/20 border-yellow-400/50 text-yellow-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-yellow-400/50">
                  <SelectItem value="top" className="text-yellow-400 focus:bg-yellow-400/20">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="w-4 h-4" />
                      Top Voted
                    </div>
                  </SelectItem>
                  <SelectItem value="latest" className="text-yellow-400 focus:bg-yellow-400/20">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Latest
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comment Input - Only for authenticated users */}
            {user ? <div className="bg-black/50 border border-yellow-400/30 rounded-lg p-4 mb-6">
                <ResponsiveInstructions />
                <ThemedTextarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Drop your hottest bars here... Let the community know what you're made of! 🔥" className="w-full bg-transparent text-[var(--theme-text)] placeholder-[var(--theme-primary)]/60 border-none resize-none focus:outline-none font-[var(--theme-fontBody)] min-h-32" maxLength={maxCharacters} />
                
                <div className="flex justify-between items-center mt-3">
                  <ThemedButton onClick={handleCommentSubmit} disabled={!newComment.trim() || isCreatingComment || isOverLimit} className="bg-[hsl(var(--theme-primary))] text-[hsl(var(--theme-textLight))] hover:bg-[hsl(var(--theme-primaryLight))] font-mogra disabled:opacity-50">
                    {isCreatingComment ? "Dropping..." : "Drop Bars"}
                  </ThemedButton>
                  
                  <span className={`text-sm font-mono ${isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-yellow-400/60'}`}>
                    {characterCount}/{maxCharacters}
                  </span>
                </div>
              </div> : <div className="text-center py-8 border border-yellow-400/30 rounded-lg mb-6">
                <PenTool className="w-12 h-12 text-yellow-400/60 mx-auto mb-4" />
                <h3 className="text-yellow-400 font-mogra mb-2">Ready to Battle?</h3>
                <p className="text-yellow-400/80 mb-4 font-merienda">
                  Sign in to drop your bars and join the cypher.
                </p>
                <Link to="/auth">
                    <ThemedButton className="bg-gradient-to-r from-[hsl(var(--theme-primary))] via-[hsl(var(--theme-primaryLight))] to-[hsl(var(--theme-primary))] hover:opacity-90 text-black font-bold font-mogra text-2xl py-3">
                      Sign In to Battle
                    </ThemedButton>
                </Link>
              </div>}

            {/* Comments List */}
            <div className="space-y-0">
              {isLoading ? <div className="text-center py-8">
                  <p className="text-yellow-400 font-merienda">Loading the cypher...</p>
                </div> : comments.length === 0 ? <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-yellow-400/60 mx-auto mb-6" />
                  <h3 className="text-yellow-400 font-mogra text-xl mb-3">The Cypher is Empty</h3>
                  <p className="text-yellow-400/80 font-merienda text-lg">
                    Be the first to drop some fire bars and get this cypher started!
                  </p>
                </div> : <>
                  {comments.map(comment => <CommentItem key={comment.id} comment={comment} onReply={handleReply} onLike={toggleLike} onDelete={deleteComment} currentUserId={user?.id} isLiking={isTogglingLike} isDeletingComment={isDeletingComment} />)}
                  
                  {/* Load More Button */}
                  {hasMore && <div className="text-center mt-8">
                      <ThemedButton onClick={loadMore} variant="outline" className="border-[var(--theme-primary)]/50 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/20 font-merienda">
                        Load More Bars
                      </ThemedButton>
                    </div>}
                </>}
            </div>
            </ThemedCardContent>
        </ThemedCard>
      </div>

      <Footer />
    </div>;
};
export default CommunityCypher;