import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import BlogPostList from "./BlogPostList";

interface BlogPostsTabProps {
  onEditPost: (post: any) => void;
  onNewPost: () => void;
}

type StatusFilter = "all" | "draft" | "published" | "scheduled";

const BlogPostsTab = ({ onEditPost, onNewPost }: BlogPostsTabProps) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Fetch all admin-visible blog posts, including drafts, with author information.
  // Always refetch on mount and focus so editors immediately see new drafts they
  // (or other staff) just created.
  const { data: posts, isLoading: postsLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_blog_posts');
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

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

  const counts = {
    all: posts?.length ?? 0,
    draft: posts?.filter(p => p.status === 'draft').length ?? 0,
    published: posts?.filter(p => p.status === 'published').length ?? 0,
    scheduled: posts?.filter(p => p.status === 'scheduled').length ?? 0,
  };

  const filteredPosts = posts?.filter(post => {
    const matchesStatus = statusFilter === 'all' ? true : post.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      post.title.toLowerCase().includes(term) ||
      (post.status || '').toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(postId);
    }
  };

  const filterButtons: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Drafts' },
    { value: 'published', label: 'Published' },
    { value: 'scheduled', label: 'Scheduled' },
  ];

  return (
    <ThemedCard>
      <ThemedCardHeader>
        <ThemedCardTitle className="mb-4 text-center text-2xl">Blog Posts</ThemedCardTitle>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-textMuted)] w-4 h-4" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)]"
              />
            </div>
            <div className="flex gap-2">
              <ThemedButton
                onClick={() => refetch()}
                variant="outline"
                title="Refresh post list"
                disabled={isFetching}
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </ThemedButton>
              <ThemedButton
                onClick={onNewPost}
                className="font-[var(--theme-font-heading)]"
                variant="default"
              >
                New Post
              </ThemedButton>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => {
              const active = statusFilter === btn.value;
              return (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => setStatusFilter(btn.value)}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wide rounded-md border transition-colors ${
                    active
                      ? 'bg-[var(--theme-primary)] text-[var(--theme-background)] border-[var(--theme-primary)]'
                      : 'bg-transparent text-[var(--theme-text)] border-[var(--theme-border)] hover:border-[var(--theme-primary)]'
                  }`}
                >
                  {btn.label} ({counts[btn.value]})
                </button>
              );
            })}
          </div>
        </div>
      </ThemedCardHeader>
      <ThemedCardContent>
        <BlogPostList
          posts={filteredPosts}
          isLoading={postsLoading}
          onEditPost={onEditPost}
          onDeletePost={handleDeletePost}
        />
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogPostsTab;
