
import { useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, User, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import InternalPageHeader from "@/components/InternalPageHeader";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  author_id: string;
  blog_categories?: {
    name: string;
  };
  blog_post_tags?: Array<{
    blog_tags: {
      name: string;
      slug: string;
    };
  }>;
}

const POSTS_PER_PAGE = 6;

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedTag = searchParams.get('tag') || '';

  // Fetch blog categories
  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('id, name, slug')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch blog tags
  const { data: tags } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('id, name, slug')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Infinite query for blog posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['blog-posts', selectedCategory, selectedTag],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          excerpt,
          featured_image_url,
          published_at,
          author_id,
          blog_categories(name),
          blog_post_tags(
            blog_tags(
              name,
              slug
            )
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1);

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // For tag filtering, we'll need to filter after the query since we're joining through a junction table
      const { data, error } = await query;
      if (error) throw error;

      // Filter by tag if specified
      if (selectedTag) {
        return data.filter(post => 
          post.blog_post_tags?.some(pt => pt.blog_tags.slug === selectedTag)
        ) as BlogPost[];
      }

      return data as BlogPost[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === POSTS_PER_PAGE ? allPages.length : undefined;
    },
    initialPageParam: 0
  });

  const posts = data?.pages.flat() || [];

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    newParams.delete('tag'); // Clear tag when changing category
    setSearchParams(newParams);
  };

  const handleTagClick = (tagSlug: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tag', tagSlug);
    newParams.delete('category'); // Clear category when filtering by tag
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
        <InternalPageHeader title="Sacred Scrolls" />
        <main className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-rap-platinum">Error loading blog posts. Please try again later.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <InternalPageHeader title="Sacred Scrolls" />
      
      <main className="max-w-6xl mx-auto p-6">
        {/* Active Filters */}
        {(selectedCategory !== 'all' || selectedTag) && (
          <div className="mb-6 p-4 bg-carbon-fiber border border-rap-gold/40 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-rap-gold font-kaushan">Active filters:</span>
                {selectedCategory !== 'all' && (
                  <Badge variant="outline" className="border-rap-gold text-rap-gold">
                    Category: {categories?.find(c => c.id === selectedCategory)?.name}
                  </Badge>
                )}
                {selectedTag && (
                  <Badge variant="outline" className="border-rap-forest text-rap-forest">
                    <Tag className="w-3 h-3 mr-1" />
                    Tag: {tags?.find(t => t.slug === selectedTag)?.name}
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-rap-silver hover:text-rap-gold"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-ceviche text-rap-gold mb-4">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => handleCategoryChange('all')}
              className={selectedCategory === 'all' 
                ? 'bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest text-rap-platinum' 
                : 'border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20'
              }
            >
              All Posts
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => handleCategoryChange(category.id)}
                className={selectedCategory === category.id 
                  ? 'bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest text-rap-platinum' 
                  : 'border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20'
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Tag Filter */}
        {tags && tags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-ceviche text-rap-gold mb-4">Filter by Tag</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button
                  key={tag.id}
                  variant={selectedTag === tag.slug ? 'default' : 'outline'}
                  onClick={() => handleTagClick(tag.slug)}
                  size="sm"
                  className={selectedTag === tag.slug 
                    ? 'bg-gradient-to-r from-rap-forest via-rap-gold to-rap-burgundy text-rap-platinum' 
                    : 'border-rap-forest/50 text-rap-forest hover:bg-rap-forest/20'
                  }
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-carbon-fiber border border-rap-gold/40 animate-pulse">
                <div className="aspect-video bg-rap-carbon rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-rap-carbon rounded mb-2"></div>
                  <div className="h-6 bg-rap-carbon rounded mb-4"></div>
                  <div className="h-16 bg-rap-carbon rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Blog Posts Grid */}
        {!isLoading && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Card key={post.id} className="bg-carbon-fiber border border-rap-gold/40 overflow-hidden shadow-xl shadow-rap-gold/20 hover:shadow-rap-gold/40 transition-all duration-300 group">
                  <Link to={`/blog/${post.id}`}>
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.featured_image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop"} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-rap-smoke font-kaushan text-sm mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.published_at)}</span>
                      {post.blog_categories?.name && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="border-rap-forest text-rap-forest">
                            {post.blog_categories.name}
                          </Badge>
                        </>
                      )}
                    </div>
                    
                    <Link to={`/blog/${post.id}`}>
                      <h3 className="text-xl font-ceviche text-rap-platinum hover:text-rap-gold transition-colors cursor-pointer mb-3 leading-tight">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <p className="text-rap-silver font-kaushan leading-relaxed mb-4">
                      {post.excerpt || `${post.title.substring(0, 100)}...`}
                    </p>

                    {/* Tags */}
                    {post.blog_post_tags && post.blog_post_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.blog_post_tags.slice(0, 3).map((pt, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="border-rap-forest/50 text-rap-forest hover:bg-rap-forest/20 cursor-pointer text-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              handleTagClick(pt.blog_tags.slug);
                            }}
                          >
                            <Tag className="w-2 h-2 mr-1" />
                            {pt.blog_tags.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <Link to={`/blog/${post.id}`}>
                      <Button variant="outline" className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20 group">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra shadow-lg shadow-rap-gold/30"
                >
                  {isFetchingNextPage ? 'Loading More Sacred Scrolls...' : 'Load More Sacred Scrolls'}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-2xl font-ceviche text-rap-gold mb-4">No Sacred Scrolls Found</h3>
            <p className="text-rap-platinum font-kaushan mb-6">
              {selectedCategory !== 'all' || selectedTag
                ? "No posts found matching your filters. Try adjusting your selection."
                : "No published scrolls yet. Check back soon for wisdom from the temple!"
              }
            </p>
            {(selectedCategory !== 'all' || selectedTag) && (
              <Button 
                onClick={clearFilters}
                variant="outline"
                className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
