
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedButton } from "@/components/ui/themed-button";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { RapperFormData } from "../types/RapperFormTypes";
import { RapperFormFields } from "./RapperFormFields";

type Rapper = Tables<"rappers">;

interface RapperFormProps {
  rapper: Rapper | null;
  onClose: () => void;
}

export const RapperForm = ({ rapper, onClose }: RapperFormProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<RapperFormData>({
    name: "",
    real_name: "",
    origin: "",
    birth_year: "",
    bio: "",
    verified: false,
    spotify_id: "",
    instagram_handle: "",
    twitter_handle: "",
  });

  useEffect(() => {
    if (rapper) {
      setFormData({
        name: rapper.name || "",
        real_name: rapper.real_name || "",
        origin: rapper.origin || "",
        birth_year: rapper.birth_year?.toString() || "",
        bio: rapper.bio || "",
        verified: rapper.verified || false,
        spotify_id: rapper.spotify_id || "",
        instagram_handle: rapper.instagram_handle || "",
        twitter_handle: rapper.twitter_handle || "",
      });
    } else {
      setFormData({
        name: "",
        real_name: "",
        origin: "",
        birth_year: "",
        bio: "",
        verified: false,
        spotify_id: "",
        instagram_handle: "",
        twitter_handle: "",
      });
    }
  }, [rapper]);

  const saveRapperMutation = useMutation({
    mutationFn: async (data: RapperFormData) => {
      const rapperData = {
        name: data.name,
        real_name: data.real_name || null,
        origin: data.origin || null,
        birth_year: data.birth_year ? parseInt(data.birth_year) : null,
        bio: data.bio || null,
        verified: data.verified,
        spotify_id: data.spotify_id || null,
        instagram_handle: data.instagram_handle || null,
        twitter_handle: data.twitter_handle || null,
      };

      if (rapper) {
        const { error } = await supabase
          .from("rappers")
          .update(rapperData)
          .eq("id", rapper.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("rappers")
          .insert([rapperData]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rappers"] });
      queryClient.invalidateQueries({ queryKey: ["top-rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      toast({
        title: "Success",
        description: `Rapper ${rapper ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${rapper ? "update" : "create"} rapper`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Rapper name is required",
        variant: "destructive",
      });
      return;
    }
    saveRapperMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof RapperFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleVerifiedChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, verified: checked }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RapperFormFields
        formData={formData}
        onInputChange={handleInputChange}
        onVerifiedChange={handleVerifiedChange}
      />

      <div className="flex gap-3 pt-4">
        <ThemedButton
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </ThemedButton>
        <ThemedButton
          type="submit"
          disabled={saveRapperMutation.isPending}
          variant="gradient"
          className="flex-1"
        >
          {saveRapperMutation.isPending ? "Saving..." : (rapper ? "Update" : "Create")}
        </ThemedButton>
      </div>
    </form>
  );
};
