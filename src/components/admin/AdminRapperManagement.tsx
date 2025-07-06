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

const ITEMS_PER_PAGE = 20;

const AdminRapperManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rappers, isLoading, refetch, isFetching } = useQuery(
    ["rappers", currentPage, searchTerm],
    async () => {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (searchTerm) {
        query = query.ilike("username", `%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return { data, count };
    },
    { keepPreviousData: true }
  );

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

  return (
    <div className="space-y-6">
      <AdminTabHeader 
        title="Rapper Management" 
        icon={Users}
        description="Add, edit, and manage rapper profiles and information"
      >
        <AdminRapperDialog />
      </AdminTabHeader>

      <Card className="bg-carbon-fiber border border-[var(--theme-border)]">
        <CardContent className="p-6">
          <div className="mb-4">
            <Label htmlFor="search" className="text-[var(--theme-text-muted)]">
              Search Rappers:
            </Label>
            <Input
              type="search"
              id="search"
              placeholder="Enter rapper username..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="mt-1 bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)]"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-[var(--theme-text)]">Loading rappers...</div>
            </div>
          ) : (
            <AdminRapperTable rappers={rappers?.data || []} />
          )}
        </CardContent>
      </Card>

      <AdminRapperPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default AdminRapperManagement;
