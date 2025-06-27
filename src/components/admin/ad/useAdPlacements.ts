import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdPlacement, PageTemplate, FormData } from "./types";

export const useAdPlacements = () => {
  const queryClient = useQueryClient();

  const { data: placements, isLoading } = useQuery({
    queryKey: ["ad-placements"],
    queryFn: async () => {
      const { data, error } =  await supabase
        .from("ad_placements")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as AdPlacement[];
    }
  });

  const { data: pageTemplates } = useQuery({
    queryKey: ["page-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_templates")
        .select("*")
        .order("template_name");
      
      if (error) throw error;
      return data as PageTemplate[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data, error } = await supabase
        .from("ad_placements")
        .insert([formData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-placements"] });
      toast.success("Ad placement created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create ad placement");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...formData }: FormData & { id: string }) => {
      const { data, error } = await supabase
        .from("ad_placements")
        .update(formData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-placements"] });
      toast.success("Ad placement updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update ad placement");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ad_placements")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-placements"] });
      toast.success("Ad placement deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete ad placement");
    }
  });

  return {
    placements,
    pageTemplates,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation
  };
};
