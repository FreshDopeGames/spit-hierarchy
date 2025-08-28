
import { Link } from "react-router-dom";
import InternalPageHeader from "@/components/InternalPageHeader";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";

const BlogDetailError = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--theme-background)] via-[var(--theme-backgroundLight)] to-[var(--theme-background)]">
      <InternalPageHeader 
        backLink="/blog" 
        backText="Back to Blog" 
      />
      <main className="max-w-4xl mx-auto p-6 pt-24">
        <Card className="bg-[var(--theme-surface)] border border-[var(--theme-border)]">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-[var(--theme-fontPrimary)] text-[var(--theme-primary)] mb-4">Sacred Scroll Not Found</h1>
            <p className="text-[var(--theme-text)] mb-6">This scroll may have been lost to the winds of time.</p>
            <Link to="/blog" className="text-[var(--theme-primary)] hover:text-[var(--theme-primary)]/80">
              Return to Sacred Scrolls
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BlogDetailError;
