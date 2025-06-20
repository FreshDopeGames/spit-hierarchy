
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";

type ImageStyle = Database["public"]["Enums"]["image_style"];

export const useImageStyle = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [guestPreference, setGuestPreference] = useState<ImageStyle>("photo_real");

  // Get user's preferred style from profile
  const { data: userStyle, isLoading } = useQuery({
    queryKey: ["user-image-style", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("preferred_image_style")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data.preferred_image_style as ImageStyle;
    },
    enabled: !!user?.id
  });

  // Update user's preferred style
  const updateStyleMutation = useMutation({
    mutationFn: async (style: ImageStyle) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("profiles")
        .update({ preferred_image_style: style })
        .eq("id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-image-style"] });
    }
  });

  // Get current preferred style (user's preference or guest preference)
  const currentStyle = user ? (userStyle || "photo_real") : guestPreference;

  // Set style preference
  const setImageStyle = (style: ImageStyle) => {
    if (user) {
      updateStyleMutation.mutate(style);
    } else {
      setGuestPreference(style);
    }
  };

  return {
    currentStyle,
    setImageStyle,
    isLoading,
    isUpdating: updateStyleMutation.isPending
  };
};

// Optimized hook to get rapper image for specific style
export const useRapperImage = (rapperId: string, preferredStyle?: ImageStyle) => {
  const { currentStyle } = useImageStyle();
  const styleToUse = preferredStyle || currentStyle;

  return useQuery({
    queryKey: ["rapper-image", rapperId, styleToUse],
    queryFn: async () => {
      // Try to get the specific style first, with fallback to photo_real, then legacy image_url
      const { data: images } = await supabase
        .from("rapper_images")
        .select("image_url, style")
        .eq("rapper_id", rapperId)
        .in("style", styleToUse !== "photo_real" ? [styleToUse, "photo_real"] : ["photo_real"]);

      // Find the preferred style first
      const preferredImage = images?.find(img => img.style === styleToUse);
      if (preferredImage?.image_url) {
        return preferredImage.image_url;
      }

      // Fallback to photo_real if we were looking for a different style
      if (styleToUse !== "photo_real") {
        const defaultImage = images?.find(img => img.style === "photo_real");
        if (defaultImage?.image_url) {
          return defaultImage.image_url;
        }
      }

      // Final fallback to the legacy image_url field
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

// Batch hook for loading multiple rapper images efficiently
export const useRapperImages = (rapperIds: string[], preferredStyle?: ImageStyle) => {
  const { currentStyle } = useImageStyle();
  const styleToUse = preferredStyle || currentStyle;

  return useQuery({
    queryKey: ["rapper-images-batch", rapperIds, styleToUse],
    queryFn: async () => {
      if (rapperIds.length === 0) return {};

      // Get all images for the requested rappers and styles
      const { data: images } = await supabase
        .from("rapper_images")
        .select("rapper_id, image_url, style")
        .in("rapper_id", rapperIds)
        .in("style", styleToUse !== "photo_real" ? [styleToUse, "photo_real"] : ["photo_real"]);

      // Get legacy image URLs for rappers that don't have styled images
      const { data: rappers } = await supabase
        .from("rappers")
        .select("id, image_url")
        .in("id", rapperIds);

      // Build the result map
      const imageMap: Record<string, string | null> = {};
      
      rapperIds.forEach(rapperId => {
        // Try to find the preferred style first
        const preferredImage = images?.find(img => img.rapper_id === rapperId && img.style === styleToUse);
        if (preferredImage?.image_url) {
          imageMap[rapperId] = preferredImage.image_url;
          return;
        }

        // Fallback to photo_real if we were looking for a different style
        if (styleToUse !== "photo_real") {
          const defaultImage = images?.find(img => img.rapper_id === rapperId && img.style === "photo_real");
          if (defaultImage?.image_url) {
            imageMap[rapperId] = defaultImage.image_url;
            return;
          }
        }

        // Final fallback to legacy image_url
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
