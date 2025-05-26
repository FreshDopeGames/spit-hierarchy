
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import AdminRapperTable from "./AdminRapperTable";
import AdminRapperDialog from "./AdminRapperDialog";
import { useToast } from "@/hooks/use-toast";

type Rapper = Tables<"rappers">;

const AdminRapperManagement = () => {
  const [selectedRapper, setSelectedRapper] = useState<Rapper | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rappers, isLoading } = useQuery({
    queryKey: ["admin-rappers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rappers")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const deleteRapperMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("rappers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rappers"] });
      queryClient.invalidateQueries({ queryKey: ["top-rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      toast({
        title: "Success",
        description: "Rapper deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete rapper",
        variant: "destructive",
      });
    }
  });

  const handleAddRapper = () => {
    setSelectedRapper(null);
    setIsDialogOpen(true);
  };

  const handleEditRapper = (rapper: Rapper) => {
    setSelectedRapper(rapper);
    setIsDialogOpen(true);
  };

  const handleDeleteRapper = (id: string) => {
    if (confirm("Are you sure you want to delete this rapper?")) {
      deleteRapperMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedRapper(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">
          Manage Rappers ({rappers?.length || 0})
        </h3>
        <Button
          onClick={handleAddRapper}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rapper
        </Button>
      </div>

      <AdminRapperTable
        rappers={rappers || []}
        isLoading={isLoading}
        onEdit={handleEditRapper}
        onDelete={handleDeleteRapper}
      />

      <AdminRapperDialog
        rapper={selectedRapper}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
};

export default AdminRapperManagement;
