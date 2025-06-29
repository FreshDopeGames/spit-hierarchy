import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";

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

// Helper function to construct rapper image URLs with size support
const getRapperImageUrl = (basePath: string, size?: 'thumb' | 'medium' | 'large' | 'xlarge'): string => {
  // If basePath is already a full URL, return as is (backward compatibility)
  if (basePath.startsWith('http')) {
    return basePath;
  }
  
  // If no size specified, default to xlarge for best quality
  const sizeFile = size || 'xlarge';
  
  // Construct the full Supabase storage URL with size
  return `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/${basePath}/${sizeFile}.jpg`;
};

// Optimized hook to get rapper image - now with size support and proper fallbacks
export const useRapperImage = (rapperId: string, size?: 'thumb' | 'medium' | 'large' | 'xlarge') => {
  return useQuery({
    queryKey: ["rapper-image", rapperId, "comic_book", size],
    queryFn: async () => {
      // Try to get comic_book style first, then fallback to legacy image_url
      const { data: images } = await supabase
        .from("rapper_images")
        .select("image_url, style")
        .eq("rapper_id", rapperId)
        .eq("style", "comic_book")
        .limit(1);

      // Check if we have a comic_book style image
      if (images && images.length > 0 && images[0].image_url) {
        const basePath = images[0].image_url;
        
        // If it's already a full URL (legacy), return as-is
        if (basePath.startsWith('http')) {
          return basePath;
        }
        
        // Otherwise, construct the URL with the requested size
        const imageUrl = getRapperImageUrl(basePath, size);
        
        // Test if the specific size exists by making a HEAD request
        try {
          const response = await fetch(imageUrl, { method: 'HEAD' });
          if (response.ok) {
            return imageUrl;
          }
        } catch (error) {
          console.log(`Size ${size} not found for rapper ${rapperId}, trying original`);
        }
        
        // If specific size doesn't exist, try original
        const originalUrl = getRapperImageUrl(basePath, 'xlarge');
        try {
          const response = await fetch(originalUrl, { method: 'HEAD' });
          if (response.ok) {
            return originalUrl;
          }
        } catch (error) {
          console.log(`Original size not found for rapper ${rapperId}`);
        }
      }

      // Fallback to the legacy image_url field
      const { data: rapper } = await supabase
        .from("rappers")
        .select("image_url")
        .eq("id", rapperId)
        .single();

      // For legacy URLs, return as-is since they're already full URLs
      return rapper?.image_url || null;
    },
    enabled: !!rapperId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Batch hook for loading multiple rapper images efficiently
export const useRapperImages = (rapperIds: string[], size?: 'thumb' | 'medium' | 'large' | 'xlarge') => {
  return useQuery({
    queryKey: ["rapper-images-batch", rapperIds, "comic_book", size],
    queryFn: async () => {
      if (rapperIds.length === 0) return {};

      // Get all comic_book style images for the requested rappers
      const { data: images } = await supabase
        .from("rapper_images")
        .select("rapper_id, image_url, style")
        .in("rapper_id", rapperIds)
        .eq("style", "comic_book");

      // Get legacy image URLs for rappers that don't have comic_book images
      const { data: rappers } = await supabase
        .from("rappers")
        .select("id, image_url")
        .in("id", rapperIds);

      // Build the result map
      const imageMap: Record<string, string | null> = {};
      
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
        imageMap[rapperId] = rapper?.image_url || null;
      }

      return imageMap;
    },
    enabled: rapperIds.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};
