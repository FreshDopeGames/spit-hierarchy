
import { resizeImage } from './imageUtils';

export interface BlogImageSizes {
  thumbnail: string;
  medium: string;
  large: string;
  hero: string;
}

export const BLOG_IMAGE_SIZES = {
  thumbnail: { width: 300, height: 200 },
  medium: { width: 600, height: 400 },
  large: { width: 1200, height: 800 },
  hero: { width: 1920, height: 1080 }
};

export const generateBlogImageSizes = async (originalBlob: Blob): Promise<BlogImageSizes> => {
  const sizes = await Promise.all([
    resizeImage(originalBlob, BLOG_IMAGE_SIZES.thumbnail.width, BLOG_IMAGE_SIZES.thumbnail.height),
    resizeImage(originalBlob, BLOG_IMAGE_SIZES.medium.width, BLOG_IMAGE_SIZES.medium.height),
    resizeImage(originalBlob, BLOG_IMAGE_SIZES.large.width, BLOG_IMAGE_SIZES.large.height),
    resizeImage(originalBlob, BLOG_IMAGE_SIZES.hero.width, BLOG_IMAGE_SIZES.hero.height)
  ]);

  const timestamp = Date.now();
  
  return {
    thumbnail: `blog-thumb-${timestamp}.jpg`,
    medium: `blog-medium-${timestamp}.jpg`,
    large: `blog-large-${timestamp}.jpg`,
    hero: `blog-hero-${timestamp}.jpg`
  };
};

export const uploadBlogImageSizes = async (
  supabase: any,
  originalBlob: Blob,
  sizeBlobs: {
    thumbnail: Blob;
    medium: Blob;
    large: Blob;
    hero: Blob;
  }
): Promise<BlogImageSizes> => {
  const filenames = await generateBlogImageSizes(originalBlob);
  
  const uploads = await Promise.all([
    supabase.storage.from('blog-images').upload(filenames.thumbnail, sizeBlobs.thumbnail),
    supabase.storage.from('blog-images').upload(filenames.medium, sizeBlobs.medium),
    supabase.storage.from('blog-images').upload(filenames.large, sizeBlobs.large),
    supabase.storage.from('blog-images').upload(filenames.hero, sizeBlobs.hero)
  ]);

  // Check for errors
  uploads.forEach((upload, index) => {
    if (upload.error) {
      const sizeName = Object.keys(filenames)[index];
      throw new Error(`Failed to upload ${sizeName}: ${upload.error.message}`);
    }
  });

  // Get public URLs
  const urls = {
    thumbnail: supabase.storage.from('blog-images').getPublicUrl(filenames.thumbnail).data.publicUrl,
    medium: supabase.storage.from('blog-images').getPublicUrl(filenames.medium).data.publicUrl,
    large: supabase.storage.from('blog-images').getPublicUrl(filenames.large).data.publicUrl,
    hero: supabase.storage.from('blog-images').getPublicUrl(filenames.hero).data.publicUrl
  };

  return urls;
};
