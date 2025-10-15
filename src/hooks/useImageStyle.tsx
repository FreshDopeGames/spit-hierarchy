import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";

type ImageStyle = Database["public"]["Enums"]["image_style"];

// Simplified hook that always uses comic_book style
export const useImageStyle = () => {
  const { user } = useAuth();
  
  // Always return comic_book as the current style
  const currentStyle: ImageStyle = "comic_book";
  
  // No-op function for setting style (keeping interface consistent)
  const setImageStyle = (style: ImageStyle) => {
    // This is now a no-op since we only use comic_book style
    console.log("Image style setting disabled - using comic_book by default");
  };

  return {
    currentStyle,
    setImageStyle,
    isLoading: false,
    isUpdating: false
  };
};

// Helper function to construct rapper image URLs with size support and proper error handling
const getRapperImageUrl = (basePath: string, size?: 'thumb' | 'medium' | 'large' | 'xlarge' | 'original'): string => {
  // If basePath is already a full URL, return as is (backward compatibility)
  if (basePath.startsWith('http')) {
    return basePath;
  }
  
  // For original size, use the uploaded image file name directly
  if (size === 'original') {
    const originalUrl = `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/${basePath}`;
    console.log('Constructed original image URL:', {
      basePath,
      size,
      url: originalUrl
    });
    return originalUrl;
  }
  
  // If no size specified, default to xlarge for best quality
  const sizeFile = size || 'xlarge';
  
  // Construct the full Supabase storage URL with size
  const imageUrl = `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/${basePath}/${sizeFile}.jpg`;
  
  console.log('Constructed image URL:', {
    basePath,
    size: sizeFile,
    url: imageUrl
  });
  
  return imageUrl;
};

// Enhanced hook to get rapper image with better error handling and fallbacks
export const useRapperImage = (rapperId: string, size?: 'thumb' | 'medium' | 'large' | 'xlarge' | 'original') => {
  return useQuery({
    queryKey: ["rapper-image", rapperId, "comic_book", size],
    queryFn: async () => {
      console.log(`Fetching rapper image for ID: ${rapperId}, size: ${size}`);
      
      try {
        // Try to get comic_book style first
        const { data: images, error: imagesError } = await supabase
          .from("rapper_images")
          .select("image_url, style")
          .eq("rapper_id", rapperId)
          .eq("style", "comic_book")
          .limit(1);

        if (imagesError) {
          console.error('Error fetching rapper images:', imagesError);
        }

        // Check if we have a comic_book style image
        if (images && images.length > 0 && images[0].image_url) {
          const basePath = images[0].image_url;
          console.log('Found comic_book image with base path:', basePath);
          
          // If it's already a full URL (legacy), return as-is
          if (basePath.startsWith('http')) {
            console.log('Using legacy full URL:', basePath);
            return basePath;
          }
          
          // Otherwise, construct the URL with the requested size
          const imageUrl = getRapperImageUrl(basePath, size);
          
          // Test if the specific size exists by making a HEAD request
          try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            if (response.ok) {
              console.log(`Size ${size} exists for rapper ${rapperId}`);
              return imageUrl;
            } else {
              console.warn(`Size ${size} not accessible for rapper ${rapperId}, status:`, response.status);
            }
          } catch (fetchError) {
            console.warn(`Network error testing ${size} for rapper ${rapperId}:`, fetchError);
          }
          
          // For original size, try without fallback first, then try xlarge
          if (size === 'original') {
            // Original size request failed, try xlarge as fallback
            const xlargeUrl = getRapperImageUrl(basePath, 'xlarge');
            try {
              const response = await fetch(xlargeUrl, { method: 'HEAD' });
              if (response.ok) {
                console.log(`Using xlarge fallback for original request for rapper ${rapperId}`);
                return xlargeUrl;
              }
            } catch (fetchError) {
              console.warn(`Network error testing xlarge fallback for original request for rapper ${rapperId}:`, fetchError);
            }
          } else if (size !== 'xlarge') {
            // If specific size doesn't exist, try xlarge as fallback
            const xlargeUrl = getRapperImageUrl(basePath, 'xlarge');
            try {
              const response = await fetch(xlargeUrl, { method: 'HEAD' });
              if (response.ok) {
                console.log(`Using xlarge fallback for rapper ${rapperId}`);
                return xlargeUrl;
              }
            } catch (fetchError) {
              console.warn(`Network error testing xlarge fallback for rapper ${rapperId}:`, fetchError);
            }
          }
        }

        // Fallback to the legacy image_url field
        console.log('Falling back to legacy image_url field');
        const { data: rapper, error: rapperError } = await supabase
          .from("rappers")
          .select("image_url")
          .eq("id", rapperId)
          .single();

        if (rapperError) {
          console.error('Error fetching rapper legacy image:', rapperError);
          return getOptimizedPlaceholder(size);
        }

        // For legacy URLs, return as-is since they're already full URLs
        const legacyUrl = rapper?.image_url;
        if (legacyUrl && legacyUrl.trim() !== "") {
          console.log('Using legacy image URL:', legacyUrl);
          return legacyUrl;
        }

        // Final fallback to optimized placeholder
        console.log('No rapper image found, using optimized placeholder');
        return getOptimizedPlaceholder(size);
        
      } catch (error) {
        console.error('Unexpected error in useRapperImage:', error);
        return getOptimizedPlaceholder(size);
      }
    },
    enabled: !!rapperId,
    staleTime: 30 * 60 * 1000, // 30 minutes - rapper images rarely change
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on network errors, but retry on other errors up to 2 times
      return failureCount < 2;
    }
  });
};

// Enhanced batch hook for loading multiple rapper images efficiently
export const useRapperImages = (rapperIds: string[], size?: 'thumb' | 'medium' | 'large' | 'xlarge' | 'original') => {
  return useQuery({
    queryKey: ["rapper-images-batch", rapperIds, "comic_book", size],
    queryFn: async () => {
      if (rapperIds.length === 0) return {};

      console.log(`Batch loading images for ${rapperIds.length} rappers, size: ${size}`);

      try {
        // Get all comic_book style images for the requested rappers
        const { data: images, error: imagesError } = await supabase
          .from("rapper_images")
          .select("rapper_id, image_url, style")
          .in("rapper_id", rapperIds)
          .eq("style", "comic_book");

        if (imagesError) {
          console.error('Error in batch image fetch:', imagesError);
        }

        // Get legacy image URLs for rappers that don't have comic_book images
        const { data: rappers, error: rappersError } = await supabase
          .from("rappers")
          .select("id, image_url")
          .in("id", rapperIds);

        if (rappersError) {
          console.error('Error fetching legacy rapper images:', rappersError);
        }

        // Build the result map
        const imageMap: Record<string, string> = {};
        
        for (const rapperId of rapperIds) {
          // Try to find the comic_book style first
          const comicBookImage = images?.find(img => img.rapper_id === rapperId && img.style === "comic_book");
          
          if (comicBookImage?.image_url) {
            const basePath = comicBookImage.image_url;
            
            // If it's already a full URL (legacy), use as-is
            if (basePath.startsWith('http')) {
              imageMap[rapperId] = basePath;
              continue;
            }
            
            // Otherwise, construct the URL with the requested size
            imageMap[rapperId] = getRapperImageUrl(basePath, size);
            continue;
          }

          // Fallback to legacy image_url (already full URLs)
          const rapper = rappers?.find(r => r.id === rapperId);
          if (rapper?.image_url && rapper.image_url.trim() !== "") {
            imageMap[rapperId] = rapper.image_url;
          } else {
            // Final fallback to optimized placeholder
            imageMap[rapperId] = getOptimizedPlaceholder(size);
          }
        }

        console.log(`Batch loading completed for ${Object.keys(imageMap).length} rappers`);
        return imageMap;
        
      } catch (error) {
        console.error('Unexpected error in batch image loading:', error);
        // Return optimized placeholder for all rappers on error
        const errorMap: Record<string, string> = {};
        rapperIds.forEach(id => {
          errorMap[id] = getOptimizedPlaceholder(size);
        });
        return errorMap;
      }
    },
    enabled: rapperIds.length > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes - rapper images rarely change
    refetchOnWindowFocus: false,
    retry: 2
  });
};
