import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy } from "lucide-react";
import AdminAchievementTable from "./AdminAchievementTable";
import AdminAchievementDialog from "./AdminAchievementDialog";
import AdminAchievementDeleteDialog from "./AdminAchievementDeleteDialog";
import AdminTabHeader from "./AdminTabHeader";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Achievement = Tables<"achievements">;

const ITEMS_PER_PAGE = 20;

const AdminAchievementManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState<Achievement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: achievements,
    isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["achievements", currentPage, searchTerm],
    queryFn: async () => {
      let query = supabase.from("achievements").select("*", {
        count: "exact"
      }).order("created_at", {
        ascending: false
      }).range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { data, count };
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  useEffect(() => {
    refetch();
  }, [currentPage, searchTerm, refetch]);

  const totalItems = achievements?.count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleEdit = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const achievement = achievements?.data?.find(a => a.id === id);
    if (achievement) {
      setAchievementToDelete(achievement);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!achievementToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", achievementToDelete.id);

      if (error) {
        throw error;
      }

      toast.success(`${achievementToDelete.name} achievement has been deleted successfully`);
      setDeleteDialogOpen(false);
      setAchievementToDelete(null);
      refetch(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting achievement:", error);
      toast.error(`Failed to delete ${achievementToDelete.name}: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogSuccess = () => {
    refetch();
    setSelectedAchievement(null);
    setDialogOpen(false);
  };

  const handleNewAchievement = () => {
    setSelectedAchievement(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <AdminTabHeader 
        title="Achievement Management" 
        icon={Trophy} 
        description="Create, edit, and manage user achievements and rewards"
      >
        <button 
          onClick={handleNewAchievement} 
          className="bg-[var(--theme-primary)] text-[var(--theme-background)] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Add New Achievement
        </button>
      </AdminTabHeader>

      <Card className="bg-[var(--theme-surface)] border border-[var(--theme-border)]">
        <CardContent className="p-6">
          <div className="mb-4">
            <Label htmlFor="search" className="text-[var(--theme-text)] font-bold">
              Search Achievements:
            </Label>
            <Input 
              type="search" 
              id="search" 
              placeholder="Search by name or description..." 
              value={searchTerm} 
              onChange={handleSearchChange} 
              className="mt-1 bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)]" 
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-[var(--theme-text)]">Loading achievements...</div>
            </div>
          ) : (
            <AdminAchievementTable 
              achievements={achievements?.data || []} 
              isLoading={isLoading} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          )}
        </CardContent>
      </Card>

      {/* Simple pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[var(--theme-surface)] text-[var(--theme-primary)] rounded disabled:opacity-50 border border-[var(--theme-border)]"
          >
            Previous
          </button>
          <span className="text-[var(--theme-text)]">
            Page {currentPage} of {totalPages} ({totalItems} total)
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[var(--theme-surface)] text-[var(--theme-primary)] rounded disabled:opacity-50 border border-[var(--theme-border)]"
          >
            Next
          </button>
        </div>
      )}

      <AdminAchievementDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        achievement={selectedAchievement} 
        onSuccess={handleDialogSuccess} 
      />
      
      <AdminAchievementDeleteDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        achievement={achievementToDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AdminAchievementManagement;