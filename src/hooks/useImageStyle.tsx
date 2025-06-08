
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

// Hook to get rapper image for specific style
export const useRapperImage = (rapperId: string, preferredStyle?: ImageStyle) => {
  const { currentStyle } = useImageStyle();
  const styleToUse = preferredStyle || currentStyle;

  return useQuery({
    queryKey: ["rapper-image", rapperId, styleToUse],
    queryFn: async () => {
      // First try to get the specific style
      const { data: styledImage } = await supabase
        .from("rapper_images")
        .select("image_url")
        .eq("rapper_id", rapperId)
        .eq("style", styleToUse)
        .single();

      if (styledImage?.image_url) {
        return styledImage.image_url;
      }

      // Fallback to default style (photo_real)
      if (styleToUse !== "photo_real") {
        const { data: defaultImage } = await supabase
          .from("rapper_images")
          .select("image_url")
          .eq("rapper_id", rapperId)
          .eq("style", "photo_real")
          .single();

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
    enabled: !!rapperId
  });
};
