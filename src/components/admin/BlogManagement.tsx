
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenTool } from "lucide-react";
import BlogPostsTab from "./blog/BlogPostsTab";
import BlogCategoriesTab from "./blog/BlogCategoriesTab";
import AdminTabHeader from "./AdminTabHeader";

const BlogManagement = () => {
  return (
    <div className="space-y-6">
      <AdminTabHeader 
        title="Blog Management" 
        icon={PenTool}
        description="Create and manage blog posts and categories"
      />

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="bg-[var(--theme-surface)] border border-[var(--theme-border)] w-full grid grid-cols-2 p-2 gap-1 rounded-lg">
          <TabsTrigger 
            value="posts" 
            className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-sm px-4 py-2 rounded-md"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-sm px-4 py-2 rounded-md"
          >
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <BlogPostsTab />
        </TabsContent>

        <TabsContent value="categories">
          <BlogCategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogManagement;
