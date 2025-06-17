
export interface BlogPostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  featured_image_url: string;
  category_id: string;
  status: string;
  featured: boolean;
}

export const createEmptyFormData = (): BlogPostFormData => ({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  meta_title: '',
  meta_description: '',
  featured_image_url: '',
  category_id: '',
  status: 'draft',
  featured: false
});

export const createFormDataFromPost = (post: any): BlogPostFormData => ({
  title: post.title || '',
  slug: post.slug || '',
  excerpt: post.excerpt || '',
  content: post.content || '',
  meta_title: post.meta_title || '',
  meta_description: post.meta_description || '',
  featured_image_url: post.featured_image_url || '',
  category_id: post.category_id || '',
  status: post.status || 'draft',
  featured: post.featured || false
});

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};
