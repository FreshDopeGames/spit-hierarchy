import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import AdminRapperTable from "./AdminRapperTable";
import AdminRapperDialog from "./AdminRapperDialog";
import AdminRapperPagination from "./AdminRapperPagination";
import AdminTabHeader from "./AdminTabHeader";
import { Tables } from "@/integrations/supabase/types";
type Rapper = Tables<"rappers">;
const ITEMS_PER_PAGE = 20;
const AdminRapperManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRapper, setSelectedRapper] = useState<Rapper | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    data: rappers,
    isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["rappers", currentPage, searchTerm],
    queryFn: async () => {
      let query = supabase.from("rappers").select("*", {
        count: "exact"
      }).order("created_at", {
        ascending: false
      }).range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
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
  useEffect(() => {
    refetch();
  }, [currentPage, searchTerm, refetch]);
  const totalItems = rappers?.count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  const handleEdit = (rapper: Rapper) => {
    setSelectedRapper(rapper);
    setDialogOpen(true);
  };
  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log("Delete rapper:", id);
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
        <button onClick={handleNewRapper} className="bg-[var(--theme-primary)] text-[var(--theme-background)] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
          Add New Rapper
        </button>
      </AdminTabHeader>

      <Card className="bg-carbon-fiber border border-[var(--theme-border)]">
        <CardContent className="p-6">
          <div className="mb-4">
            <Label htmlFor="search" className="text-[var(--theme-text-muted)]">
              Search Rappers:
            </Label>
            <Input type="search" id="search" placeholder="Enter rapper name..." value={searchTerm} onChange={handleSearchChange} className="mt-1 bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] bg-rap-platinum" />
          </div>

          {isLoading ? <div className="text-center py-8">
              <div className="text-[var(--theme-text)]">Loading rappers...</div>
            </div> : <AdminRapperTable rappers={rappers?.data || []} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />}
        </CardContent>
      </Card>

      <AdminRapperPagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={handlePageChange} />

      <AdminRapperDialog open={dialogOpen} onOpenChange={setDialogOpen} rapper={selectedRapper} onSuccess={handleDialogSuccess} />
    </div>;
};
export default AdminRapperManagement;