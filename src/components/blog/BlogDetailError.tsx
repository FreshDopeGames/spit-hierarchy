
import { Link } from "react-router-dom";
import InternalPageHeader from "@/components/InternalPageHeader";
import { Card, CardContent } from "@/components/ui/card";

const BlogDetailError = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <InternalPageHeader 
        backLink="/blog" 
        backText="Back to Blog" 
      />
      <main className="max-w-4xl mx-auto p-6 pt-24">
        <Card className="bg-carbon-fiber border border-rap-gold/40">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-ceviche text-rap-gold mb-4">Sacred Scroll Not Found</h1>
            <p className="text-rap-platinum mb-6">This scroll may have been lost to the winds of time.</p>
            <Link to="/blog" className="text-rap-gold hover:text-rap-gold-light">
              Return to Sacred Scrolls
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BlogDetailError;
