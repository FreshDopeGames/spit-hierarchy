
import InternalPageHeader from "@/components/InternalPageHeader";

const BlogDetailLoading = () => {
  return (
    <div className="min-h-screen bg-black">
      <InternalPageHeader 
        backLink="/blog" 
        backText="Back to Blog" 
      />
      <main className="max-w-4xl mx-auto p-6 pt-24">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-600 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogDetailLoading;
