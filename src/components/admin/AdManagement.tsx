import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdPlacementForm from "./ad/AdPlacementForm";
import AdPlacementList from "./ad/AdPlacementList";
import AdManagementHeader from "./ad/AdManagementHeader";

interface AdPlacement {
  id: string;
  placement_name: string;
  ad_unit_id: string;
  ad_format: "banner" | "leaderboard" | "rectangle" | "mobile-banner";
  page_name: string;
  page_route: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  placement_name: string;
  ad_unit_id: string;
  ad_format: "banner" | "leaderboard" | "rectangle" | "mobile-banner";
  page_name: string;
  page_route: string;
  is_active: boolean;
}

const AdManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<AdPlacement | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: placements, isLoading } = useQuery({
    queryKey: ["ad-placements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_placements")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as AdPlacement[];
    }
  });

  const { data: templates } = useQuery({
    queryKey: ["page-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_templates")
        .select("*")
        .order("template_name");
      
      if (error) throw error;
      return data;
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
      setShowForm(false);
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
      setEditingPlacement(null);
      setShowForm(false);
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

  const handleSubmit = (data: FormData) => {
    if (editingPlacement) {
      updateMutation.mutate({ ...data, id: editingPlacement.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (placement: AdPlacement) => {
    setEditingPlacement(placement);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this ad placement?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlacement(null);
  };

  return (
    <div className="space-y-6">
      <AdManagementHeader
        onCreateNew={() => setShowForm(true)}
        showForm={showForm}
      />

      {showForm && (
        <Card className="bg-carbon-fiber border-rap-gold/30">
          <CardHeader>
            <CardTitle className="text-rap-gold">
              {editingPlacement ? "Edit Ad Placement" : "Create New Ad Placement"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdPlacementForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              initialData={editingPlacement}
              templates={templates || []}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      <AdPlacementList
        placements={placements || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdManagement;
