
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
            className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full h-14 px-6 shadow-lg transition-transform duration-300 ${
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
          <Card className="bg-black/90 border-purple-500/30 rounded-t-2xl rounded-b-none border-b-0 max-h-[70vh]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-white">
                Comments on this {getContentTypeLabel()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronUp className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="overflow-y-auto max-h-[50vh]">
              {!user ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">Join the Conversation</h3>
                  <p className="text-gray-400 mb-4">
                    Sign in to read and share your thoughts about this {getContentTypeLabel()}.
                  </p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Sign In to Comment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Comment Input */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <textarea
                      placeholder={`Share your thoughts about this ${getContentTypeLabel()}...`}
                      className="w-full bg-transparent text-white placeholder-gray-400 border-none resize-none focus:outline-none"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                        Post Comment
                      </Button>
                    </div>
                  </div>

                  {/* Mock Comments */}
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="bg-gray-800/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            U{i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-semibold">User{i + 1}</span>
                              <span className="text-gray-400 text-sm">2h ago</span>
                            </div>
                            <p className="text-gray-300">
                              This is a sample comment about this {getContentTypeLabel()}. 
                              {i === 0 && " Really great analysis and I totally agree with the points made here."}
                              {i === 1 && " I have a different perspective on this one..."}
                              {i === 2 && " Solid choice! Definitely deserves the recognition."}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-auto p-1">
                                ↑ {Math.floor(Math.random() * 20) + 1}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-auto p-1">
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
