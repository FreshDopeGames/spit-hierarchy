import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { ThemedInput as Input } from "@/components/ui/themed-input";
import { ThemedLabel as Label } from "@/components/ui/themed-label";
import { ThemedSelect as Select, ThemedSelectContent as SelectContent, ThemedSelectItem as SelectItem, ThemedSelectTrigger as SelectTrigger, ThemedSelectValue as SelectValue } from "@/components/ui/themed-select";
import { Users } from "lucide-react";
import AdminRapperTable from "./AdminRapperTable";
import AdminRapperDialog from "./AdminRapperDialog";
import AdminRapperPagination from "./AdminRapperPagination";
import AdminTabHeader from "./AdminTabHeader";
import AdminRapperDeleteDialog from "./AdminRapperDeleteDialog";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Rapper = Tables<"rappers">;

const ITEMS_PER_PAGE = 28; // 4 rappers per row × 7 rows = 28 rappers per page

const AdminRapperManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [avatarFilter, setAvatarFilter] = useState<"all" | "with_avatar" | "no_avatar">("all");
  const [selectedRapper, setSelectedRapper] = useState<Rapper | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rapperToDelete, setRapperToDelete] = useState<Rapper | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: rappers,
    isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["rappers", currentPage, searchTerm, avatarFilter],
    queryFn: async () => {
      let query = supabase
        .from("rappers")
        .select(`
          *,
          rapper_images!left(id)
        `, {
          count: "exact"
        })
        .order("created_at", {
          ascending: false
        })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);
      
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }
      
      if (avatarFilter === "no_avatar") {
        query = query.or("image_url.is.null,image_url.eq.").is("rapper_images.id", null);
      } else if (avatarFilter === "with_avatar") {
        query = query.or("image_url.not.is.null,rapper_images.id.not.is.null");
      }
      
      const {
        data,
        error,
        count
      } = await query;
      if (error) {
        throw new Error(error.message);
      }
      return {
        data,
        count
      };
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch ranking vote counts for current page rappers
  const rapperIds = rappers?.data?.map(r => r.id) || [];
  const { data: rankingVoteCounts } = useQuery({
    queryKey: ["ranking-vote-counts", rapperIds],
    queryFn: async () => {
      if (rapperIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from("ranking_votes")
        .select("rapper_id")
        .in("rapper_id", rapperIds);
      
      if (error) throw error;
      
      // Count votes per rapper
      const counts: Record<string, number> = {};
      data?.forEach(vote => {
        counts[vote.rapper_id] = (counts[vote.rapper_id] || 0) + 1;
      });
      return counts;
    },
    enabled: rapperIds.length > 0,
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    refetch();
  }, [currentPage, searchTerm, avatarFilter, refetch]);

  const totalItems = rappers?.count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleAvatarFilterChange = (value: "all" | "with_avatar" | "no_avatar") => {
    setAvatarFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleEdit = (rapper: Rapper) => {
    setSelectedRapper(rapper);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const rapper = rappers?.data?.find(r => r.id === id);
    if (rapper) {
      setRapperToDelete(rapper);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!rapperToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("rappers")
        .delete()
        .eq("id", rapperToDelete.id);

      if (error) {
        throw error;
      }

      toast.success(`${rapperToDelete.name} has been deleted successfully`);
      setDeleteDialogOpen(false);
      setRapperToDelete(null);
      refetch(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting rapper:", error);
      toast.error(`Failed to delete ${rapperToDelete.name}: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogSuccess = () => {
    refetch();
    setSelectedRapper(null);
    setDialogOpen(false);
  };

  const handleNewRapper = () => {
    setSelectedRapper(null);
    setDialogOpen(true);
  };

  return <div className="space-y-6">
      <AdminTabHeader title="Rapper Management" icon={Users} description="Add, edit, and manage rapper profiles and information">
        <button onClick={handleNewRapper} className="bg-theme-primary text-theme-background px-4 py-2 rounded-lg hover:bg-theme-primaryDark transition-colors">
          Add New Rapper
        </button>
      </AdminTabHeader>

      <Card className="bg-theme-surface border border-theme-border">
        <CardContent className="p-6">
          <div className="mb-4 space-y-4">
            <div>
              <Label htmlFor="search" className="text-theme-text font-bold">
                Search Rappers:
              </Label>
              <Input type="search" id="search" placeholder="Enter rapper name..." value={searchTerm} onChange={handleSearchChange} className="mt-1" />
            </div>
            
            <div>
              <Label className="text-theme-text font-bold">
                Filter by Avatar:
              </Label>
              <Select value={avatarFilter} onValueChange={handleAvatarFilterChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rappers</SelectItem>
                  <SelectItem value="with_avatar">With Avatar</SelectItem>
                  <SelectItem value="no_avatar">No Avatar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? <div className="text-center py-8">
              <div className="text-theme-text">Loading rappers...</div>
            </div> : <AdminRapperTable rappers={rappers?.data || []} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} rankingVoteCounts={rankingVoteCounts || {}} />}
        </CardContent>
      </Card>

      <AdminRapperPagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={handlePageChange} />

      <AdminRapperDialog open={dialogOpen} onOpenChange={setDialogOpen} rapper={selectedRapper} onSuccess={handleDialogSuccess} />
      
      <AdminRapperDeleteDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        rapper={rapperToDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>;
};

export default AdminRapperManagement;
