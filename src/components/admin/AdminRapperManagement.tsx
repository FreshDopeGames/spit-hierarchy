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
  const [sortBy, setSortBy] = useState<"alphabetical" | "rating" | "ranking_votes">("alphabetical");
  const [selectedRapper, setSelectedRapper] = useState<Rapper | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rapperToDelete, setRapperToDelete] = useState<Rapper | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all ranking vote counts upfront for sorting
  const { data: allRankingVoteCounts } = useQuery({
    queryKey: ["all-ranking-vote-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ranking_votes")
        .select("rapper_id");
      
      if (error) throw error;
      
      // Count votes per rapper
      const counts: Record<string, number> = {};
      data?.forEach(vote => {
        counts[vote.rapper_id] = (counts[vote.rapper_id] || 0) + 1;
      });
      return counts;
    },
    staleTime: 5 * 60 * 1000
  });

  const {
    data: rappers,
    isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["rappers", currentPage, searchTerm, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("rappers")
        .select(`*`, { count: "exact" });
      
      // Apply sorting based on sortBy (except ranking_votes which is client-side)
      if (sortBy === "alphabetical") {
        query = query.order("name", { ascending: true });
      } else if (sortBy === "rating") {
        query = query.order("average_rating", { ascending: false, nullsFirst: false });
      } else {
        // For ranking_votes, we'll fetch all and sort client-side, then paginate
        query = query.order("name", { ascending: true });
      }
      
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }
      
      // Only apply server-side pagination for non-ranking_votes sorts
      if (sortBy !== "ranking_votes") {
        query = query.range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);
      }
      
      const { data, error, count } = await query;
      if (error) {
        throw new Error(error.message);
      }
      
      // For ranking_votes sort, do client-side sorting and pagination
      if (sortBy === "ranking_votes" && data && allRankingVoteCounts) {
        const sorted = [...data].sort((a, b) => {
          const aVotes = allRankingVoteCounts[a.id] || 0;
          const bVotes = allRankingVoteCounts[b.id] || 0;
          return bVotes - aVotes; // Descending
        });
        const paginated = sorted.slice(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE
        );
        return { data: paginated, count };
      }
      
      return { data, count };
    },
    staleTime: 5 * 60 * 1000,
    enabled: sortBy !== "ranking_votes" || !!allRankingVoteCounts
  });

  // Get ranking vote counts for current page rappers (for display)
  const rapperIds = rappers?.data?.map(r => r.id) || [];
  const rankingVoteCounts = rapperIds.reduce((acc, id) => {
    acc[id] = allRankingVoteCounts?.[id] || 0;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    refetch();
  }, [currentPage, searchTerm, sortBy, refetch]);

  const totalItems = rappers?.count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleSortChange = (value: "alphabetical" | "rating" | "ranking_votes") => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page on sort change
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
                Sort By:
              </Label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
                  <SelectItem value="rating">Rating (Highest First)</SelectItem>
                  <SelectItem value="ranking_votes">Ranking Votes (Most First)</SelectItem>
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
