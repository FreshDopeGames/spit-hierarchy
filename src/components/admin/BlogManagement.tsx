
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogPostDialog from "./BlogPostDialog";
import BlogCategoryDialog from "./BlogCategoryDialog";
import BlogManagementHeader from "./blog/BlogManagementHeader";
import BlogPostsTab from "./blog/BlogPostsTab";
import BlogCategoriesTab from "./blog/BlogCategoriesTab";

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

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setShowCategoryDialog(true);
  };

  const handleNewPost = () => {
    setSelectedPost(null);
    setShowPostDialog(true);
  };

  const handleNewCategory = () => {
    setSelectedCategory(null);
    setShowCategoryDialog(true);
  };

  return (
    <div className="space-y-6">
      <BlogManagementHeader onNewPost={handleNewPost} />

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="bg-carbon-fiber border border-rap-gold/30">
          <TabsTrigger value="posts" className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon">Posts</TabsTrigger>
          <TabsTrigger value="categories" className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <BlogPostsTab
            onEditPost={handleEditPost}
            onNewPost={handleNewPost}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <BlogCategoriesTab
            onEditCategory={handleEditCategory}
            onNewCategory={handleNewCategory}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BlogPostDialog 
        open={showPostDialog} 
        onOpenChange={setShowPostDialog} 
        post={selectedPost} 
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
          setShowPostDialog(false);
          setSelectedPost(null);
        }} 
      />

      <BlogCategoryDialog 
        open={showCategoryDialog} 
        onOpenChange={setShowCategoryDialog} 
        category={selectedCategory} 
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
          setShowCategoryDialog(false);
          setSelectedCategory(null);
        }} 
      />
    </div>
  );
};

export default BlogManagement;
