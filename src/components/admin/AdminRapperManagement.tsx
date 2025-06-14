
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import AdminRapperTable from "./AdminRapperTable";
import AdminRapperDialog from "./AdminRapperDialog";
import AdminRapperPagination from "./AdminRapperPagination";
import { useToast } from "@/hooks/use-toast";

type Rapper = Tables<"rappers">;

const ITEMS_PER_PAGE = 20;

const AdminRapperManagement = () => {
  const [selectedRapper, setSelectedRapper] = useState<Rapper | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for total count
  const { data: totalCount } = useQuery({
    queryKey: ["admin-rappers-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("rappers")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Query for paginated rappers
  const { data: rappers, isLoading } = useQuery({
    queryKey: ["admin-rappers", currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error } = await supabase
        .from("rappers")
        .select("*")
        .order("name", { ascending: true })
        .range(from, to);
      
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
      queryClient.invalidateQueries({ queryKey: ["admin-rappers-count"] });
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
    // Refresh the queries to get updated data
    queryClient.invalidateQueries({ queryKey: ["admin-rappers"] });
    queryClient.invalidateQueries({ queryKey: ["admin-rappers-count"] });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-rap-platinum">
          Manage Rappers ({totalCount || 0})
        </h3>
        <Button
          onClick={handleAddRapper}
          className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra"
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

      {totalCount && totalCount > ITEMS_PER_PAGE && (
        <AdminRapperPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      )}

      <AdminRapperDialog
        rapper={selectedRapper}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
};

export default AdminRapperManagement;
