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

// Optimized hook to get rapper image - now always uses comic_book style
export const useRapperImage = (rapperId: string) => {
  return useQuery({
    queryKey: ["rapper-image", rapperId, "comic_book"],
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
        return images[0].image_url;
      }

      // Fallback to the legacy image_url field
      const { data: rapper } = await supabase
        .from("rappers")
        .select("image_url")
        .eq("id", rapperId)
        .single();

      return rapper?.image_url || null;
    },
    enabled: !!rapperId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Batch hook for loading multiple rapper images efficiently - simplified to comic_book only
export const useRapperImages = (rapperIds: string[]) => {
  return useQuery({
    queryKey: ["rapper-images-batch", rapperIds, "comic_book"],
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
      
      rapperIds.forEach(rapperId => {
        // Try to find the comic_book style first
        const comicBookImage = images?.find(img => img.rapper_id === rapperId && img.style === "comic_book");
        if (comicBookImage?.image_url) {
          imageMap[rapperId] = comicBookImage.image_url;
          return;
        }

        // Fallback to legacy image_url
        const rapper = rappers?.find(r => r.id === rapperId);
        imageMap[rapperId] = rapper?.image_url || null;
      });

      return imageMap;
    },
    enabled: rapperIds.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};
