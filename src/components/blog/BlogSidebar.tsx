
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Vote } from "lucide-react";
import { Link } from "react-router-dom";

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  timeAgo: string;
}
interface BlogSidebarProps {
  relatedPosts: RelatedPost[];
  showSignUp?: boolean;
}
const BlogSidebar = ({
  relatedPosts,
  showSignUp = false
}: BlogSidebarProps) => {
  return <div className="space-y-6">
      {/* Related Posts */}
      {relatedPosts.length > 0 && <Card className="bg-carbon-fiber border border-rap-gold/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-rap-gold font-ceviche font-normal text-2xl text-center">More Writtens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {relatedPosts.map(post => <Link key={post.id} to={`/blog/${post.id}`} className="block group">
                <div className="flex lg:flex-col gap-4 lg:gap-3 p-3 rounded-lg hover:bg-rap-carbon/30 transition-colors">
                  <div className="flex-shrink-0 lg:w-full">
                    <img src={post.imageUrl} alt={post.title} className="w-20 h-16 lg:w-full lg:h-32 object-cover rounded-md group-hover:opacity-80 transition-opacity" />
                  </div>
                  <div className="flex-1 lg:w-full min-w-0 space-y-2">
                    <h4 className="font-kaushan text-sm text-rap-platinum group-hover:text-rap-gold transition-colors line-clamp-3 leading-snug">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-rap-smoke">
                      <Clock className="w-3 h-3" />
                      <span>{post.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </Link>)}
          </CardContent>
        </Card>}

      {/* Newsletter Signup */}
      {showSignUp && <Card className="bg-gradient-to-br from-rap-burgundy/20 to-rap-forest/20 border border-rap-gold/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-rap-gold font-ceviche text-lg">Join the Temple</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-rap-platinum font-kaushan mb-4 text-sm">
              Subscribe to receive the latest sacred scrolls and exclusive insights from the temple.
            </p>
            <Link to="/auth">
              <Button className="w-full bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra text-sm">
                Join Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>}

      {/* All Rankings Voting Module */}
      <Card className="bg-rap-carbon border border-rap-gold/40">
        <CardContent className="p-6 text-center space-y-4">
          <h3 className="text-rap-gold font-ceviche text-3xl">All Rankings</h3>
          <p className="text-rap-platinum font-kaushan text-base pb-2">
            Your Voice Matters
          </p>
          <Link to="/rankings">
            <Button className="bg-rap-gold text-black hover:bg-rap-gold-light font-medium">
              <Vote className="w-4 h-4 mr-2" />
              Vote
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>;
};
export default BlogSidebar;
