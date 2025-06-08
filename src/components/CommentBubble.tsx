
import { useState, useEffect } from "react";
import { MessageCircle, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

interface CommentBubbleProps {
  contentType: "rapper" | "blog" | "ranking";
  contentId: string;
}

const CommentBubble = ({ contentType, contentId }: CommentBubbleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const { user } = useAuth();

  // Mock comment count for now - will be replaced with real data later
  const commentCount = 12;

  // Animation effect - hop every 10 seconds when collapsed
  useEffect(() => {
    if (isExpanded) return;

    const interval = setInterval(() => {
      setShouldAnimate(true);
      setTimeout(() => setShouldAnimate(false), 600); // Animation duration
    }, 10000); // Every 10 seconds

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

  return (
    <>
      {/* Collapsed Comment Bubble */}
      {!isExpanded && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsExpanded(true)}
            className={`bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light rounded-full h-14 px-6 shadow-lg shadow-rap-gold/30 transition-transform duration-300 font-merienda ${
              shouldAnimate ? 'animate-bounce' : ''
            }`}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">{commentCount}</span>
          </Button>
        </div>
      )}

      {/* Expanded Comment Modal */}
      {isExpanded && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-black/80 backdrop-blur-sm">
          <Card className="bg-carbon-fiber/90 border-rap-gold/50 border-2 rounded-t-2xl rounded-b-none border-b-0 max-h-[70vh] shadow-lg shadow-rap-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-rap-gold font-mogra">
                Comments on this {getContentTypeLabel()}
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
                  <Button className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra">
                    Sign In to Comment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Comment Input */}
                  <div className="bg-rap-carbon/50 border border-rap-gold/30 rounded-lg p-4">
                    <textarea
                      placeholder={`Share your thoughts about this ${getContentTypeLabel()}...`}
                      className="w-full bg-transparent text-rap-platinum placeholder-rap-smoke border-none resize-none focus:outline-none font-merienda"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra">
                        Post Comment
                      </Button>
                    </div>
                  </div>

                  {/* Mock Comments */}
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="bg-rap-carbon/30 border border-rap-gold/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-rap-burgundy via-rap-gold to-rap-forest rounded-full flex items-center justify-center text-black text-sm font-bold">
                            U{i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-rap-gold font-mogra">User{i + 1}</span>
                              <span className="text-rap-smoke text-sm font-merienda">2h ago</span>
                            </div>
                            <p className="text-rap-platinum font-merienda">
                              This is a sample comment about this {getContentTypeLabel()}. 
                              {i === 0 && " Really great analysis and I totally agree with the points made here."}
                              {i === 1 && " I have a different perspective on this one..."}
                              {i === 2 && " Solid choice! Definitely deserves the recognition."}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <Button variant="ghost" size="sm" className="text-rap-gold hover:text-rap-gold-light hover:bg-rap-gold/20 h-auto p-1 font-merienda">
                                ↑ {Math.floor(Math.random() * 20) + 1}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-rap-gold hover:text-rap-gold-light hover:bg-rap-gold/20 h-auto p-1 font-merienda">
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
