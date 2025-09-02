import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ThemedTabs, ThemedTabsContent, ThemedTabsList, ThemedTabsTrigger } from "@/components/ui/themed-tabs";
import { PenTool } from "lucide-react";
import BlogPostsTab from "./blog/BlogPostsTab";
import BlogCategoriesTab from "./blog/BlogCategoriesTab";
import BlogPostDialog from "./BlogPostDialog";
import BlogCategoryDialog from "./BlogCategoryDialog";
import AdminTabHeader from "./AdminTabHeader";

const BlogManagement = () => {
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const handleEditPost = (post: any) => {
    setSelectedPost(post);
    setShowPostDialog(true);
  };

  const handleNewPost = () => {
    setSelectedPost(null);
    setShowPostDialog(true);
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setShowCategoryDialog(true);
  };

  const handleNewCategory = () => {
    setSelectedCategory(null);
    setShowCategoryDialog(true);
  };

  const handlePostSuccess = () => {
    // Refresh blog posts data
    queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    // Close dialog and reset state
    setShowPostDialog(false);
    setSelectedPost(null);
  };

  const handleCategorySuccess = () => {
    // Refresh categories data
    queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    // Close dialog and reset state
    setShowCategoryDialog(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      <AdminTabHeader 
        title="Blog Management" 
        icon={PenTool}
        description="Create and manage blog posts and categories"
      />

      <ThemedTabs defaultValue="posts" className="space-y-4">
        <ThemedTabsList className="w-full grid grid-cols-2 p-2 gap-1">
          <ThemedTabsTrigger value="posts">
            Posts
          </ThemedTabsTrigger>
          <ThemedTabsTrigger value="categories">
            Categories
          </ThemedTabsTrigger>
        </ThemedTabsList>

        <ThemedTabsContent value="posts">
          <BlogPostsTab 
            onEditPost={handleEditPost}
            onNewPost={handleNewPost}
          />
        </ThemedTabsContent>

        <ThemedTabsContent value="categories">
          <BlogCategoriesTab 
            onEditCategory={handleEditCategory}
            onNewCategory={handleNewCategory}
          />
        </ThemedTabsContent>
      </ThemedTabs>

      {/* Blog Post Dialog */}
      <BlogPostDialog
        open={showPostDialog}
        onOpenChange={setShowPostDialog}
        post={selectedPost}
        onSuccess={handlePostSuccess}
      />

      {/* Blog Category Dialog */}
      <BlogCategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        category={selectedCategory}
        onSuccess={handleCategorySuccess}
      />
    </div>
  );
};

export default BlogManagement;
