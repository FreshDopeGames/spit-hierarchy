
import InternalPageHeader from "@/components/InternalPageHeader";

const BlogDetailLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <InternalPageHeader 
        backLink="/blog" 
        backText="Back to Blog" 
      />
      <main className="max-w-4xl mx-auto p-6 pt-24">
        <div className="animate-pulse">
          <div className="h-8 bg-rap-carbon rounded mb-4"></div>
          <div className="h-64 bg-rap-carbon rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-rap-carbon rounded"></div>
            <div className="h-4 bg-rap-carbon rounded"></div>
            <div className="h-4 bg-rap-carbon rounded w-3/4"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogDetailLoading;
