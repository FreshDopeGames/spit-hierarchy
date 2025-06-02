
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import BlogPostDialog from "./BlogPostDialog";
import BlogCategoryDialog from "./BlogCategoryDialog";

const BlogManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  // Fetch blog posts with author information
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      // First get the blog posts with category info
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories(name)
        `)
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;

      // Then get profiles for authors
      const authorIds = postsData?.map(post => post.author_id).filter(Boolean) || [];
      
      let profilesData = [];
      if (authorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .in('id', authorIds);
        
        if (profilesError) throw profilesError;
        profilesData = profiles || [];
      }

      // Combine the data
      const postsWithAuthors = postsData?.map(post => ({
        ...post,
        author_profile: profilesData.find(profile => profile.id === post.author_id)
      }));

      return postsWithAuthors;
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error('Error deleting post: ' + error.message);
    }
  });

  // Filter posts based on search
  const filteredPosts = posts?.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      published: "default",
      archived: "outline"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const handleEditPost = (post: any) => {
    setSelectedPost(post);
    setShowPostDialog(true);
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setShowCategoryDialog(true);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(postId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-mogra text-rap-gold">Blog Management</h2>
        <Button 
          onClick={() => {
            setSelectedPost(null);
            setShowPostDialog(true);
          }}
          className="bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light font-mogra"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="bg-carbon-fiber border border-rap-gold/30">
          <TabsTrigger value="posts" className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon">Posts</TabsTrigger>
          <TabsTrigger value="categories" className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <Card className="bg-carbon-fiber border border-rap-gold/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-rap-platinum font-ceviche">Blog Posts</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-rap-carbon border-rap-smoke text-rap-platinum"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-rap-smoke">Loading posts...</div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts?.map((post) => (
                    <div key={post.id} className="border border-rap-smoke/30 rounded-lg p-4 hover:border-rap-gold/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-rap-platinum mb-2">{post.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-rap-smoke mb-2">
                            <span>By: {post.author_profile?.full_name || post.author_profile?.username || 'Unknown'}</span>
                            <span>Category: {post.blog_categories?.name || 'Uncategorized'}</span>
                            <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(post.status)}
                            {post.featured && <Badge className="bg-rap-gold text-rap-carbon">Featured</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/blog/${post.id}`, '_blank')}
                            className="border-rap-smoke text-rap-smoke hover:border-rap-gold hover:text-rap-gold"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPost(post)}
                            className="border-rap-smoke text-rap-smoke hover:border-rap-gold hover:text-rap-gold"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePost(post.id)}
                            className="border-red-500 text-red-500 hover:border-red-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="bg-carbon-fiber border border-rap-gold/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-rap-platinum font-ceviche">Categories</CardTitle>
                <Button 
                  onClick={() => {
                    setSelectedCategory(null);
                    setShowCategoryDialog(true);
                  }}
                  className="bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light font-mogra"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories?.map((category) => (
                  <div key={category.id} className="border border-rap-smoke/30 rounded-lg p-4 hover:border-rap-gold/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-rap-platinum mb-1">{category.name}</h3>
                        <p className="text-rap-smoke text-sm mb-2">{category.description}</p>
                        <span className="text-xs text-rap-smoke">Slug: {category.slug}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                        className="border-rap-smoke text-rap-smoke hover:border-rap-gold hover:text-rap-gold"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
