
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdPlacement, PageTemplate, FormData } from "./types";

export const useAdPlacements = () => {
  const { toast } = useToast();
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
      toast({
        title: "Success",
        description: "Ad placement created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create ad placement",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Ad placement updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update ad placement",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Ad placement deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete ad placement",
        variant: "destructive",
      });
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
