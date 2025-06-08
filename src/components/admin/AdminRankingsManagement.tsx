
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AdminRankingsTable from "./AdminRankingsTable";
import AdminRankingDialog from "./AdminRankingDialog";

const AdminRankingsManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRanking, setEditingRanking] = useState(null);
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
        description: "Ranking deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete ranking",
        variant: "destructive",
      });
      console.error("Error deleting ranking:", error);
    }
  });

  const handleCreate = () => {
    setEditingRanking(null);
    setDialogOpen(true);
  };

  const handleEdit = (ranking: any) => {
    setEditingRanking(ranking);
    setDialogOpen(true);
  };

  const handleDelete = (ranking: any) => {
    if (confirm(`Are you sure you want to delete "${ranking.title}"? This action cannot be undone.`)) {
      deleteRankingMutation.mutate(ranking.id);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-carbon-fiber border border-rap-gold/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-rap-gold" />
              <CardTitle className="text-rap-gold font-mogra text-2xl">
                Rankings Management
              </CardTitle>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-rap-gold text-rap-carbon hover:bg-rap-gold-light font-kaushan"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Ranking
            </Button>
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

      <AdminRankingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ranking={editingRanking}
        onSuccess={() => {
          setDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ["admin-rankings"] });
        }}
      />
    </div>
  );
};

export default AdminRankingsManagement;
