
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminRankingsTable from "./AdminRankingsTable";
import AdminRankingDialog from "./AdminRankingDialog";

const AdminRankingsManagement = () => {
  const [editingRanking, setEditingRanking] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rankings, isLoading } = useQuery({
    queryKey: ["admin-rankings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("official_rankings")
        .select(`
          *,
          ranking_tag_assignments (
            tag_id,
            ranking_tags (
              id,
              name,
              slug,
              color
            )
          )
        `)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const deleteRankingMutation = useMutation({
    mutationFn: async (rankingId: string) => {
      const { error } = await supabase
        .from("official_rankings")
        .delete()
        .eq("id", rankingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rankings"] });
      toast({
        title: "Success",
        description: "Ranking deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to delete ranking",
        variant: "destructive"
      });
      console.error("Error deleting ranking:", error);
    }
  });

  const handleEdit = (ranking: any) => {
    setEditingRanking(ranking);
    setEditDialogOpen(true);
  };

  const handleDelete = (ranking: any) => {
    if (confirm(`Are you sure you want to delete "${ranking.title}"? This action cannot be undone.`)) {
      deleteRankingMutation.mutate(ranking.id);
    }
  };

  const handleRankingCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-rankings"] });
    setEditingRanking(null);
    setEditDialogOpen(false);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingRanking(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-carbon-fiber border border-rap-gold/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-rap-gold" />
              <CardTitle className="text-rap-gold font-mogra text-xl font-medium sm:text-3xl">
                Rankings Management
              </CardTitle>
            </div>
            <AdminRankingDialog onRankingCreated={handleRankingCreated} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-rap-platinum">Loading rankings...</div>
            </div>
          ) : (
            <AdminRankingsTable 
              rankings={rankings || []} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog - No trigger button needed since we open it programmatically */}
      <AdminRankingDialog 
        ranking={editingRanking}
        onRankingCreated={handleRankingCreated}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
        showTrigger={false}
      />
    </div>
  );
};

export default AdminRankingsManagement;
